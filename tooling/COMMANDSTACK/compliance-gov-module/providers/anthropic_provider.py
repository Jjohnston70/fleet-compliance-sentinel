"""
Anthropic provider implementation for LLM and embedding services.

Uses the official Anthropic Python SDK for LLM calls.
For embeddings, falls back to sentence-transformers since Anthropic doesn't provide embeddings.
"""

import logging
from typing import List, Dict, Any, Optional

from anthropic import Anthropic, APIError, APIConnectionError, RateLimitError

from .base import BaseLLMProvider, BaseEmbeddingProvider


logger = logging.getLogger(__name__)


class AnthropicLLMProvider(BaseLLMProvider):
    """
    Anthropic LLM provider using the official SDK.

    Supports generating text completions and handling multi-turn conversations.
    """

    def __init__(self, model: str = "claude-sonnet-4-20250514", temperature: float = 0.7,
                 api_key: Optional[str] = None):
        """
        Initialize Anthropic LLM provider.

        Args:
            model: Model name (e.g., "claude-sonnet-4-20250514", "claude-opus-4-1").
            temperature: Sampling temperature (0-1). Controls randomness.
            api_key: Anthropic API key. If not provided, uses ANTHROPIC_API_KEY env var.

        Raises:
            ValueError: If API key is not provided and not in environment.
        """
        self.model = model
        self.temperature = temperature

        try:
            self.client = Anthropic(api_key=api_key)
            logger.info(f"Initialized Anthropic LLM provider with model: {model}")
        except Exception as e:
            logger.error(f"Failed to initialize Anthropic client: {e}")
            raise

    def generate(self, prompt: str, **kwargs) -> str:
        """
        Generate text from a single prompt.

        Args:
            prompt: The input text prompt.
            **kwargs: Additional parameters like max_tokens, temperature override.

        Returns:
            Generated text response.

        Raises:
            APIError: If Anthropic API returns an error.
        """
        try:
            temperature = kwargs.pop("temperature", self.temperature)
            max_tokens = kwargs.pop("max_tokens", 2000)

            message = self.client.messages.create(
                model=self.model,
                max_tokens=max_tokens,
                temperature=temperature,
                messages=[{"role": "user", "content": prompt}],
                **kwargs
            )

            return message.content[0].text
        except (APIError, APIConnectionError, RateLimitError) as e:
            logger.error(f"Anthropic API error: {e}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error in generate: {e}")
            raise

    def chat(self, messages: List[Dict[str, str]], **kwargs) -> str:
        """
        Generate text from a conversation message history.

        Args:
            messages: List of message dicts with 'role' and 'content' keys.
            **kwargs: Additional parameters like max_tokens, temperature override.

        Returns:
            Generated text response from the model.

        Raises:
            APIError: If Anthropic API returns an error.
        """
        try:
            temperature = kwargs.pop("temperature", self.temperature)
            max_tokens = kwargs.pop("max_tokens", 2000)

            message = self.client.messages.create(
                model=self.model,
                max_tokens=max_tokens,
                temperature=temperature,
                messages=messages,
                **kwargs
            )

            return message.content[0].text
        except (APIError, APIConnectionError, RateLimitError) as e:
            logger.error(f"Anthropic API error: {e}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error in chat: {e}")
            raise


class AnthropicEmbeddingProvider(BaseEmbeddingProvider):
    """
    Anthropic embedding provider using sentence-transformers fallback.

    Since Anthropic doesn't provide an embedding API, this uses sentence-transformers
    with the 'all-MiniLM-L6-v2' model as a fallback for embedding text.
    """

    def __init__(self, model: str = "all-MiniLM-L6-v2"):
        """
        Initialize Anthropic embedding provider (sentence-transformers fallback).

        Args:
            model: Model name for sentence-transformers (default: "all-MiniLM-L6-v2").

        Raises:
            ImportError: If sentence-transformers is not installed.
        """
        self.model = model

        try:
            from sentence_transformers import SentenceTransformer
            self.encoder = SentenceTransformer(model)
            logger.info(f"Initialized Anthropic embedding provider with model: {model}")
        except ImportError:
            logger.error("sentence-transformers is required for Anthropic embeddings. "
                        "Install it with: pip install sentence-transformers")
            raise
        except Exception as e:
            logger.error(f"Failed to initialize embedding model: {e}")
            raise

    def embed_text(self, text: str) -> List[float]:
        """
        Generate an embedding vector for a single text string.

        Args:
            text: The input text to embed.

        Returns:
            List of floats representing the embedding vector.
        """
        try:
            embedding = self.encoder.encode(text, convert_to_tensor=False)
            return embedding.tolist() if hasattr(embedding, 'tolist') else list(embedding)
        except Exception as e:
            logger.error(f"Error embedding text: {e}")
            raise

    def embed_texts(self, texts: List[str]) -> List[List[float]]:
        """
        Generate embedding vectors for multiple text strings.

        Args:
            texts: List of text strings to embed.

        Returns:
            List of embedding vectors, one per input text.
        """
        try:
            embeddings = self.encoder.encode(texts, convert_to_tensor=False)
            # Convert numpy array to list of lists
            return [emb.tolist() if hasattr(emb, 'tolist') else list(emb)
                    for emb in embeddings]
        except Exception as e:
            logger.error(f"Error embedding texts: {e}")
            raise
