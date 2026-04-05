"""
Abstract base classes for LLM and embedding providers.

This module defines the interface that all provider implementations must follow,
enabling a consistent API across different providers (OpenAI, Anthropic, Ollama).
"""

from abc import ABC, abstractmethod
from typing import List, Dict, Any


class BaseLLMProvider(ABC):
    """
    Abstract base class for Language Model providers.

    Defines the interface for LLM providers that support both
    simple text generation and multi-turn conversation.
    """

    @abstractmethod
    def generate(self, prompt: str, **kwargs) -> str:
        """
        Generate text from a single prompt.

        Args:
            prompt: The input text prompt.
            **kwargs: Additional parameters (e.g., temperature, max_tokens).

        Returns:
            Generated text response.

        Raises:
            Exception: If API call fails or model is unavailable.
        """
        pass

    @abstractmethod
    def chat(self, messages: List[Dict[str, str]], **kwargs) -> str:
        """
        Generate text from a conversation message history.

        Args:
            messages: List of message dicts with 'role' and 'content' keys.
                      Example: [{"role": "user", "content": "Hello"}]
            **kwargs: Additional parameters (e.g., temperature, max_tokens).

        Returns:
            Generated text response from the model.

        Raises:
            Exception: If API call fails or model is unavailable.
        """
        pass


class BaseEmbeddingProvider(ABC):
    """
    Abstract base class for embedding providers.

    Defines the interface for services that convert text into vector embeddings.
    """

    @abstractmethod
    def embed_text(self, text: str) -> List[float]:
        """
        Generate an embedding vector for a single text string.

        Args:
            text: The input text to embed.

        Returns:
            List of floats representing the embedding vector.

        Raises:
            Exception: If embedding generation fails.
        """
        pass

    @abstractmethod
    def embed_texts(self, texts: List[str]) -> List[List[float]]:
        """
        Generate embedding vectors for multiple text strings.

        Args:
            texts: List of text strings to embed.

        Returns:
            List of embedding vectors, one per input text.

        Raises:
            Exception: If embedding generation fails.
        """
        pass
