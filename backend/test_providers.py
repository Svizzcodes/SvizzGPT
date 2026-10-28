import asyncio
import os
import sys
from pathlib import Path
from openai import AsyncOpenAI
from dotenv import load_dotenv

# Load .env
load_dotenv(Path(__file__).resolve().parent.parent / ".env")

async def test_openai():
    api_key = os.getenv("OPENAI_API_KEY")
    print(f"[*] Testing OpenAI with key: {api_key[:12]}...")
    try:
        client = AsyncOpenAI(api_key=api_key)
        res = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": "Respond with 'OPENAI_OK'"}],
            max_tokens=10
        )
        print(f"[+] OpenAI Success: {res.choices[0].message.content.strip()}")
        return True
    except Exception as e:
        print(f"[-] OpenAI Error: {e}")
        return False

async def test_groq():
    api_key = os.getenv("GROK_API_KEY")
    print(f"[*] Testing Grok/Groq with key: {api_key[:12]}...")
    # Try Groq endpoint (gsk_ prefix)
    try:
        client = AsyncOpenAI(api_key=api_key, base_url="https://api.groq.com/openai/v1")
        res = await client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": "Respond with 'GROQ_OK'"}],
            max_tokens=10
        )
        print(f"[+] Groq Success: {res.choices[0].message.content.strip()}")
        return True
    except Exception as e1:
        print(f"[-] Groq direct error ({e1}), trying xAI endpoint...")
        try:
            client_xai = AsyncOpenAI(api_key=api_key, base_url="https://api.x.ai/v1")
            res_xai = await client_xai.chat.completions.create(
                model="grok-2-latest",
                messages=[{"role": "user", "content": "Respond with 'XAI_OK'"}],
                max_tokens=10
            )
            print(f"[+] xAI Success: {res_xai.choices[0].message.content.strip()}")
            return True
        except Exception as e2:
            print(f"[-] xAI Error: {e2}")
            return False

async def test_gemini():
    api_key = os.getenv("GEMINI_API_KEY")
    print(f"[*] Testing Gemini with key: {api_key[:12]}...")
    try:
        client = AsyncOpenAI(
            api_key=api_key,
            base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
        )
        res = await client.chat.completions.create(
            model="gemini-1.5-flash",
            messages=[{"role": "user", "content": "Respond with 'GEMINI_OK'"}],
            max_tokens=10
        )
        print(f"[+] Gemini Success: {res.choices[0].message.content.strip()}")
        return True
    except Exception as e:
        print(f"[-] Gemini Error: {e}")
        return False

async def main():
    print("========================================")
    print(" TESTING ALL THREE CONFIGURED PROVIDERS ")
    print("========================================")
    r1 = await test_openai()
    r2 = await test_groq()
    r3 = await test_gemini()
    print("========================================")
    print(f"Results -> OpenAI: {r1}, Grok/Groq: {r2}, Gemini: {r3}")

if __name__ == "__main__":
    asyncio.run(main())
