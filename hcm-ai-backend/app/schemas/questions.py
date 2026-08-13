"""Pydantic schemas for the question generator feature."""

from pydantic import BaseModel, Field
from typing import Literal, Optional


class MCQQuestion(BaseModel):
    """A single multiple-choice question with per-option explanations."""
    id: str
    question: str
    options: list[str] = Field(min_length=4, max_length=4)
    correct_index: int = Field(ge=0, le=3)
    explanations: list[str] = Field(min_length=4, max_length=4)


class GenerateQuestionsResponse(BaseModel):
    """Response containing generated MCQs."""
    questions: list[MCQQuestion]
    document_used: Optional[str] = None  # Name of the document used for generation


class CheckAnswerRequest(BaseModel):
    """Request to check a student's answer to a generated question."""
    question_id: str
    selected_index: int = Field(ge=0, le=3)


class CheckAnswerResponse(BaseModel):
    """Response indicating whether the answer was correct + explanation."""
    correct: bool
    explanation: str
