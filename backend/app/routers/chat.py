import json
import logging
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlmodel import Session, select
from datetime import datetime, timezone

from app.database import get_session
from app.models import ChatRequest, Conversation, Message, UsageLog
from app.providers.openai_provider import UnifiedMultiProvider
from app.services.web_search import WebSearchService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/chat", tags=["Chat"])
provider = UnifiedMultiProvider()

@router.post("/stream")
async def stream_chat(
    payload: ChatRequest,
    session: Session = Depends(get_session)
):
    """
    Streams LLM responses with real SSE events for tokens, status indicators,
    citations, and token usage logs.
    """
    # 1. Ensure conversation exists in DB or create one
    conversation_id = payload.conversation_id
    if conversation_id:
        conv = session.get(Conversation, conversation_id)
        if not conv:
            conv = Conversation(id=conversation_id, model=payload.model or "gpt-4o")
            session.add(conv)
            session.commit()
    else:
        conv = Conversation(model=payload.model or "gpt-4o")
        session.add(conv)
        session.commit()
        session.refresh(conv)
        conversation_id = conv.id

    # 2. Extract last user message
    messages_data = [msg.model_dump() for msg in payload.messages]
    last_user_msg = messages_data[-1] if messages_data and messages_data[-1]["role"] == "user" else None

    # Auto-generate conversation title from first user message if default
    if last_user_msg and conv.title == "New Conversation":
        prompt_text = last_user_msg.get("content", "")
        if prompt_text:
            conv.title = prompt_text[:40].strip() + ("..." if len(prompt_text) > 40 else "")
            conv.updated_at = datetime.now(timezone.utc)
            session.add(conv)
            session.commit()

    # 3. Handle Web Search if requested or relevant
    citations = None
    if payload.web_search and last_user_msg:
        query = last_user_msg.get("content", "")
        if query:
            search_results = WebSearchService.search(query)
            if search_results:
                citations = search_results
                search_context = WebSearchService.format_search_context(search_results)
                # Inject search context into user prompt
                last_user_msg["content"] = f"{last_user_msg['content']}\n\n{search_context}"

    async def event_generator():
        # First send the assigned conversation_id
        yield f"data: {json.dumps({'type': 'init', 'data': {'conversation_id': conversation_id}})}\n\n"

        full_assistant_content = ""
        usage_data = None
        error_occurred = None

        try:
            async for chunk in provider.stream_response(
                messages=messages_data,
                model=payload.model,
                temperature=payload.temperature or 0.7,
                system_prompt=payload.system_prompt,
                citations=citations
            ):
                chunk_type = chunk.get("type")
                
                if chunk_type == "token":
                    full_assistant_content += chunk.get("data", "")
                elif chunk_type == "usage":
                    usage_data = chunk.get("data")
                elif chunk_type == "error":
                    error_occurred = chunk.get("data")

                yield f"data: {json.dumps(chunk)}\n\n"

        except Exception as e:
            error_occurred = str(e)
            yield f"data: {json.dumps({'type': 'error', 'data': str(e)})}\n\n"

        # Save assistant message & usage in database
        try:
            from app.database import engine
            with Session(engine) as save_session:
                # Save User message if not already saved
                if last_user_msg:
                    user_db_msg = Message(
                        conversation_id=conversation_id,
                        role="user",
                        content=payload.messages[-1].content,
                        model=payload.model
                    )
                    save_session.add(user_db_msg)

                # Save Assistant message
                asst_db_msg = Message(
                    conversation_id=conversation_id,
                    role="assistant",
                    content=full_assistant_content,
                    model=payload.model or "gpt-4o",
                    status="error" if error_occurred else "completed",
                    error_message=error_occurred,
                    metadata_json={"citations": citations} if citations else {}
                )
                save_session.add(asst_db_msg)

                # Record Usage Log
                if usage_data:
                    log = UsageLog(
                        conversation_id=conversation_id,
                        model=usage_data.get("model", "gpt-4o"),
                        input_tokens=usage_data.get("input_tokens", 0),
                        output_tokens=usage_data.get("output_tokens", 0),
                        total_tokens=usage_data.get("total_tokens", 0),
                        estimated_cost_usd=usage_data.get("estimated_cost", 0.0),
                        action_type="web_search" if payload.web_search else "chat"
                    )
                    save_session.add(log)

                # Update conversation timestamp
                conv_db = save_session.get(Conversation, conversation_id)
                if conv_db:
                    conv_db.updated_at = datetime.now(timezone.utc)
                    save_session.add(conv_db)

                save_session.commit()
        except Exception as db_err:
            logger.error(f"Error persisting message to DB: {db_err}")

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )

@router.post("")
async def non_streaming_chat(
    payload: ChatRequest,
    session: Session = Depends(get_session)
):
    """Non-streaming complete chat response."""
    messages_data = [msg.model_dump() for msg in payload.messages]
    try:
        result = await provider.generate_text(
            messages=messages_data,
            model=payload.model,
            temperature=payload.temperature or 0.7,
            system_prompt=payload.system_prompt
        )
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
