"""
OpenAI provider implementation for LLM and embedding services.

Uses the official OpenAI Python SDK directly (not LangChain).
"""

import logging
from typing import List, Dict, Any, Optional

from openai import OpenAI, APIError, APIConnectionError, RateLimitError

from .base import BaseLLMProvider, BaseEmbeddingProvider


logger = logging.getLogger(__name__)


class OpenAILLMProvider(BaseLLMProvider):
    """
    OpenAI LLM provider using the official SDK.

    Supports generating text completions and handling multi-turn conversations.
    """

    def __init__(self, model: str = "gpt-4", temperature: float = 0.7, api_key: Optional[str] = None):
        """
        Initialize OpenAI LLM provider.

        Args:
            model: Model name (e.g., "gpt-4", "gpt-3.5-turbo").
            temperature: Sampling temperature (0-2). Controls randomness.
            api_key: OpenAI API key. If not provided, uses OPENAI_API_KEY env var.

        Raises:
            ValueError: If API key is not provided and not in environment.
        """
        self.model = model
        self.temperature = temperature

        try:
            self.client = OpenAI(api_key=api_key)
            # Test connection by checking if API key is valid
            logger.info(f"Initialized OpenAI LLM provider with model: {model}")
        except Exception as e:
            logger.error(f"Failed to initialize OpenAI client: {e}")
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
            APIError: If OpenAI API returns an error.
        """
        try:
            temperature = kwargs.pop("temperature", self.temperature)
            max_tokens = kwargs.pop("max_tokens", 2000)

            response = self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=temperature,
                max_tokens=max_tokens,
                **kwargs
            )

            return response.choices[0].message.content
        except (APIError, APIConnectionError, RateLimitError) as e:
            logger.error(f"OpenAI API error: {e}")
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
            APIError: If OpenAI API returns an error.
        """
        try:
            temperature = kwargs.pop("temperature", self.temperature)
            max_tokens = kwargs.pop("max_tokens", 2000)

            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
                **kwargs
            )

            return response.choices[0].message.content
        except (APIError, APIConnectionError, RateLimitError) as e:
            logger.error(f"OpenAI API error: {e}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error in chat: {e}")
            raise


class OpenAIEmbeddingProvider(BaseEmbeddingProvider):
    """
    OpenAI embedding provider using the official SDK.

    Generates dense vector embeddings for text using OpenAI's embedding models.
    """

    def __init__(self, model: str = "text-embedding-3-small", api_key: Optional[str] = None):
        """
        Initialize OpenAI embedding provider.

        Args:
            model: Embedding model name (e.g., "text-embedding-3-small", "text-embedding-3-large").
            api_key: OpenAI API key. If not provided, uses OPENAI_API_KEY env var.

        Raises:
            ValueError: If API key is not provided and not in environment.
        """
        self.model = model

        try:
            self.client = OpenAI(api_key=api_key)
            logger.info(f"Initialized OpenAI embedding provider with model: {model}")
        except Exception as e:
            logger.error(f"Failed to initialize OpenAI client: {e}")
            raise

    def embed_text(self, text: str) -> List[float]:
        """
        Generate an embedding vector for a single text string.

        Args:
            text: The input text to embed.

        Returns:
            List of floats representing the embedding vector.

        Raises:
            APIError: If OpenAI API returns an error.
        """
        try:
            response = self.client.embeddings.create(
                model=self.model,
                input=text
            )
            return response.data[0].embedding
        except (APIError, APIConnectionError, RateLimitError) as e:
            logger.error(f"OpenAI API error during embedding: {e}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error in embed_text: {e}")
            raise

    def embed_texts(self, texts: List[str]) -> List[List[float]]:
        """
        Generate embedding vectors for multiple text strings.

        Args:
            texts: List of text strings to embed.

        Returns:
            List of embedding vectors, one per input text.

        Raises:
            APIError: If OpenAI API returns an error.
        """
        try:
            response = self.client.embeddings.create(
                model=self.model,
                input=texts
            )
            # Sort by index to ensure correct order
            return [item.embedding for item in sorted(response.data, key=lambda x: x.index)]
        except (APIError, APIConnectionError, RateLimitError) as e:
            logger.error(f"OpenAI API error during batch embedding: {e}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error in embed_texts: {e}")
            raise
