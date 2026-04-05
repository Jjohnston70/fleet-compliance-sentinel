"""
Provider abstraction layer for multi-provider LLM and embedding support.

This module exports all providers and the factory function for easy access.
Supports OpenAI, Anthropic, and Ollama.
"""

from .base import BaseLLMProvider, BaseEmbeddingProvider
from .openai_provider import OpenAILLMProvider, OpenAIEmbeddingProvider
from .anthropic_provider import AnthropicLLMProvider, AnthropicEmbeddingProvider
from .ollama_provider import OllamaLLMProvider, OllamaEmbeddingProvider
from .factory import get_provider, get_llm_provider, get_embedding_provider, ConfigError

__all__ = [
    # Base classes
    "BaseLLMProvider",
    "BaseEmbeddingProvider",
    # OpenAI providers
    "OpenAILLMProvider",
    "OpenAIEmbeddingProvider",
    # Anthropic providers
    "AnthropicLLMProvider",
    "AnthropicEmbeddingProvider",
    # Ollama providers
    "OllamaLLMProvider",
    "OllamaEmbeddingProvider",
    # Factory
    "get_provider",
    "get_llm_provider",
    "get_embedding_provider",
    "ConfigError",
]
