from abc import ABC, abstractmethod
from typing import AsyncGenerator, Dict, Any, List, Optional

class AIProvider(ABC):
    @abstractmethod
    async def generate_text(
        self,
        messages: List[Dict[str, Any]],
        model: Optional[str] = None,
        temperature: float = 0.7,
        system_prompt: Optional[str] = None,
        tools: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        """Generate a complete text response."""
        pass

    @abstractmethod
    async def stream_response(
        self,
        messages: List[Dict[str, Any]],
        model: Optional[str] = None,
        temperature: float = 0.7,
        system_prompt: Optional[str] = None,
        citations: Optional[List[Dict[str, Any]]] = None
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """Stream response chunks (tokens, status updates, usage)."""
        pass

    @abstractmethod
    async def generate_image(
        self,
        prompt: str,
        size: str = "1024x1024",
        quality: str = "standard",
        model: Optional[str] = None
    ) -> Dict[str, Any]:
        """Generate an image from prompt."""
        pass
