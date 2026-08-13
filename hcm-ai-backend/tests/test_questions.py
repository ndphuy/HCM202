"""
Tests for the question generation and checking endpoints.
"""

from unittest.mock import patch

from app.schemas.questions import MCQQuestion


def test_generate_returns_valid_schema(client):
    """Generate endpoint should return valid MCQ schema."""
    # Register a fake document in the registry
    from app.rag.ingest import document_registry

    document_registry["test_doc_1"] = {
        "name": "Test_Document.pdf",
        "file_path": "/fake/path.pdf",
        "full_text": "Triết học Mác-Lênin nghiên cứu các quy luật chung nhất...",
        "num_chunks": 5,
    }

    mock_mcq_result = {
        "questions": [
            {
                "id": "q1",
                "question": "Triết học Mác-Lênin là gì?",
                "options": [
                    "Hệ thống triết học khoa học",
                    "Một tôn giáo",
                    "Một phương pháp nấu ăn",
                    "Một loại toán học",
                ],
                "correct_index": 0,
                "explanations": [
                    "Đúng — đây là định nghĩa cơ bản.",
                    "Sai — đây không phải tôn giáo.",
                    "Sai — không liên quan.",
                    "Sai — không phải toán học.",
                ],
            }
        ]
    }

    with patch(
        "app.services.question_service.generate_mcq_json",
        return_value=mock_mcq_result,
    ):
        response = client.get(
            "/api/questions/generate",
            params={"num_questions": 1, "level": "easy"},
        )

    assert response.status_code == 200
    data = response.json()
    assert "questions" in data
    assert len(data["questions"]) == 1

    q = data["questions"][0]
    assert len(q["options"]) == 4
    assert len(q["explanations"]) == 4
    assert 0 <= q["correct_index"] <= 3


def test_generate_when_no_documents_returns_503(client):
    """Generate should return 503 if no documents are ingested."""
    from app.rag.ingest import document_registry
    document_registry.clear()
    response = client.get(
        "/api/questions/generate",
        params={"num_questions": 5},
    )
    assert response.status_code == 503


def test_check_answer_correct(client):
    """Check endpoint should correctly identify a right answer."""
    # First, store a question in the service's in-memory store
    from app.services.question_service import _generated_questions

    _generated_questions["test_q1"] = MCQQuestion(
        id="test_q1",
        question="Test question?",
        options=["A", "B", "C", "D"],
        correct_index=2,
        explanations=["Sai A", "Sai B", "Đúng C", "Sai D"],
    )

    response = client.get(
        "/api/questions/check",
        params={"question_id": "test_q1", "selected_index": 2},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["correct"] is True
    assert "Đúng" in data["explanation"]


def test_check_answer_incorrect(client):
    """Check endpoint should correctly identify a wrong answer."""
    from app.services.question_service import _generated_questions

    _generated_questions["test_q2"] = MCQQuestion(
        id="test_q2",
        question="Test question?",
        options=["A", "B", "C", "D"],
        correct_index=0,
        explanations=["Đúng A", "Sai B", "Sai C", "Sai D"],
    )

    response = client.get(
        "/api/questions/check",
        params={"question_id": "test_q2", "selected_index": 3},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["correct"] is False
    assert "Sai" in data["explanation"]


def test_check_nonexistent_question_returns_404(client):
    """Check with unknown question_id should return 404."""
    response = client.get(
        "/api/questions/check",
        params={"question_id": "nonexistent_q", "selected_index": 0},
    )
    assert response.status_code == 404
