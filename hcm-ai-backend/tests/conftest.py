"""
Shared test fixtures.
"""

import os
import pytest
from unittest.mock import MagicMock, patch

from fastapi.testclient import TestClient


@pytest.fixture(scope="session", autouse=True)
def set_test_env():
    """Set test environment variables before any imports."""
    os.environ["GEMINI_API_KEY"] = "test-key"
    os.environ["GROQ_API_KEY"] = "test-groq-key"
    os.environ["CHROMA_PERSIST_DIR"] = "./data/test_chroma_db"
    os.environ["RAW_DOCUMENTS_DIR"] = "./data/test_raw_documents"
    os.environ["EMBEDDING_MODEL"] = "intfloat/multilingual-e5-large"
    yield


@pytest.fixture
def mock_embedding_model():
    """Mock the embedding model to avoid loading 2.2GB in tests."""
    import numpy as np

    mock_model = MagicMock()
    # Return a random 1024-dim normalized vector for any input
    mock_model.encode.return_value = np.random.randn(1, 1024).astype(np.float32)

    with patch("app.rag.embeddings._model", mock_model):
        with patch("app.rag.embeddings.get_model", return_value=mock_model):
            yield mock_model


@pytest.fixture
def mock_gemini():
    """Mock Gemini API calls."""
    with patch("app.llm.gemini_client._get_gemini_client") as mock_client:
        mock_response = MagicMock()
        mock_response.text = "Đây là câu trả lời mẫu về triết học Mác-Lênin."
        mock_client.return_value.models.generate_content.return_value = mock_response
        yield mock_client


@pytest.fixture
def client(mock_embedding_model):
    """FastAPI test client with mocked embedding model."""
    # Import after environment is set
    from app.main import app
    with TestClient(app) as c:
        yield c
