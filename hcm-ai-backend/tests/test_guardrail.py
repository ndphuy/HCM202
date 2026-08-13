"""
Tests for the relevance guardrail.
"""

from unittest.mock import patch, MagicMock


def test_on_topic_query_passes_guardrail():
    """Known on-topic queries should pass the guardrail."""
    # Mock ChromaDB to return a close distance (= high similarity)
    mock_collection = MagicMock()
    mock_collection.count.return_value = 100
    mock_collection.query.return_value = {
        "ids": [["chunk1"]],
        "distances": [[0.3]],  # cosine distance 0.3 → similarity 0.85
    }

    with patch("app.rag.guardrail.get_chroma_collection", return_value=mock_collection):
        with patch("app.rag.guardrail.embed_query", return_value=[0.1] * 1024):
            from app.rag.guardrail import check_relevance

            is_relevant, msg = check_relevance(
                "Phân tích quy luật mâu thuẫn trong triết học Mác-Lênin"
            )

    assert is_relevant is True
    assert msg is None


def test_off_topic_query_fails_guardrail():
    """Known off-topic queries should fail the guardrail."""
    # Mock ChromaDB to return a far distance (= low similarity)
    mock_collection = MagicMock()
    mock_collection.count.return_value = 100
    mock_collection.query.return_value = {
        "ids": [["chunk1"]],
        "distances": [[1.8]],  # cosine distance 1.8 → similarity 0.1
    }

    with patch("app.rag.guardrail.get_chroma_collection", return_value=mock_collection):
        with patch("app.rag.guardrail.embed_query", return_value=[0.1] * 1024):
            from app.rag.guardrail import check_relevance

            is_relevant, msg = check_relevance("How to cook pho?")

    assert is_relevant is False
    assert msg is not None
    assert "Xin lỗi" in msg


def test_empty_collection_allows_through():
    """If no documents are ingested, queries should be allowed through."""
    mock_collection = MagicMock()
    mock_collection.count.return_value = 0

    with patch("app.rag.guardrail.get_chroma_collection", return_value=mock_collection):
        from app.rag.guardrail import check_relevance

        is_relevant, msg = check_relevance("Any question at all")

    assert is_relevant is True
    assert msg is None


def test_guardrail_with_borderline_similarity():
    """Borderline queries near the threshold should be handled correctly."""
    mock_collection = MagicMock()
    mock_collection.count.return_value = 100

    # Distance that produces similarity right at threshold (0.35)
    # similarity = 1 - (distance / 2) = 0.35 → distance = 1.3
    mock_collection.query.return_value = {
        "ids": [["chunk1"]],
        "distances": [[1.29]],  # just above threshold → should pass
    }

    with patch("app.rag.guardrail.get_chroma_collection", return_value=mock_collection):
        with patch("app.rag.guardrail.embed_query", return_value=[0.1] * 1024):
            from app.rag.guardrail import check_relevance

            is_relevant, msg = check_relevance("Borderline question")

    assert is_relevant is True
