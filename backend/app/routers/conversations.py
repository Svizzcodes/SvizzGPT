import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from datetime import datetime, timezone

from app.database import get_session
from app.models import Conversation, Message, Attachment, ConversationCreate, ConversationUpdate

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/conversations", tags=["Conversations"])

@router.get("")
def list_conversations(session: Session = Depends(get_session)):
    """List all conversations ordered by pinned and last updated time."""
    statement = select(Conversation).order_by(Conversation.is_pinned.desc(), Conversation.updated_at.desc())
    results = session.exec(statement).all()
    
    # Enrich with message count
    enriched = []
    for conv in results:
        msg_count = len(conv.messages)
        enriched.append({
            "id": conv.id,
            "title": conv.title,
            "model": conv.model,
            "is_pinned": conv.is_pinned,
            "message_count": msg_count,
            "created_at": conv.created_at.isoformat(),
            "updated_at": conv.updated_at.isoformat()
        })
    return {"conversations": enriched}

@router.post("")
def create_conversation(payload: ConversationCreate, session: Session = Depends(get_session)):
    """Create a new conversation session."""
    conv = Conversation(
        title=payload.title or "New Conversation",
        model=payload.model or "gpt-4o",
        system_prompt=payload.system_prompt
    )
    session.add(conv)
    session.commit()
    session.refresh(conv)
    return {"success": True, "conversation": conv}

@router.get("/{conversation_id}")
def get_conversation(conversation_id: str, session: Session = Depends(get_session)):
    """Retrieve full conversation and all its messages."""
    conv = session.get(Conversation, conversation_id)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    # Fetch messages in chronological order
    statement = select(Message).where(Message.conversation_id == conversation_id).order_by(Message.created_at.asc())
    messages = session.exec(statement).all()

    formatted_messages = []
    for msg in messages:
        # Load attachments
        attachments_data = []
        for att in msg.attachments:
            attachments_data.append({
                "id": att.id,
                "filename": att.filename,
                "file_type": att.file_type,
                "mime_type": att.mime_type,
                "file_size": att.file_size,
                "url": att.url
            })

        formatted_messages.append({
            "id": msg.id,
            "role": msg.role,
            "content": msg.content,
            "model": msg.model,
            "status": msg.status,
            "error_message": msg.error_message,
            "is_focused": msg.is_focused,
            "is_liked": msg.is_liked,
            "metadata": msg.metadata_json or {},
            "created_at": msg.created_at.isoformat(),
            "attachments": attachments_data
        })

    return {
        "conversation": {
            "id": conv.id,
            "title": conv.title,
            "model": conv.model,
            "is_pinned": conv.is_pinned,
            "created_at": conv.created_at.isoformat(),
            "updated_at": conv.updated_at.isoformat(),
        },
        "messages": formatted_messages
    }

@router.patch("/{conversation_id}")
def update_conversation(
    conversation_id: str,
    payload: ConversationUpdate,
    session: Session = Depends(get_session)
):
    """Update title, pinned status, or model."""
    conv = session.get(Conversation, conversation_id)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    if payload.title is not None:
        conv.title = payload.title
    if payload.is_pinned is not None:
        conv.is_pinned = payload.is_pinned
    if payload.model is not None:
        conv.model = payload.model
    if payload.system_prompt is not None:
        conv.system_prompt = payload.system_prompt
    
    conv.updated_at = datetime.now(timezone.utc)
    session.add(conv)
    session.commit()
    session.refresh(conv)
    return {"success": True, "conversation": conv}

@router.delete("/{conversation_id}")
def delete_conversation(conversation_id: str, session: Session = Depends(get_session)):
    """Delete a conversation and its messages."""
    conv = session.get(Conversation, conversation_id)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    session.delete(conv)
    session.commit()
    return {"success": True, "message": "Conversation deleted"}

@router.delete("")
def delete_all_conversations(session: Session = Depends(get_session)):
    """Clear all conversation history."""
    statement = select(Conversation)
    convs = session.exec(statement).all()
    for c in convs:
        session.delete(c)
    session.commit()
    return {"success": True, "message": "All conversations deleted"}

# Message Actions
@router.patch("/messages/{message_id}")
def update_message(
    message_id: str,
    updates: dict,
    session: Session = Depends(get_session)
):
    """Update message like/dislike, focus, or content."""
    msg = session.get(Message, message_id)
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")

    if "is_liked" in updates:
        msg.is_liked = updates["is_liked"]
    if "is_focused" in updates:
        msg.is_focused = updates["is_focused"]
    if "content" in updates:
        msg.content = updates["content"]

    session.add(msg)
    session.commit()
    return {"success": True, "message_id": msg.id}

@router.delete("/messages/{message_id}")
def delete_message(message_id: str, session: Session = Depends(get_session)):
    """Delete a single message."""
    msg = session.get(Message, message_id)
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")
    session.delete(msg)
    session.commit()
    return {"success": True}
