"""
Tests for the chat endpoint.
"""

from unittest.mock import patch, MagicMock


def test_health_endpoint(client):
    """Health endpoint should return OK."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_chat_returns_valid_schema(client, mock_gemini):
    """Chat endpoint should return a valid ChatResponse schema."""
    # Mock the guardrail to allow through
    with patch("app.services.chat_service.check_relevance", return_value=(True, None)):
        # Mock retriever to return some chunks
        mock_chunks = [
            {
                "document": "test_doc.pdf",
                "page": 1,
                "chunk_id": "doc1_chunk0",
                "snippet": "Triết học Mác-Lênin là hệ thống triết học...",
                "distance": 0.2,
            }
        ]
        with patch("app.services.chat_service.retrieve", return_value=mock_chunks):
            with patch(
                "app.services.chat_service.generate_chat_answer",
                return_value="Đây là câu trả lời mẫu.",
            ):
                response = client.post(
                    "/api/chat",
                    json={"query": "Triết học Mác-Lênin là gì?"},
                )

    assert response.status_code == 200
    data = response.json()
    assert "answer" in data
    assert "is_relevant" in data
    assert "sources" in data
    assert data["is_relevant"] is True
    assert len(data["sources"]) > 0


def test_off_topic_query_returns_refusal(client):
    """Off-topic queries should return is_relevant=False with refusal message."""
    with patch(
        "app.services.chat_service.check_relevance",
        return_value=(False, "Xin lỗi, câu hỏi này nằm ngoài phạm vi..."),
    ):
        response = client.post(
            "/api/chat",
            json={"query": "How to cook pho?"},
        )

    assert response.status_code == 200
    data = response.json()
    assert data["is_relevant"] is False
    assert "Xin lỗi" in data["answer"]
    assert data["sources"] == []


def test_chat_with_session_id(client, mock_gemini):
    """Chat with session_id should maintain conversation context."""
    with patch("app.services.chat_service.check_relevance", return_value=(True, None)):
        with patch("app.services.chat_service.retrieve", return_value=[]):
            with patch(
                "app.services.chat_service.generate_chat_answer",
                return_value="Câu trả lời.",
            ):
                response = client.post(
                    "/api/chat",
                    json={
                        "query": "Quy luật mâu thuẫn là gì?",
                        "session_id": "test-session-1",
                    },
                )

    assert response.status_code == 200
