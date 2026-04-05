"""
LangChain adapter for provider abstraction layer.

This module provides a wrapper class that implements LangChain's Embeddings
interface by delegating to our BaseEmbeddingProvider. This enables compatibility
with LangChain's FAISS vector store and other components that expect a
LangChain Embeddings instance.
"""

import logging
from typing import List

from langchain_core.embeddings import Embeddings

from .base import BaseEmbeddingProvider


logger = logging.getLogger(__name__)


class ProviderEmbeddings(Embeddings):
    """
    LangChain-compatible embedding wrapper for BaseEmbeddingProvider.

    This class adapts any BaseEmbeddingProvider to the LangChain Embeddings
    interface, allowing seamless use with FAISS, vector stores, and other
    LangChain components.
    """

    def __init__(self, provider: BaseEmbeddingProvider):
        """
        Initialize the adapter.

        Args:
            provider: A BaseEmbeddingProvider instance to wrap.

        Raises:
            ValueError: If provider is not a BaseEmbeddingProvider.
        """
        if not isinstance(provider, BaseEmbeddingProvider):
            raise ValueError(
                f"provider must be a BaseEmbeddingProvider instance, "
                f"got {type(provider)}"
            )
        self.provider = provider
        logger.debug(
            f"Initialized ProviderEmbeddings with {type(provider).__name__}"
        )

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        """
        Embed a list of documents.

        Args:
            texts: List of document texts to embed.

        Returns:
            List of embedding vectors.

        Raises:
            Exception: If embedding generation fails.
        """
        try:
            embeddings = self.provider.embed_texts(texts)
            logger.debug(
                f"Successfully embedded {len(texts)} documents"
            )
            return embeddings
        except Exception as e:
            logger.error(f"Failed to embed documents: {e}")
            raise

    def embed_query(self, text: str) -> List[float]:
        """
        Embed a query text.

        Args:
            text: Query text to embed.

        Returns:
            Embedding vector.

        Raises:
            Exception: If embedding generation fails.
        """
        try:
            embedding = self.provider.embed_text(text)
            logger.debug("Successfully embedded query")
            return embedding
        except Exception as e:
            logger.error(f"Failed to embed query: {e}")
            raise
