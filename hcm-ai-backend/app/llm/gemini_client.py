"""
Thin wrapper around the google-genai SDK for Gemini calls.
Falls back to Groq when Gemini fails (rate limit / quota exhausted).
"""

import json
import logging
from typing import Any, Optional

from google import genai
from google.genai import types

from app.core.config import get_settings

logger = logging.getLogger(__name__)

_gemini_client: Optional[genai.Client] = None


def _get_gemini_client() -> genai.Client:
    """Lazily initialize the Gemini client."""
    global _gemini_client
    if _gemini_client is None:
        settings = get_settings()
        _gemini_client = genai.Client(api_key=settings.GEMINI_API_KEY)
        logger.info("Gemini client initialized (model: %s)", settings.GEMINI_CHAT_MODEL)
    return _gemini_client


def generate_chat_answer(prompt: str) -> str:
    """
    Generate a chat response using Gemini.
    Falls back to Groq on Gemini API errors.

    Args:
        prompt: The full prompt (system + context + query).

    Returns:
        The model's text response.
    """
    settings = get_settings()

    try:
        client = _get_gemini_client()
        response = client.models.generate_content(
            model=settings.GEMINI_CHAT_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(temperature=0.0),
        )
        return response.text

    except Exception as e:
        logger.warning("Gemini API error: %s. Falling back to Groq...", e)
        return _groq_chat_fallback(prompt)


def generate_mcq_json(prompt: str, response_schema: Any) -> dict:
    """
    Generate structured MCQ JSON using Gemini's native JSON mode.
    Falls back to Groq on Gemini API errors.

    Args:
        prompt: The full MCQ generation prompt.
        response_schema: Pydantic model or JSON schema dict for structured output.

    Returns:
        Parsed JSON dict matching the schema.
    """
    settings = get_settings()

    try:
        client = _get_gemini_client()
        response = client.models.generate_content(
            model=settings.GEMINI_CHAT_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.0,
                response_mime_type="application/json",
                response_schema=response_schema,
            ),
        )
        # Try .parsed first (newer SDK), fall back to json.loads
        if hasattr(response, "parsed") and response.parsed is not None:
            # response.parsed may return a Pydantic model or dict
            result = response.parsed
            if hasattr(result, "model_dump"):
                return result.model_dump()
            return result
        return json.loads(response.text)

    except Exception as e:
        logger.warning("Gemini API error for MCQ: %s. Falling back to Groq...", e)
        return _groq_mcq_fallback(prompt)


# ---------------------------------------------------------------------------
# Groq fallback
# ---------------------------------------------------------------------------
def _groq_chat_fallback(prompt: str) -> str:
    """Fallback chat generation using Groq API."""
    from app.llm.groq_client import generate_chat_answer_groq
    return generate_chat_answer_groq(prompt)


def _groq_mcq_fallback(prompt: str) -> dict:
    """Fallback MCQ generation using Groq API."""
    from app.llm.groq_client import generate_mcq_json_groq
    return generate_mcq_json_groq(prompt)
