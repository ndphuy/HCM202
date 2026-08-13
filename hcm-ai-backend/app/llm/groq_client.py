"""
Groq fallback LLM client.
Only called when Gemini API fails (rate limit / quota exhausted).
"""

import json
import logging
from typing import Optional

from groq import Groq

from app.core.config import get_settings

logger = logging.getLogger(__name__)

_groq_client: Optional[Groq] = None


def _get_groq_client() -> Groq:
    """Lazily initialize the Groq client."""
    global _groq_client
    if _groq_client is None:
        settings = get_settings()
        if not settings.GROQ_API_KEY:
            raise RuntimeError(
                "Groq fallback requested but GROQ_API_KEY is not set in .env"
            )
        _groq_client = Groq(api_key=settings.GROQ_API_KEY)
        logger.info("Groq fallback client initialized (model: %s)", settings.GROQ_MODEL)
    return _groq_client


def generate_chat_answer_groq(prompt: str) -> str:
    """
    Generate a chat response using Groq (Llama 3.x).

    Args:
        prompt: The full prompt (system + context + query).

    Returns:
        The model's text response.
    """
    settings = get_settings()
    client = _get_groq_client()

    logger.warning("Using Groq fallback for chat generation.")

    response = client.chat.completions.create(
        model=settings.GROQ_MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.0,
        max_tokens=2048,
    )

    return response.choices[0].message.content


def generate_mcq_json_groq(prompt: str) -> dict:
    """
    Generate MCQ JSON using Groq with JSON mode.

    Note: Groq doesn't have native response_schema like Gemini.
    We use JSON mode and parse the output.

    Args:
        prompt: The full MCQ generation prompt.

    Returns:
        Parsed JSON dict.
    """
    settings = get_settings()
    client = _get_groq_client()

    logger.warning("Using Groq fallback for MCQ generation.")

    # Append JSON instruction to the prompt
    json_prompt = (
        prompt + "\n\nIMPORTANT: Return your response as valid JSON with this "
        'structure: {"questions": [{"id": "q1", "question": "...", '
        '"options": ["A", "B", "C", "D"], "correct_index": 0, '
        '"explanations": ["...", "...", "...", "..."]}]}'
    )

    response = client.chat.completions.create(
        model=settings.GROQ_MODEL,
        messages=[{"role": "user", "content": json_prompt}],
        temperature=0.0,
        max_tokens=4096,
        response_format={"type": "json_object"},
    )

    return json.loads(response.choices[0].message.content)
