import asyncio
import os
from pathlib import Path
from openai import AsyncOpenAI
import httpx
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

async def check_groq():
    api_key = os.getenv("GROK_API_KEY")
    client = AsyncOpenAI(api_key=api_key, base_url="https://api.groq.com/openai/v1")
    try:
        models = await client.models.list()
        print("=== GROQ MODELS AVAILABLE ===")
        for m in models.data:
            print(f"- {m.id}")
        
        # Test completion with first available model
        test_model = models.data[0].id
        res = await client.chat.completions.create(
            model=test_model,
            messages=[{"role": "user", "content": "Hello! Reply with 'GROQ ACTIVE'"}],
            max_tokens=20
        )
        print(f"[+] Groq chat test ({test_model}): {res.choices[0].message.content}")
    except Exception as e:
        print(f"[-] Groq check failed: {e}")

async def check_gemini():
    api_key = os.getenv("GEMINI_API_KEY")
    try:
        # Check v1beta endpoint
        url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"
        async with httpx.AsyncClient() as http_client:
            res = await http_client.get(url)
            print(f"=== GEMINI STATUS CODE: {res.status_code} ===")
            print(res.text[:300])
    except Exception as e:
        print(f"[-] Gemini check failed: {e}")

async def main():
    await check_groq()
    await check_gemini()

if __name__ == "__main__":
    asyncio.run(main())
