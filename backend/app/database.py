from sqlmodel import SQLModel, create_engine, Session
from app.config import settings
import os

# Ensure data directory exists
if settings.DATABASE_URL.startswith("sqlite"):
    db_path = settings.DATABASE_URL.replace("sqlite:///", "")
    os.makedirs(os.path.dirname(os.path.abspath(db_path)), exist_ok=True)

connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    settings.DATABASE_URL,
    echo=False,
    connect_args=connect_args
)

def init_db():
    SQLModel.metadata.create_all(engine)
    # Seed default user settings if not present
    with Session(engine) as session:
        from app.models import UserSettings
        existing = session.get(UserSettings, "default")
        if not existing:
            default_settings = UserSettings(id="default")
            session.add(default_settings)
            session.commit()

def get_session():
    with Session(engine) as session:
        yield session
