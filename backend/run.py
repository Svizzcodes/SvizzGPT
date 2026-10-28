import uvicorn
import sys
from pathlib import Path

# Add backend to sys.path
backend_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(backend_dir))

from app.config import settings

if __name__ == "__main__":
    print(f"==================================================")
    print(f"             SVIZZGPT BACKEND ENGINE              ")
    print(f"   Listening on: http://{settings.HOST}:{settings.PORT}   ")
    print(f"==================================================")
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True
    )
