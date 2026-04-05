"""
Pytest configuration and fixtures for FOB-LLM tests.

Provides fixtures for:
- Mock providers (OpenAI, Anthropic, Ollama)
- Temporary directories for test data
- Mock API responses
"""

import pytest
import tempfile
from pathlib import Path
from unittest.mock import Mock, MagicMock, patch
import json


@pytest.fixture
def temp_dir():
    """Create a temporary directory for test files."""
    with tempfile.TemporaryDirectory() as tmpdir:
        yield Path(tmpdir)


@pytest.fixture
def mock_openai_api_key():
    """Mock OpenAI API key."""
    return "sk-test-openai-key-1234567890"


@pytest.fixture
def mock_anthropic_api_key():
    """Mock Anthropic API key."""
    return "sk-ant-test-key-1234567890"


@pytest.fixture
def mock_openai_embedding_response():
    """Mock response from OpenAI embedding API."""
    return {
        "data": [
            {
                "embedding": [0.1, 0.2, 0.3, 0.4] * 128,  # 512-dimensional embedding
                "index": 0,
                "object": "embedding"
            }
        ],
        "model": "text-embedding-3-small",
        "object": "list",
        "usage": {
            "prompt_tokens": 10,
            "total_tokens": 10
        }
    }


@pytest.fixture
def mock_openai_chat_response():
    """Mock response from OpenAI chat completion API."""
    return {
        "id": "chatcmpl-test123",
        "object": "chat.completion",
        "created": 1234567890,
        "model": "gpt-4",
        "choices": [
            {
                "index": 0,
                "message": {
                    "role": "assistant",
                    "content": "This is a test response from the mock OpenAI API."
                },
                "finish_reason": "stop"
            }
        ],
        "usage": {
            "prompt_tokens": 20,
            "completion_tokens": 12,
            "total_tokens": 32
        }
    }


@pytest.fixture
def mock_anthropic_response():
    """Mock response from Anthropic API."""
    return {
        "id": "msg-test123",
        "type": "message",
        "role": "assistant",
        "content": [
            {
                "type": "text",
                "text": "This is a test response from the mock Anthropic API."
            }
        ],
        "model": "claude-3-sonnet-20240229",
        "stop_reason": "end_turn",
        "stop_sequence": None,
        "usage": {
            "input_tokens": 20,
            "output_tokens": 12
        }
    }


@pytest.fixture
def mock_ollama_response():
    """Mock response from Ollama API."""
    return {
        "model": "mistral",
        "created_at": "2024-01-01T00:00:00Z",
        "response": "This is a test response from the mock Ollama API.",
        "done": True,
        "context": [1, 2, 3],
        "total_duration": 1000000000,
        "load_duration": 500000000,
        "prompt_eval_count": 20,
        "prompt_eval_duration": 300000000,
        "eval_count": 12,
        "eval_duration": 200000000
    }


@pytest.fixture
def mock_ollama_embedding_response():
    """Mock response from Ollama embedding API."""
    return {
        "embedding": [0.1, 0.2, 0.3, 0.4] * 128  # 512-dimensional embedding
    }


@pytest.fixture
def sample_markdown_content():
    """Sample markdown content for testing."""
    return """# Getting Started with Prompts

## Introduction

This is a comprehensive guide to prompt engineering.

## Basic Concepts

- Prompt engineering
- LLMs
- Few-shot learning

## Code Example

```python
def hello_world():
    print("Hello, World!")
```

## Conclusion

Prompts are powerful tools.
"""


@pytest.fixture
def sample_markdown_file(temp_dir, sample_markdown_content):
    """Create a sample markdown file."""
    md_file = temp_dir / "test_tutorial.md"
    md_file.write_text(sample_markdown_content)
    return md_file


@pytest.fixture
def sample_metadata():
    """Sample metadata for a tutorial."""
    return {
        "title": "Getting Started with Prompts",
        "description": "Learn the basics of prompt engineering",
        "difficulty": "beginner",
        "tags": ["prompts", "llm", "basics"],
        "author": "Test Author",
        "created_date": "2024-01-01",
        "updated_date": "2024-01-15"
    }


@pytest.fixture
def sample_metadata_file(temp_dir, sample_metadata):
    """Create a sample metadata file."""
    meta_file = temp_dir / "test_tutorial_meta.json"
    meta_file.write_text(json.dumps(sample_metadata))
    return meta_file


@pytest.fixture
def mock_openai_provider(mock_openai_api_key):
    """Create a mock OpenAI provider."""
    mock_provider = MagicMock()
    mock_provider.api_key = mock_openai_api_key
    mock_provider.model = "gpt-4"
    mock_provider.generate = MagicMock(return_value="Mock OpenAI response")
    mock_provider.chat = MagicMock(return_value="Mock OpenAI chat response")
    mock_provider.embed_text = MagicMock(return_value=[0.1] * 512)
    mock_provider.embed_texts = MagicMock(return_value=[[0.1] * 512, [0.2] * 512])
    return mock_provider


@pytest.fixture
def mock_anthropic_provider(mock_anthropic_api_key):
    """Create a mock Anthropic provider."""
    mock_provider = MagicMock()
    mock_provider.api_key = mock_anthropic_api_key
    mock_provider.model = "claude-3-sonnet-20240229"
    mock_provider.generate = MagicMock(return_value="Mock Anthropic response")
    mock_provider.chat = MagicMock(return_value="Mock Anthropic chat response")
    mock_provider.embed_text = MagicMock(return_value=[0.1] * 384)
    mock_provider.embed_texts = MagicMock(return_value=[[0.1] * 384, [0.2] * 384])
    return mock_provider


@pytest.fixture
def mock_ollama_provider():
    """Create a mock Ollama provider."""
    mock_provider = MagicMock()
    mock_provider.base_url = "http://localhost:11434"
    mock_provider.model = "mistral"
    mock_provider.generate = MagicMock(return_value="Mock Ollama response")
    mock_provider.chat = MagicMock(return_value="Mock Ollama chat response")
    mock_provider.embed_text = MagicMock(return_value=[0.1] * 768)
    mock_provider.embed_texts = MagicMock(return_value=[[0.1] * 768, [0.2] * 768])
    return mock_provider


@pytest.fixture
def mock_config(monkeypatch):
    """Mock configuration."""
    from config import Config
    monkeypatch.setattr(Config, "LLM_PROVIDER", "openai")
    monkeypatch.setattr(Config, "EMBEDDING_PROVIDER", "openai")
    monkeypatch.setattr(Config, "OPENAI_API_KEY", "sk-test-key")
    monkeypatch.setattr(Config, "ANTHROPIC_API_KEY", None)
    monkeypatch.setattr(Config, "OLLAMA_BASE_URL", "http://localhost:11434")
    monkeypatch.setattr(Config, "DEBUG", True)
    return Config


@pytest.fixture
def flask_app():
    """Create Flask test app."""
    from web.app import app
    app.config['TESTING'] = True
    return app


@pytest.fixture
def flask_client(flask_app):
    """Create Flask test client."""
    return flask_app.test_client()


@pytest.fixture
def mock_http_server():
    """Create a mock HTTP server for Ollama tests."""
    mock_server = MagicMock()
    mock_server.send_request = MagicMock()
    return mock_server
