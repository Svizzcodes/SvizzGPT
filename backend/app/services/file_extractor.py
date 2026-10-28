import io
import csv
import json
import logging
from pypdf import PdfReader
from typing import Tuple

logger = logging.getLogger(__name__)

def extract_text_from_file(file_bytes: bytes, filename: str, mime_type: str, max_chars: int = 40000) -> Tuple[str, str]:
    """
    Extracts readable text from uploaded documents, PDFs, CSVs, and code files.
    Returns: (extracted_text, file_category)
    """
    ext = filename.lower().split('.')[-1] if '.' in filename else ''
    extracted_text = ""
    file_category = "document"

    try:
        # PDF Extraction
        if ext == "pdf" or "pdf" in mime_type:
            file_category = "document"
            reader = PdfReader(io.BytesIO(file_bytes))
            pages_text = []
            for i, page in enumerate(reader.pages):
                text = page.extract_text() or ""
                if text.strip():
                    pages_text.append(f"--- [Page {i+1}] ---\n{text.strip()}")
            extracted_text = "\n\n".join(pages_text)

        # CSV / Tabular Extraction
        elif ext in ["csv", "tsv"]:
            file_category = "data"
            text_stream = io.StringIO(file_bytes.decode('utf-8', errors='replace'))
            delimiter = '\t' if ext == 'tsv' else ','
            reader = csv.reader(text_stream, delimiter=delimiter)
            rows = []
            for i, row in enumerate(reader):
                if i < 200: # Limit rows for reasonable context
                    rows.append(" | ".join(row))
                else:
                    rows.append(f"... [Truncated remaining rows for brevity]")
                    break
            extracted_text = "\n".join(rows)

        # JSON Extraction
        elif ext == "json" or "json" in mime_type:
            file_category = "data"
            raw_str = file_bytes.decode('utf-8', errors='replace')
            try:
                parsed = json.loads(raw_str)
                extracted_text = json.dumps(parsed, indent=2)
            except Exception:
                extracted_text = raw_str

        # Code / Text / Markdown / Config
        elif ext in ["txt", "md", "markdown", "py", "js", "ts", "tsx", "jsx", "html", "css", "sql", "sh", "yml", "yaml", "env", "toml", "rs", "cpp", "c", "java", "go"]:
            file_category = "code" if ext not in ["txt", "md"] else "document"
            extracted_text = file_bytes.decode('utf-8', errors='replace')

        # Images
        elif ext in ["jpg", "jpeg", "png", "webp", "gif", "bmp"]:
            file_category = "image"
            extracted_text = f"[Image file: {filename}]"

        else:
            file_category = "other"
            extracted_text = file_bytes.decode('utf-8', errors='replace')

    except Exception as e:
        logger.error(f"Error extracting text from {filename}: {str(e)}")
        extracted_text = f"[Failed to extract text: {str(e)}]"

    # Truncate if exceeds max_chars
    if len(extracted_text) > max_chars:
        extracted_text = extracted_text[:max_chars] + f"\n\n... [Content truncated at {max_chars} characters]"

    return extracted_text, file_category
