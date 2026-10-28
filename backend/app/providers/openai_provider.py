import json
import logging
from typing import AsyncGenerator, Dict, Any, List, Optional
from openai import AsyncOpenAI, APIError, AuthenticationError, RateLimitError
import httpx
from app.config import settings
from app.providers.base import AIProvider
from app.services.token_counter import count_tokens, estimate_cost

logger = logging.getLogger(__name__)

DEFAULT_SYSTEM_PROMPT = """You are SVIZZGPT — a high-performance personal multimodal intelligence system.
You combine rigorous technical capability with clear, elegant, editorial communication.

KEY CAPABILITIES & INSTRUCTIONS:
1. Technical Rigor: When providing code, write clean, production-ready, typed implementations with syntax-highlighted markdown code blocks.
2. Mathematical Precision: Format all math expressions using LaTeX ($...$ for inline math and $$...$$ for block equations).
3. Structure & Formatting: Organize complex responses with clear headings, lists, tables, and concise paragraphs.
4. Vision & Multimodal: Analyze images, diagrams, architectural charts, and screenshots thoroughly with detailed spatial and contextual reasoning.
5. Documents & Data: When provided with document or CSV excerpts, analyze data systematically.
6. Tone: Sharp, direct, sophisticated, helpful, and insightful. Avoid conversational fluff or sycophancy."""

