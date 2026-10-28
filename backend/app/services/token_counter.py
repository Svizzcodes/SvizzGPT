import tiktoken
import logging

logger = logging.getLogger(__name__)

# Approximate pricing per 1M tokens (USD)
MODEL_PRICING = {
    "gpt-4o": {"input": 2.50 / 1_000_000, "output": 10.00 / 1_000_000},
    "gpt-4o-mini": {"input": 0.15 / 1_000_000, "output": 0.60 / 1_000_000},
    "gpt-4-turbo": {"input": 10.00 / 1_000_000, "output": 30.00 / 1_000_000},
    "gpt-3.5-turbo": {"input": 0.50 / 1_000_000, "output": 1.50 / 1_000_000},
    "dall-e-3": 0.040, # $0.040 per 1024x1024 image
    "dall-e-2": 0.020,
}

def count_tokens(text: str, model: str = "gpt-4o") -> int:
    try:
        try:
            encoding = tiktoken.encoding_for_model(model)
        except KeyError:
            encoding = tiktoken.get_encoding("cl100k_base")
        return len(encoding.encode(text))
    except Exception:
        # Fallback estimation (~4 chars per token)
        return max(1, len(text) // 4)

def estimate_cost(input_tokens: int, output_tokens: int, model: str = "gpt-4o") -> float:
    pricing = MODEL_PRICING.get(model, MODEL_PRICING["gpt-4o"])
    if isinstance(pricing, dict):
        cost = (input_tokens * pricing.get("input", 0.0)) + (output_tokens * pricing.get("output", 0.0))
    else:
        cost = pricing
    return round(cost, 6)
