import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from datetime import datetime, timezone

from app.database import get_session
from app.models import ImageGenerationRequest, Conversation, Message, Attachment, UsageLog
from app.providers.openai_provider import UnifiedMultiProvider

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/images", tags=["Images"])
provider = UnifiedMultiProvider()

@router.post("/generate")
async def generate_image(
    payload: ImageGenerationRequest,
    session: Session = Depends(get_session)
):
    """
    Generates an image using OpenAI DALL-E-3 and returns the image URL and details.
    Persists message and attachment if conversation_id is provided.
    """
    try:
        result = await provider.generate_image(
            prompt=payload.prompt,
            size=payload.size or "1024x1024",
            quality=payload.quality or "standard",
            model=payload.model or "dall-e-3"
        )

        conversation_id = payload.conversation_id
        if conversation_id:
            conv = session.get(Conversation, conversation_id)
            if not conv:
                conv = Conversation(id=conversation_id, title=f"Image: {payload.prompt[:30]}...")
                session.add(conv)
                session.commit()

            # Save user prompt
            user_msg = Message(
                conversation_id=conversation_id,
                role="user",
                content=f"/image {payload.prompt}"
            )
            session.add(user_msg)
            session.commit()
            session.refresh(user_msg)

            # Save assistant response with attachment
            asst_msg = Message(
                conversation_id=conversation_id,
                role="assistant",
                content=f"Generated image based on: *{result.get('revised_prompt', payload.prompt)}*",
                model=result.get("model", "dall-e-3"),
                status="completed"
            )
            session.add(asst_msg)
            session.commit()
            session.refresh(asst_msg)

            # Attach generated image
            attachment = Attachment(
                message_id=asst_msg.id,
                filename=f"dalle3_{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}.png",
                file_type="image",
                mime_type="image/png",
                file_size=1024 * 1024, # estimate
                url=result.get("url")
            )
            session.add(attachment)

            # Log usage
            usage = UsageLog(
                conversation_id=conversation_id,
                model=result.get("model", "dall-e-3"),
                input_tokens=0,
                output_tokens=0,
                total_tokens=0,
                estimated_cost_usd=result.get("cost", 0.04),
                action_type="image_gen"
            )
            session.add(usage)
            session.commit()

        return {
            "success": True,
            "data": result,
            "conversation_id": conversation_id
        }

    except Exception as e:
        logger.error(f"Image generation failed: {e}")
        raise HTTPException(status_code=400, detail=str(e))
