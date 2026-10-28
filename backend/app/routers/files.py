import os
import base64
import logging
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.file_extractor import extract_text_from_file

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/files", tags=["Files"])

MAX_FILE_SIZE = 25 * 1024 * 1024 # 25MB max

UPLOAD_DIR = Path("/tmp/uploads") if os.environ.get("VERCEL") else Path(__file__).resolve().parent.parent.parent / "data" / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_EXTENSIONS = {
    # Documents
    "pdf", "txt", "md", "markdown", "csv", "tsv", "json", "docx",
    # Code
    "py", "js", "ts", "tsx", "jsx", "html", "css", "sql", "sh", "yml", "yaml", "env", "toml", "rs", "cpp", "c", "java", "go",
    # Images
    "png", "jpg", "jpeg", "webp", "gif"
}

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """
    Handles secure file upload, extracts text for documents/code,
    and base64-encodes images for OpenAI Vision.
    """
    try:
        filename = file.filename or "uploaded_file"
        ext = filename.lower().split('.')[-1] if '.' in filename else ''

        if ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file format: .{ext}. Supported formats: PDF, TXT, CSV, JSON, Markdown, Code files, PNG, JPG, WEBP."
            )

        contents = await file.read()
        file_size = len(contents)

        if file_size > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"File exceeds maximum size limit of 25MB (File size: {file_size / (1024*1024):.1f}MB)."
            )

        mime_type = file.content_type or "application/octet-stream"
        
        # Extract text & classify
        extracted_text, file_category = extract_text_from_file(contents, filename, mime_type)

        # For images, build base64 Data URL for vision models
        data_url = None
        if file_category == "image":
            b64_str = base64.b64encode(contents).decode("utf-8")
            data_url = f"data:{mime_type};base64,{b64_str}"

        # Save to local uploads disk
        safe_filename = f"{os.urandom(8).hex()}_{filename}"
        saved_path = UPLOAD_DIR / safe_filename
        with open(saved_path, "wb") as f:
            f.write(contents)

        return {
            "success": True,
            "filename": filename,
            "file_type": file_category,
            "mime_type": mime_type,
            "file_size": file_size,
            "extracted_text": extracted_text,
            "data_url": data_url,
            "url": f"/api/files/download/{safe_filename}"
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Upload error: {e}")
        raise HTTPException(status_code=500, detail=f"File processing error: {str(e)}")
