import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

ROOT_DIR = Path(__file__).resolve().parent.parent.parent
ENV_FILE = ROOT_DIR / ".env"

class Settings(BaseSettings):
    OPENAI_API_KEY: str = ""
    GROK_API_KEY: str = ""
    GEMINI_API_KEY: str = ""

    # Primary model set to ultra-fast Groq LPU model
    DEFAULT_MODEL: str = "qwen/qwen3.8-27b"
    OPENAI_MODEL: str = "qwen/qwen3.8-27b"
    OPENAI_FAST_MODEL: str = "qwen/qwen3.8-27b"
    OPENAI_IMAGE_MODEL: str = "dall-e-3"
    
    DATABASE_URL: str = f"sqlite:////tmp/svizzgpt.db" if os.environ.get("VERCEL") else f"sqlite:///{ROOT_DIR / 'svizzgpt.db'}"
    
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173"
    
    TAVILY_API_KEY: str = ""
    
    model_config = SettingsConfigDict(
        env_file=str(ENV_FILE) if ENV_FILE.exists() else None,
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

settings = Settings()
