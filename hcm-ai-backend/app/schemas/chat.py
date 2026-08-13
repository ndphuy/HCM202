"""Pydantic schemas for the chat feature."""

from pydantic import BaseModel
from typing import Literal, Optional


class SourceChunk(BaseModel):
    """A source chunk returned alongside the chatbot answer for citation."""
    document: str
    chunk_id: str
    snippet: str


class ChatRequest(BaseModel):
    """Incoming chat request from the student."""
    query: str
    session_id: Optional[str] = None
    response_format: Literal["text", "json"] = "text"


class ChatResponse(BaseModel):
    """Chatbot response with grounded answer and source citations."""
    answer: str
    is_relevant: bool
    sources: list[SourceChunk] = []
    session_id: Optional[str] = None
