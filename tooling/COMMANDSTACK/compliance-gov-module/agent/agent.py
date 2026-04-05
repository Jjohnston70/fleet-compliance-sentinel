"""
Compliance RAG Agent for federal compliance assistance.

This module implements a Retrieval-Augmented Generation (RAG) agent that
provides expert compliance guidance using a vector store of compliance templates
and frameworks. The agent distinguishes between compliance concepts and enforces
small business considerations.
"""

import logging
import json
from pathlib import Path
from typing import List, Dict, Any, Optional, Tuple

from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import DirectoryLoader, TextLoader
from langchain_community.vectorstores import FAISS
from langchain.memory import ConversationBufferMemory
from langchain.chains import RetrievalQA
from langchain_core.prompts import PromptTemplate
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler

import config
from providers.factory import get_llm_provider, get_embedding_provider
from providers.langchain_adapter import ProviderEmbeddings

logger = logging.getLogger(__name__)


class ComplianceRAGAgent:
    """
    Compliance RAG Agent for answering federal compliance questions.

    This agent uses a vector store of compliance templates and documents
    to provide accurate, referenced answers about compliance requirements.
    It supports multi-turn conversation and maintains context across queries.
    """

    SYSTEM_PROMPT = """You are a federal compliance assistant for small businesses pursuing government contracts.
You have access to a comprehensive compliance framework covering NIST CSF, NIST 800-53,
NIST 800-171, ISO 27001, SOC 2, FedRAMP, HIPAA, GDPR/CCPA, and CMMC.

Your knowledge base includes compliance templates organized into 10 skill areas
with a four-level governance hierarchy. When answering questions:

1. Reference specific templates by skill name and template number
2. Identify which compliance frameworks apply to the user's situation
3. Distinguish between "aligned," "compliant," and "certified" - these have different legal meanings
4. Acknowledge when a small business (5-20 people) may need compensating controls
   instead of enterprise-grade solutions
5. Flag when federal requirements override general compliance requirements
6. Never claim certifications that haven't been independently audited
7. Treat all client data as regulated by default

If the user describes their business, scope which skills and templates are relevant
to their specific situation before recommending actions.

Use the following context to answer the question:
{context}

If you don't have enough information in the context to answer the question accurately,
say so explicitly and ask clarifying questions about the user's situation."""

    def __init__(
        self,
        llm_provider: str = config.LLM_PROVIDER,
        embedding_provider: str = config.EMBEDDING_PROVIDER,
        content_dir: Path = config.CONTENT_DIR,
        chunk_size: int = 1500,
        chunk_overlap: int = 200,
        k_results: int = 5,
    ):
        """
        Initialize the Compliance RAG Agent.

        Args:
            llm_provider: LLM provider name ('anthropic' or 'openai')
            embedding_provider: Embedding provider name ('openai')
            content_dir: Path to directory containing compliance content
            chunk_size: Size of text chunks for splitting
            chunk_overlap: Overlap between chunks
            k_results: Number of context documents to retrieve per query

        Raises:
            ValueError: If required providers or files are not available
        """
        self.llm_provider_name = llm_provider
        self.embedding_provider_name = embedding_provider
        self.content_dir = Path(content_dir)
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.k_results = k_results

        logger.info(f"Initializing ComplianceRAGAgent with {llm_provider} LLM and {embedding_provider} embeddings")

        # Initialize LLM provider
        self.llm = get_llm_provider(llm_provider)
        logger.info(f"Initialized LLM provider: {llm_provider}")

        # Initialize embedding provider
        embedding_prov = get_embedding_provider(embedding_provider)
        self.embeddings = ProviderEmbeddings(embedding_prov)
        logger.info(f"Initialized embedding provider: {embedding_provider}")

        # Load and index documents
        self.vector_store = self._load_and_index_documents()
        logger.info("Document indexing complete")

        # Initialize conversation memory
        self.memory = ConversationBufferMemory(
            memory_key="chat_history",
            return_messages=True,
            k=10,
        )

        # Initialize QA chain
        self.qa_chain = self._create_qa_chain()
        logger.info("QA chain initialized")

    def _load_and_index_documents(self) -> FAISS:
        """
        Load compliance documents and create FAISS vector store.

        Returns:
            FAISS vector store containing indexed compliance documents

        Raises:
            ValueError: If content directory is empty or documents cannot be loaded
        """
        logger.info(f"Loading documents from {self.content_dir}")

        if not self.content_dir.exists():
            raise ValueError(f"Content directory does not exist: {self.content_dir}")

        # Load markdown files recursively
        loader = DirectoryLoader(
            str(self.content_dir),
            glob="**/*.md",
            loader_cls=TextLoader,
            loader_kwargs={"encoding": "utf-8"},
        )

        try:
            documents = loader.load()
            logger.info(f"Loaded {len(documents)} documents")

            if not documents:
                raise ValueError(f"No markdown documents found in {self.content_dir}")

        except Exception as e:
            logger.error(f"Failed to load documents: {e}")
            raise

        # Split documents into chunks
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=self.chunk_size,
            chunk_overlap=self.chunk_overlap,
            separators=["\n\n", "\n", " ", ""],
        )

        try:
            split_docs = text_splitter.split_documents(documents)
            logger.info(f"Split into {len(split_docs)} chunks")
        except Exception as e:
            logger.error(f"Failed to split documents: {e}")
            raise

        # Create FAISS vector store
        try:
            vector_store = FAISS.from_documents(
                split_docs,
                self.embeddings,
            )
            logger.info(f"Created FAISS vector store with {len(split_docs)} chunks")
            return vector_store
        except Exception as e:
            logger.error(f"Failed to create vector store: {e}")
            raise

    def _create_qa_chain(self) -> RetrievalQA:
        """
        Create a RetrievalQA chain using the vector store.

        Returns:
            Configured RetrievalQA chain for compliance questions
        """
        prompt_template = PromptTemplate(
            input_variables=["context", "question"],
            template=self.SYSTEM_PROMPT,
        )

        qa_chain = RetrievalQA.from_chain_type(
            llm=self.llm,
            chain_type="stuff",
            retriever=self.vector_store.as_retriever(
                search_type="similarity",
                search_kwargs={"k": self.k_results},
            ),
            chain_type_kwargs={"prompt": prompt_template},
            return_source_documents=True,
        )

        return qa_chain

    def query(self, question: str) -> Dict[str, Any]:
        """
        Answer a compliance question using RAG.

        Args:
            question: The compliance question to answer

        Returns:
            Dictionary containing:
            - answer: The compliance guidance
            - sources: List of referenced source documents with metadata
            - context: Number of context chunks used

        Raises:
            Exception: If query processing fails
        """
        try:
            logger.info(f"Processing query: {question[:100]}...")

            result = self.qa_chain.invoke({"query": question})

            # Extract and format source documents
            sources = []
            if "source_documents" in result:
                for doc in result["source_documents"]:
                    sources.append({
                        "source": doc.metadata.get("source", "unknown"),
                        "content_preview": doc.page_content[:200],
                    })

            response = {
                "answer": result.get("result", ""),
                "sources": sources,
                "context_chunks_used": len(result.get("source_documents", [])),
            }

            logger.info(f"Query processed successfully, used {len(sources)} sources")
            return response

        except Exception as e:
            logger.error(f"Error processing query: {e}")
            raise

    def chat(self, question: str, use_history: bool = True) -> Dict[str, Any]:
        """
        Have a multi-turn conversation with context.

        Args:
            question: The user's question or message
            use_history: Whether to include conversation history in context

        Returns:
            Dictionary containing:
            - answer: The response
            - sources: Referenced documents
            - context_chunks_used: Number of context chunks
            - conversation_turns: Total turns in conversation

        Raises:
            Exception: If chat processing fails
        """
        try:
            if use_history:
                self.memory.chat_history.append({"role": "user", "content": question})

            result = self.query(question)

            if use_history:
                self.memory.chat_history.append({"role": "assistant", "content": result["answer"]})

            result["conversation_turns"] = len(self.memory.chat_history) // 2

            return result

        except Exception as e:
            logger.error(f"Error in chat: {e}")
            raise

    def get_conversation_history(self) -> List[Dict[str, str]]:
        """
        Get the current conversation history.

        Returns:
            List of message dictionaries with role and content
        """
        return self.memory.chat_history

    def clear_conversation_history(self) -> None:
        """Clear the conversation history."""
        self.memory.clear()
        logger.info("Conversation history cleared")

    def get_status(self) -> Dict[str, Any]:
        """
        Get agent status information.

        Returns:
            Dictionary containing:
            - status: 'ready' if agent is operational
            - llm_provider: Name of LLM provider
            - embedding_provider: Name of embedding provider
            - vector_store_loaded: Whether documents are indexed
            - conversation_turns: Number of turns in current conversation
        """
        return {
            "status": "ready",
            "llm_provider": self.llm_provider_name,
            "embedding_provider": self.embedding_provider_name,
            "vector_store_loaded": self.vector_store is not None,
            "conversation_turns": len(self.memory.chat_history) // 2,
        }


# Global agent instance (lazy-loaded)
_agent_instance: Optional[ComplianceRAGAgent] = None


def get_agent() -> ComplianceRAGAgent:
    """
    Get or create the global compliance agent instance.

    Returns:
        Initialized ComplianceRAGAgent instance

    Raises:
        ValueError: If agent initialization fails
    """
    global _agent_instance
    if _agent_instance is None:
        _agent_instance = ComplianceRAGAgent()
    return _agent_instance


def reset_agent() -> None:
    """Reset the global agent instance."""
    global _agent_instance
    _agent_instance = None
