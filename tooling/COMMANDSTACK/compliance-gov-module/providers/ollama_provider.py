"""
Ollama provider implementation for LLM and embedding services.

Uses HTTP requests to communicate with local Ollama instances.
Requires Ollama to be running on the specified base_url.
"""

import logging
from typing import List, Dict, Any, Optional

import requests
from requests.exceptions import ConnectionError, Timeout, RequestException

from .base import BaseLLMProvider, BaseEmbeddingProvider


logger = logging.getLogger(__name__)


class OllamaLLMProvider(BaseLLMProvider):
    """
    Ollama LLM provider using HTTP API.

    Communicates with local Ollama instances to generate text.
    Requires Ollama to be running and the specified model to be available.
    """

    def __init__(self, model: str = "llama3.2", base_url: str = "http://localhost:11434"):
        """
        Initialize Ollama LLM provider.

        Args:
            model: Model name available in Ollama (e.g., "llama3.2", "mistral", "neural-chat").
            base_url: Base URL where Ollama is running (default: http://localhost:11434).

        Raises:
            ConnectionError: If Ollama server is not reachable.
        """
        self.model = model
        self.base_url = base_url.rstrip("/")

        try:
            # Test connection
            response = requests.get(f"{self.base_url}/api/tags", timeout=5)
            response.raise_for_status()
            logger.info(f"Initialized Ollama LLM provider with model: {model}")
        except (ConnectionError, Timeout) as e:
            logger.error(f"Cannot connect to Ollama at {self.base_url}: {e}")
            raise
        except Exception as e:
            logger.error(f"Failed to initialize Ollama provider: {e}")
            raise

    def generate(self, prompt: str, **kwargs) -> str:
        """
        Generate text from a single prompt.

        Args:
            prompt: The input text prompt.
            **kwargs: Additional parameters like temperature, num_predict.

        Returns:
            Generated text response.

        Raises:
            RequestException: If API call fails.
        """
        try:
            temperature = kwargs.pop("temperature", 0.7)
            num_predict = kwargs.pop("max_tokens", 512)

            payload = {
                "model": self.model,
                "prompt": prompt,
                "stream": False,
                "temperature": temperature,
                "num_predict": num_predict,
                **kwargs
            }

            response = requests.post(
                f"{self.base_url}/api/generate",
                json=payload,
                timeout=120
            )
            response.raise_for_status()

            result = response.json()
            return result.get("response", "")
        except (ConnectionError, Timeout) as e:
            logger.error(f"Connection error to Ollama: {e}")
            raise
        except RequestException as e:
            logger.error(f"Ollama API error: {e}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error in generate: {e}")
            raise

    def chat(self, messages: List[Dict[str, str]], **kwargs) -> str:
        """
        Generate text from a conversation message history.

        Args:
            messages: List of message dicts with 'role' and 'content' keys.
            **kwargs: Additional parameters like temperature, num_predict.

        Returns:
            Generated text response from the model.

        Raises:
            RequestException: If API call fails.
        """
        try:
            temperature = kwargs.pop("temperature", 0.7)
            num_predict = kwargs.pop("max_tokens", 512)

            payload = {
                "model": self.model,
                "messages": messages,
                "stream": False,
                "temperature": temperature,
                "num_predict": num_predict,
                **kwargs
            }

            response = requests.post(
                f"{self.base_url}/api/chat",
                json=payload,
                timeout=120
            )
            response.raise_for_status()

            result = response.json()
            return result.get("message", {}).get("content", "")
        except (ConnectionError, Timeout) as e:
            logger.error(f"Connection error to Ollama: {e}")
            raise
        except RequestException as e:
            logger.error(f"Ollama API error: {e}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error in chat: {e}")
            raise


class OllamaEmbeddingProvider(BaseEmbeddingProvider):
    """
    Ollama embedding provider using HTTP API.

    Generates embeddings using Ollama's embedding models.
    Requires Ollama to be running with the specified embedding model available.
    """

    def __init__(self, model: str = "nomic-embed-text", base_url: str = "http://localhost:11434"):
        """
        Initialize Ollama embedding provider.

        Args:
            model: Embedding model name available in Ollama (e.g., "nomic-embed-text", "llama2").
            base_url: Base URL where Ollama is running (default: http://localhost:11434).

        Raises:
            ConnectionError: If Ollama server is not reachable.
        """
        self.model = model
        self.base_url = base_url.rstrip("/")

        try:
            # Test connection
            response = requests.get(f"{self.base_url}/api/tags", timeout=5)
            response.raise_for_status()
            logger.info(f"Initialized Ollama embedding provider with model: {model}")
        except (ConnectionError, Timeout) as e:
            logger.error(f"Cannot connect to Ollama at {self.base_url}: {e}")
            raise
        except Exception as e:
            logger.error(f"Failed to initialize Ollama embedding provider: {e}")
            raise

    def embed_text(self, text: str) -> List[float]:
        """
        Generate an embedding vector for a single text string.

        Args:
            text: The input text to embed.

        Returns:
            List of floats representing the embedding vector.

        Raises:
            RequestException: If API call fails.
        """
        try:
            payload = {
                "model": self.model,
                "input": text
            }

            response = requests.post(
                f"{self.base_url}/api/embed",
                json=payload,
                timeout=30
            )
            response.raise_for_status()

            result = response.json()
            embeddings = result.get("embeddings", [[]])[0]
            return embeddings
        except (ConnectionError, Timeout) as e:
            logger.error(f"Connection error to Ollama: {e}")
            raise
        except RequestException as e:
            logger.error(f"Ollama API error during embedding: {e}")
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
            RequestException: If API call fails.
        """
        try:
            payload = {
                "model": self.model,
                "input": texts
            }

            response = requests.post(
                f"{self.base_url}/api/embed",
                json=payload,
                timeout=60
            )
            response.raise_for_status()

            result = response.json()
            return result.get("embeddings", [])
        except (ConnectionError, Timeout) as e:
            logger.error(f"Connection error to Ollama: {e}")
            raise
        except RequestException as e:
            logger.error(f"Ollama API error during batch embedding: {e}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error in embed_texts: {e}")
            raise
