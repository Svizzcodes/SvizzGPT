import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from datetime import datetime, timezone

from app.database import get_session
from app.models import UserSettings

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/settings", tags=["Settings"])

@router.get("")
def get_user_settings(session: Session = Depends(get_session)):
    """Fetch current user appearance and AI preferences."""
    settings_obj = session.get(UserSettings, "default")
    if not settings_obj:
        settings_obj = UserSettings(id="default")
        session.add(settings_obj)
        session.commit()
        session.refresh(settings_obj)
    return {"settings": settings_obj}

@router.patch("")
def update_user_settings(updates: dict, session: Session = Depends(get_session)):
    """Update settings (theme, ascii wallpaper, animations, default model, etc.)."""
    settings_obj = session.get(UserSettings, "default")
    if not settings_obj:
        settings_obj = UserSettings(id="default")
        session.add(settings_obj)

    allowed_fields = {
        "theme", "ascii_wallpaper", "ascii_intensity", "ascii_speed",
        "crt_effect", "scanline_effect", "pixel_noise", "reduced_motion",
        "default_model", "web_search_enabled", "enter_to_send",
        "stream_responses", "system_instructions"
    }

    for key, value in updates.items():
        if key in allowed_fields:
            setattr(settings_obj, key, value)

    settings_obj.updated_at = datetime.now(timezone.utc)
    session.add(settings_obj)
    session.commit()
    session.refresh(settings_obj)
    return {"success": True, "settings": settings_obj}
