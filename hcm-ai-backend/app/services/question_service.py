"""
Question service: generates MCQs from ingested documents and checks answers.
"""

import json
import logging
import random
from typing import Literal

from fastapi import HTTPException

from app.core.prompts import MCQ_GENERATION_PROMPT
from app.llm.gemini_client import generate_mcq_json
from app.rag.ingest import document_registry
from app.schemas.questions import (
    CheckAnswerRequest,
    CheckAnswerResponse,
    GenerateQuestionsResponse,
    MCQQuestion,
)

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# In-memory store for generated questions (for the /check endpoint)
# question_id → MCQQuestion
# ---------------------------------------------------------------------------
_generated_questions: dict[str, MCQQuestion] = {}

# Maximum characters of document text to send to the LLM
MAX_DOCUMENT_TEXT_LENGTH = 30_000


def _get_random_documents_text(num_docs: int = 3) -> tuple[str, str]:
    """
    Return text from randomly selected documents from the registry to create diversity.

    Returns:
        Tuple of (document_names_str, combined_document_text).

    Raises:
        HTTPException 503 if no documents are ingested yet.
    """
    if not document_registry:
        raise HTTPException(
            status_code=503,
            detail=(
                "No documents are ingested yet. "
                "The server is still starting up or the documents directory is empty."
            ),
        )
    
    # Pick a random sample of document IDs
    doc_ids = list(document_registry.keys())
    selected_ids = random.sample(doc_ids, min(num_docs, len(doc_ids)))
    
    combined_texts = []
    combined_names = []
    
    for d_id in selected_ids:
        doc = document_registry[d_id]
        combined_names.append(doc["name"])
        combined_texts.append(f"--- Bắt đầu nội dung: {doc['name']} ---\n{doc['full_text']}")
        
    document_name = ", ".join(combined_names)
    document_text = "\n\n".join(combined_texts)
    
    return document_name, document_text


async def generate_questions(
    num_questions: int = 5,
    level: Literal["easy", "medium", "hard"] = "medium",
) -> GenerateQuestionsResponse:
    """
    Generate MCQs from the pre-ingested course document.

    Flow:
    1. Auto-select random documents from the in-memory registry.
    2. Build prompt from MCQ_GENERATION_PROMPT template.
    3. Call Gemini with structured JSON output.
    4. Validate against Pydantic schema.
    5. Store questions for later /check calls.
    6. Return response.
    """
    # 1. Auto-select random documents
    document_name, document_text = _get_random_documents_text(num_docs=3)

    logger.info(
        "Generating %d MCQs (level=%s) from document: %s",
        num_questions, level, document_name,
    )

    # Truncate if too long for the context window
    if len(document_text) > MAX_DOCUMENT_TEXT_LENGTH:
        logger.warning(
            "Document text truncated from %d to %d chars for MCQ generation.",
            len(document_text),
            MAX_DOCUMENT_TEXT_LENGTH,
        )
        document_text = document_text[:MAX_DOCUMENT_TEXT_LENGTH]

    # 2. Build prompt
    prompt = MCQ_GENERATION_PROMPT.format(
        num_questions=num_questions,
        level=level,
        document_text=document_text,
    )

    # 3. Call LLM with structured output
    try:
        raw_result = generate_mcq_json(prompt, GenerateQuestionsResponse)
    except Exception as e:
        logger.error("MCQ generation failed: %s", e)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate questions: {e}",
        )

    # 4. Validate and parse
    try:
        # raw_result might be a dict or might need parsing
        if isinstance(raw_result, str):
            raw_result = json.loads(raw_result)

        # Handle the case where the LLM returns the questions list directly
        if isinstance(raw_result, list):
            raw_result = {"questions": raw_result}

        # Ensure questions have proper IDs
        questions_data = raw_result.get("questions", [])
        validated_questions = []
        for i, q_data in enumerate(questions_data):
            if isinstance(q_data, dict):
                if "id" not in q_data or not q_data["id"]:
                    q_data["id"] = f"q{i + 1}"
                question = MCQQuestion(**q_data)
            else:
                # Already a Pydantic model
                question = q_data
                if not question.id:
                    question.id = f"q{i + 1}"
            validated_questions.append(question)

        response = GenerateQuestionsResponse(
            questions=validated_questions,
            document_used=document_name,
        )

    except Exception as e:
        logger.error("MCQ validation failed: %s | Raw: %s", e, raw_result)
        raise HTTPException(
            status_code=500,
            detail=f"Generated questions failed validation: {e}",
        )

    # 5. Store questions for /check endpoint
    for q in response.questions:
        _generated_questions[q.id] = q

    logger.info(
        "Generated %d MCQs from document '%s'",
        len(response.questions),
        document_name,
    )

    return response


async def check_answer(request: CheckAnswerRequest) -> CheckAnswerResponse:
    """
    Check a student's answer against a previously generated question.
    Pure local lookup — no LLM call needed.
    """
    question = _generated_questions.get(request.question_id)
    if question is None:
        raise HTTPException(
            status_code=404,
            detail=f"Question '{request.question_id}' not found. "
            "Generate questions first via /api/questions/generate.",
        )

    is_correct = request.selected_index == question.correct_index
    explanation = question.explanations[request.selected_index]

    return CheckAnswerResponse(
        correct=is_correct,
        explanation=explanation,
    )
