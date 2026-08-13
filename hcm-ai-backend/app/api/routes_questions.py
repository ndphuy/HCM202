"""
Question generator API routes:
  GET  /api/questions/generate
  GET  /api/questions/check
"""

import logging
from typing import Annotated, Literal

from fastapi import APIRouter, Query

from app.schemas.questions import (
    CheckAnswerResponse,
    GenerateQuestionsResponse,
)
from app.services.question_service import check_answer as svc_check_answer
from app.services.question_service import generate_questions

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/questions", tags=["Questions"])


@router.get("/generate", response_model=GenerateQuestionsResponse)
async def generate(
    num_questions: Annotated[int, Query(ge=1, le=60, description="Number of questions to generate (1–60)")] = 5,
    level: Annotated[Literal["easy", "medium", "hard"], Query(description="Difficulty level")] = "medium",
) -> GenerateQuestionsResponse:
    """
    Generate multiple-choice questions from the pre-ingested course textbook.

    Questions are generated from the document that was automatically loaded
    on server startup. All four per-option explanations are generated up front,
    so checking answers later is a pure local lookup with no second LLM call.
    """
    return await generate_questions(num_questions=num_questions, level=level)


@router.get("/check", response_model=CheckAnswerResponse)
async def check(
    question_id: Annotated[str, Query(description="The question ID returned from /generate (e.g. q1, q2...)")],
    selected_index: Annotated[int, Query(ge=0, le=3, description="Your answer index: 0, 1, 2, or 3")],
) -> CheckAnswerResponse:
    """
    Check a student's answer to a previously generated question.

    Returns whether the answer is correct and the explanation for the selected option.
    """
    from app.schemas.questions import CheckAnswerRequest
    return await svc_check_answer(CheckAnswerRequest(question_id=question_id, selected_index=selected_index))
