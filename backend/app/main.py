import os
import logging
from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import init_db
from app.routers import chat, images, files, conversations, settings as settings_router, usage

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("svizzgpt")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB tables
    logger.info("Initializing SvizzGPT database schema...")
    init_db()
    logger.info("SvizzGPT ready.")
    yield
    logger.info("SvizzGPT shutting down.")

app = FastAPI(
    title="SVIZZGPT API",
    description="Multimodal AI System API Engine",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=".*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Attach API Routers
app.include_router(chat.router)
app.include_router(images.router)
app.include_router(files.router)
app.include_router(conversations.router)
app.include_router(settings_router.router)
app.include_router(usage.router)

# Static file downloads
UPLOAD_DIR = Path("/tmp/uploads") if os.environ.get("VERCEL") else Path(__file__).resolve().parent.parent / "data" / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

@app.get("/api/files/download/{filename}")
async def download_file(filename: str):
    file_path = UPLOAD_DIR / filename
    if not file_path.exists():
        return JSONResponse(status_code=404, content={"error": "File not found"})
    return FileResponse(path=file_path, filename=filename)

@app.get("/api/health")
async def health_check():
    key_configured = bool(settings.OPENAI_API_KEY and not settings.OPENAI_API_KEY.startswith("your_openai"))
    return {
        "status": "online",
        "service": "SVIZZGPT CORE",
        "api_key_configured": key_configured,
        "default_model": settings.OPENAI_MODEL,
        "image_model": settings.OPENAI_IMAGE_MODEL
    }

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "SVIZZGPT_SYSTEM_FAULT",
            "message": str(exc),
            "type": exc.__class__.__name__
        }
    )
