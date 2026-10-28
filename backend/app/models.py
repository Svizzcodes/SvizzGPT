from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from sqlmodel import SQLModel, Field, Relationship, JSON, Column
import uuid

def utc_now():
    return datetime.now(timezone.utc)

class ConversationBase(SQLModel):
    title: str = "New Conversation"
    model: str = "gpt-4o"
    system_prompt: Optional[str] = None
    is_pinned: bool = False

class Conversation(ConversationBase, table=True):
    __tablename__ = "conversations"
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now)
    
    messages: List["Message"] = Relationship(back_populates="conversation", cascade_delete=True)

class MessageBase(SQLModel):
    role: str # "user", "assistant", "system"
    content: str
    model: Optional[str] = None
    status: Optional[str] = "completed" # "streaming", "completed", "error"
    error_message: Optional[str] = None
    is_focused: bool = False
    is_liked: Optional[bool] = None

class Message(MessageBase, table=True):
    __tablename__ = "messages"
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    conversation_id: str = Field(foreign_key="conversations.id", index=True)
    metadata_json: Optional[Dict[str, Any]] = Field(default={}, sa_column=Column(JSON))
    created_at: datetime = Field(default_factory=utc_now)
    
    conversation: Optional[Conversation] = Relationship(back_populates="messages")
    attachments: List["Attachment"] = Relationship(back_populates="message", cascade_delete=True)

class AttachmentBase(SQLModel):
    filename: str
    file_type: str # "image", "document", "code", "other"
    mime_type: str
    file_size: int
    url: Optional[str] = None
    extracted_text: Optional[str] = None

class Attachment(AttachmentBase, table=True):
    __tablename__ = "attachments"
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    message_id: Optional[str] = Field(default=None, foreign_key="messages.id", index=True)
    created_at: datetime = Field(default_factory=utc_now)
    
    message: Optional[Message] = Relationship(back_populates="attachments")

class UsageLog(SQLModel, table=True):
    __tablename__ = "usage_logs"
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    conversation_id: Optional[str] = Field(default=None, index=True)
    model: str
    input_tokens: int = 0
    output_tokens: int = 0
    total_tokens: int = 0
    estimated_cost_usd: float = 0.0
    action_type: str = "chat" # "chat", "vision", "image_gen", "web_search"
    created_at: datetime = Field(default_factory=utc_now)

class UserSettings(SQLModel, table=True):
    __tablename__ = "user_settings"
    
    id: str = Field(default="default", primary_key=True)
    theme: str = "mono" # "mono", "amber", "cyan", "emerald", "crimson", "violet", "gold"
    ascii_wallpaper: str = "grid" # "grid", "particles", "rain", "topographic", "signal", "noise", "void"
    ascii_intensity: float = 0.8
    ascii_speed: float = 1.0
    crt_effect: bool = False
    scanline_effect: bool = False
    pixel_noise: bool = False
    reduced_motion: bool = False
    default_model: str = "gpt-4o"
    web_search_enabled: bool = False
    enter_to_send: bool = True
    stream_responses: bool = True
    system_instructions: Optional[str] = None
    updated_at: datetime = Field(default_factory=utc_now)

# Pydantic Schemas for API Requests / Responses

class ChatMessagePayload(SQLModel):
    role: str
    content: str
    attachments: Optional[List[Dict[str, Any]]] = None

class ChatRequest(SQLModel):
    conversation_id: Optional[str] = None
    messages: List[ChatMessagePayload]
    model: Optional[str] = None
    web_search: Optional[bool] = False
    temperature: Optional[float] = 0.7
    system_prompt: Optional[str] = None

class ImageGenerationRequest(SQLModel):
    prompt: str
    size: Optional[str] = "1024x1024"
    quality: Optional[str] = "standard"
    model: Optional[str] = "dall-e-3"
    conversation_id: Optional[str] = None

class ConversationCreate(SQLModel):
    title: Optional[str] = "New Conversation"
    model: Optional[str] = "gpt-4o"
    system_prompt: Optional[str] = None

class ConversationUpdate(SQLModel):
    title: Optional[str] = None
    model: Optional[str] = None
    is_pinned: Optional[bool] = None
    system_prompt: Optional[str] = None
