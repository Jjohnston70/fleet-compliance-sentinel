"""
Factory for creating provider instances.

Provides a unified interface to instantiate LLM and embedding providers
based on configuration.
"""

import logging
from typing import Union, Optional, Dict, Any

from .base import BaseLLMProvider, BaseEmbeddingProvider
from .openai_provider import OpenAILLMProvider, OpenAIEmbeddingProvider
from .anthropic_provider import AnthropicLLMProvider, AnthropicEmbeddingProvider
from .ollama_provider import OllamaLLMProvider, OllamaEmbeddingProvider


logger = logging.getLogger(__name__)


class ConfigError(Exception):
    """Raised when provider configuration is invalid."""
    pass


def get_provider(
    provider_name: str,
    provider_type: str = "llm",
    **kwargs
) -> Union[BaseLLMProvider, BaseEmbeddingProvider]:
    """
    Get a provider instance based on name and type.

    Args:
        provider_name: Name of the provider ("openai", "anthropic", "ollama").
        provider_type: Type of provider ("llm" or "embedding").
        **kwargs: Additional arguments to pass to the provider constructor.

    Returns:
        Initialized provider instance.

    Raises:
        ConfigError: If provider_name or provider_type is invalid.
        ValueError: If required API keys are missing.
    """
    provider_name = provider_name.lower().strip()
    provider_type = provider_type.lower().strip()

    if provider_type not in ("llm", "embedding"):
        raise ConfigError(f"Invalid provider_type: {provider_type}. "
                         "Must be 'llm' or 'embedding'.")

    try:
        if provider_name == "openai":
            if provider_type == "llm":
                return OpenAILLMProvider(**kwargs)
            else:
                return OpenAIEmbeddingProvider(**kwargs)

        elif provider_name == "anthropic":
            if provider_type == "llm":
                return AnthropicLLMProvider(**kwargs)
            else:
                return AnthropicEmbeddingProvider(**kwargs)

        elif provider_name == "ollama":
            if provider_type == "llm":
                return OllamaLLMProvider(**kwargs)
            else:
                return OllamaEmbeddingProvider(**kwargs)

        else:
            raise ConfigError(f"Unknown provider: {provider_name}. "
                            "Supported providers: openai, anthropic, ollama")

    except ConfigError:
        raise
    except Exception as e:
        logger.error(f"Failed to initialize {provider_name} {provider_type} provider: {e}")
        raise


def get_llm_provider(provider_name: str, **kwargs) -> BaseLLMProvider:
    """
    Convenience function to get an LLM provider.

    Args:
        provider_name: Name of the LLM provider.
        **kwargs: Additional arguments for the provider.

    Returns:
        Initialized LLM provider instance.
    """
    return get_provider(provider_name, "llm", **kwargs)


def get_embedding_provider(provider_name: str, **kwargs) -> BaseEmbeddingProvider:
    """
    Convenience function to get an embedding provider.

    Args:
        provider_name: Name of the embedding provider.
        **kwargs: Additional arguments for the provider.

    Returns:
        Initialized embedding provider instance.
    """
    return get_provider(provider_name, "embedding", **kwargs)
