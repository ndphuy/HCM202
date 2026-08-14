"""
Embedding helper supporting Gemini API embeddings (0 MB server RAM)
with lightweight fallback to prevent OOM errors.
"""

import hashlib
import logging
from typing import Optional

import numpy as np

from app.core.config import get_settings

logger = logging.getLogger(__name__)


def _lightweight_hash_embedding(text: str, dim: int = 768) -> list[float]:
    """
    Ultra-lightweight deterministic embedding fallback (0.1 MB RAM).
    Hashes n-grams to produce a normalized vector when API is unavailable.
    """
    vec = np.zeros(dim, dtype=np.float32)
    words = text.lower().split()
    for w in words:
        h = int(hashlib.md5(w.encode("utf-8")).hexdigest(), 16)
        idx = h % dim
        val = 1.0 if (h % 2 == 0) else -1.0
        vec[idx] += val

    norm = np.linalg.norm(vec)
    if norm > 0:
        vec /= norm
    return vec.tolist()


def embed_texts(
    texts: list[str],
    *,
    prefix: str = "passage: ",
    batch_size: int = 32,
) -> list[list[float]]:
    """
    Encode a list of texts into embeddings.
    Tries Gemini API models first (0 MB RAM).
    """
    settings = get_settings()

    # 1. Try Gemini API Embedding with multiple supported model identifiers
    if settings.GEMINI_API_KEY and settings.GEMINI_API_KEY != "your_key_here":
        try:
            from app.llm.gemini_client import _get_gemini_client
            client = _get_gemini_client()

            candidate_models = [
                "text-embedding-004",
                "embedding-001",
                "models/text-embedding-004",
                "models/embedding-001",
            ]

            for model_name in candidate_models:
                try:
                    results = []
                    for i in range(0, len(texts), batch_size):
                        batch = texts[i : i + batch_size]
                        res = client.models.embed_content(
                            model=model_name,
                            contents=batch,
                        )
                        if hasattr(res, "embeddings") and res.embeddings:
                            results.extend([e.values for e in res.embeddings])
                        elif hasattr(res, "embedding") and res.embedding:
                            results.append(res.embedding.values)

                    if results and len(results) == len(texts):
                        logger.info("Successfully embedded %d texts via Gemini API (%s)", len(texts), model_name)
                        return results
                except Exception as model_err:
                    logger.debug("Gemini model '%s' unavailable: %s", model_name, model_err)
                    continue

        except Exception as e:
            logger.warning("Gemini embedding API error: %s", e)

    # 2. Ultra-lightweight local fallback (never triggers PyTorch OOM)
    logger.info("Using lightweight fallback embedding for %d texts...", len(texts))
    return [_lightweight_hash_embedding(t) for t in texts]


def embed_query(query: str) -> list[float]:
    """Embed a single search query."""
    result = embed_texts([query], prefix="query: ")
    return result[0]
