import asyncio
import os
from pathlib import Path
import httpx
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

async def test_latest():
    api_key = os.getenv("GEMINI_API_KEY")
    candidates = ["gemini-3.8-flash", "gemini-3.7-flash", "gemini-3.5-flash", "gemini-flash-latest", "gemini-pro-latest", "gemini-3.1-flash-lite"]
    
    async with httpx.AsyncClient() as client:
        for m in candidates:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{m}:generateContent?key={api_key}"
            res = await client.post(url, json={"contents": [{"role": "user", "parts": [{"text": "Hello Gemini! Say: SVIZZGPT ACTIVE"}]}]}, timeout=15.0)
            print(f"Model: {m} -> Status: {res.status_code}")
            if res.status_code == 200:
                print(">>> SUCCESS:", res.json()["candidates"][0]["content"]["parts"][0]["text"].strip())
                break
            else:
                print("Error:", res.text[:200])

if __name__ == "__main__":
    asyncio.run(test_latest())
