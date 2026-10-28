import logging
from typing import List, Dict, Any, Optional
import httpx
from duckduckgo_search import DDGS
from app.config import settings

logger = logging.getLogger(__name__)

class WebSearchService:
    @staticmethod
    def search(query: str, max_results: int = 5) -> List[Dict[str, Any]]:
        """
        Executes a web search and returns structured citations and snippets.
        Uses Tavily if TAVILY_API_KEY is configured, otherwise DuckDuckGo.
        """
        # 1. Check Tavily if key is provided
        if settings.TAVILY_API_KEY:
            try:
                with httpx.Client(timeout=10.0) as client:
                    resp = client.post(
                        "https://api.tavily.com/search",
                        json={
                            "api_key": settings.TAVILY_API_KEY,
                            "query": query,
                            "search_depth": "basic",
                            "max_results": max_results,
                            "include_answer": True
                        }
                    )
                    if resp.status_code == 200:
                        data = resp.json()
                        results = []
                        for res in data.get("results", []):
                            results.append({
                                "title": res.get("title", ""),
                                "url": res.get("url", ""),
                                "snippet": res.get("content", ""),
                                "source": "Tavily"
                            })
                        return results
            except Exception as e:
                logger.warning(f"Tavily search failed, falling back to DuckDuckGo: {e}")

        # 2. DuckDuckGo Search Fallback
        try:
            ddgs = DDGS()
            raw_results = list(ddgs.text(query, max_results=max_results))
            results = []
            for r in raw_results:
                results.append({
                    "title": r.get("title", ""),
                    "url": r.get("href", ""),
                    "snippet": r.get("body", ""),
                    "source": "DuckDuckGo"
                })
            return results
        except Exception as e:
            logger.error(f"DuckDuckGo search error: {e}")
            return []

    @staticmethod
    def format_search_context(results: List[Dict[str, Any]]) -> str:
        """
        Formats search results into a clean prompt context for the LLM.
        """
        if not results:
            return ""
        
        context_parts = ["[REAL-TIME WEB SEARCH RESULTS]"]
        for i, res in enumerate(results, 1):
            context_parts.append(
                f"Source [{i}]: {res.get('title')}\nURL: {res.get('url')}\nContent: {res.get('snippet')}\n"
            )
        context_parts.append(
            "[INSTRUCTION: Use the above verified sources to answer. Add footnote markdown citations like [1](url) corresponding to the sources used.]"
        )
        return "\n\n".join(context_parts)