class UnifiedMultiProvider(AIProvider):
    """
    Unified intelligence provider routing across OpenAI, Groq/xAI, and Gemini
    with SSE streaming, multimodal vision, and DALL-E image generation.
    """
    def __init__(self):
        self._openai_client: Optional[AsyncOpenAI] = None
        self._groq_client: Optional[AsyncOpenAI] = None
        self._gemini_client: Optional[AsyncOpenAI] = None

    def get_fallback_candidates(self, requested_model: Optional[str] = None) -> List[tuple[str, AsyncOpenAI, str]]:
        """
        Builds an ordered fallback chain across Groq, Gemini, and OpenAI.
        If any token fails (quota, auth, rate-limit), the engine automatically tries the next.
        """
        candidates: List[tuple[str, AsyncOpenAI, str]] = []
        groq_key = settings.GROK_API_KEY or os.getenv("GROQ_API_KEY")
        openai_key = settings.OPENAI_API_KEY
        gemini_key = settings.GEMINI_API_KEY

        # 1. Groq Provider
        if groq_key:
            if self._groq_client is None:
                self._groq_client = AsyncOpenAI(
                    api_key=groq_key,
                    base_url="https://api.groq.com/openai/v1"
                )
            candidates.append(("Groq LPU", self._groq_client, "qwen/qwen3.8-27b"))
            candidates.append(("Groq Backup", self._groq_client, "openai/gpt-oss-120b"))

        # 2. Gemini Provider (OpenAI-compatible endpoint)
        if gemini_key and not gemini_key.startswith("your_"):
            if self._gemini_client is None:
                self._gemini_client = AsyncOpenAI(
                    api_key=gemini_key,
                    base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
                )
            candidates.append(("Google Gemini", self._gemini_client, "gemini-1.5-flash-latest"))

        # 3. OpenAI Provider
        if openai_key and not openai_key.startswith("your_"):
            if self._openai_client is None:
                self._openai_client = AsyncOpenAI(api_key=openai_key)
            candidates.append(("OpenAI", self._openai_client, "gpt-4o-mini"))

        if not candidates:
            raise ValueError("No AI provider keys configured in .env")

        # If user explicitly requested OpenAI and it's in candidates, bump it first
        if requested_model and "gpt" in requested_model.lower():
            candidates.sort(key=lambda c: 0 if c[0] == "OpenAI" else 1)
        elif requested_model and "gemini" in requested_model.lower():
            candidates.sort(key=lambda c: 0 if c[0] == "Google Gemini" else 1)

        return candidates

    def get_client_for_model(self, model_name: Optional[str] = None) -> tuple[AsyncOpenAI, str]:
        candidates = self.get_fallback_candidates(model_name)
        _, client, model = candidates[0]
        return client, model

    def _prepare_messages(
        self,
        messages: List[Dict[str, Any]],
        system_prompt: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        formatted = []
        sys_prompt = system_prompt or DEFAULT_SYSTEM_PROMPT
        formatted.append({"role": "system", "content": sys_prompt})

        for msg in messages:
            role = msg.get("role", "user")
            content = msg.get("content", "")
            attachments = msg.get("attachments", [])

            if attachments and role == "user":
                content_parts: List[Dict[str, Any]] = []
                doc_context_parts = []
                for att in attachments:
                    extracted = att.get("extracted_text")
                    filename = att.get("filename", "file")
                    if extracted and att.get("file_type") != "image":
                        doc_context_parts.append(f"=== ATTACHMENT: {filename} ===\n{extracted}")
                
                combined_text = content
                if doc_context_parts:
                    combined_text += "\n\n" + "\n\n".join(doc_context_parts)
                
                if combined_text:
                    content_parts.append({"type": "text", "text": combined_text})

                for att in attachments:
                    if att.get("file_type") == "image":
                        url = att.get("url") or att.get("data_url")
                        if url and (url.startswith("http://") or url.startswith("https://") or url.startswith("data:image/")):
                            content_parts.append({
                                "type": "image_url",
                                "image_url": {
                                    "url": url,
                                    "detail": "high"
                                }
                            })
                        else:
                            fname = att.get("filename", "image")
                            content_parts.append({
                                "type": "text",
                                "text": f"[Attached Image: {fname}]"
                            })

                formatted.append({"role": role, "content": content_parts})
            else:
                formatted.append({"role": role, "content": content})

        return formatted

    async def generate_text(
        self,
        messages: List[Dict[str, Any]],
        model: Optional[str] = None,
        temperature: float = 0.7,
        system_prompt: Optional[str] = None,
        tools: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        candidates = self.get_fallback_candidates(model)
        payload_messages = self._prepare_messages(messages, system_prompt)
        last_error = None

        for provider_name, client, resolved_model in candidates:
            try:
                logger.info(f"Attempting generation with {provider_name} ({resolved_model})...")
                response = await client.chat.completions.create(
                    model=resolved_model,
                    messages=payload_messages,
                    temperature=temperature
                )
                content = response.choices[0].message.content or ""
                usage = response.usage
                input_tokens = usage.prompt_tokens if usage else count_tokens(json.dumps(payload_messages), resolved_model)
                output_tokens = usage.completion_tokens if usage else count_tokens(content, resolved_model)

                return {
                    "content": content,
                    "model": resolved_model,
                    "provider": provider_name,
                    "input_tokens": input_tokens,
                    "output_tokens": output_tokens,
                    "estimated_cost": estimate_cost(input_tokens, output_tokens, resolved_model)
                }
            except Exception as e:
                logger.warning(f"[AUTO-FALLBACK] Provider {provider_name} ({resolved_model}) failed: {e}. Trying next token/provider...")
                last_error = e

        raise ValueError(f"All configured providers failed. Last error: {str(last_error)}")

    async def stream_response(
        self,
        messages: List[Dict[str, Any]],
        model: Optional[str] = None,
        temperature: float = 0.7,
        system_prompt: Optional[str] = None,
        citations: Optional[List[Dict[str, Any]]] = None
    ) -> AsyncGenerator[Dict[str, Any], None]:
        candidates = self.get_fallback_candidates(model)
        payload_messages = self._prepare_messages(messages, system_prompt)

        yield {"type": "status", "data": "PROCESSING"}
        yield {"type": "status", "data": "REASONING"}

        if citations:
            yield {"type": "citations", "data": citations}

        stream_started = False
        full_content = ""
        active_model = candidates[0][2]

        for provider_name, client, resolved_model in candidates:
            try:
                active_model = resolved_model
                logger.info(f"Connecting stream with {provider_name} ({resolved_model})...")
                yield {"type": "status", "data": f"GENERATING ({provider_name})"}

                stream = await client.chat.completions.create(
                    model=resolved_model,
                    messages=payload_messages,
                    temperature=temperature,
                    stream=True
                )

                async for chunk in stream:
                    if chunk.choices and len(chunk.choices) > 0:
                        delta = chunk.choices[0].delta
                        if delta and delta.content:
                            token = delta.content
                            full_content += token
                            stream_started = True
                            yield {"type": "token", "data": token}

                # Successfully completed stream
                break

            except Exception as e:
                logger.warning(f"[AUTO-FALLBACK] {provider_name} ({resolved_model}) failed: {e}. Auto-switching to next token/provider...")
                if stream_started:
                    # If stream already began emitting tokens, yield the error
                    yield {"type": "error", "data": f"Stream interrupted on {provider_name}: {str(e)}"}
                    return
                # Otherwise, continue loop to try next provider in chain
                continue

        if not stream_started and not full_content:
            yield {"type": "error", "data": "All configured API keys/tokens failed. Please check your credentials in .env"}
            return

        yield {"type": "status", "data": "FINALIZING"}
        
        input_tokens = count_tokens(json.dumps(payload_messages, default=str), active_model)
        output_tokens = count_tokens(full_content, active_model)
        cost = estimate_cost(input_tokens, output_tokens, active_model)

        yield {
            "type": "usage",
            "data": {
                "input_tokens": input_tokens,
                "output_tokens": output_tokens,
                "total_tokens": input_tokens + output_tokens,
                "estimated_cost": cost,
                "model": active_model
            }
        }
        yield {"type": "done", "data": full_content}

    async def generate_image(
        self,
        prompt: str,
        size: str = "1024x1024",
        quality: str = "standard",
        model: Optional[str] = None
    ) -> Dict[str, Any]:
        if not settings.OPENAI_API_KEY:
            raise ValueError("OPENAI_API_KEY required for DALL-E 3 image generation.")
        
        if self._openai_client is None:
            self._openai_client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

        target_model = model or settings.OPENAI_IMAGE_MODEL

        try:
            response = await self._openai_client.images.generate(
                model=target_model,
                prompt=prompt,
                size=size,
                quality=quality,
                n=1
            )
            image_url = response.data[0].url
            revised_prompt = response.data[0].revised_prompt or prompt
            cost = estimate_cost(0, 0, target_model)

            return {
                "url": image_url,
                "prompt": prompt,
                "revised_prompt": revised_prompt,
                "model": target_model,
                "cost": cost
            }
        except Exception as e:
            raise ValueError(f"Image generation failed: {str(e)}")
