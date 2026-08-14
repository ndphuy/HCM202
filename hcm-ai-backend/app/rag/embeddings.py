"""
Embedding helper supporting Gemini API embeddings (0 MB server RAM)
with fallback to local SentenceTransformers.
"""

import logging
from typing import Optional

import numpy as np

from app.core.config import get_settings

logger = logging.getLogger(__name__)

_model: Optional[object] = None


def get_model():
    """Lazily load local SentenceTransformer model as fallback."""
    global _model
    if _model is None:
        from sentence_transformers import SentenceTransformer
        settings = get_settings()
        logger.info("Loading local embedding model: %s ...", settings.EMBEDDING_MODEL)
        _model = SentenceTransformer(settings.EMBEDDING_MODEL)
        logger.info("Local embedding model loaded successfully.")
    return _model


def embed_texts(
    texts: list[str],
    *,
    prefix: str = "passage: ",
    batch_size: int = 32,
) -> list[list[float]]:
    """
    Encode a list of texts into embeddings.
    Tries Gemini API (text-embedding-004) first for 0 MB RAM overhead.
    """
    settings = get_settings()

    # 1. Try Gemini API Embedding
    if settings.GEMINI_API_KEY and settings.GEMINI_API_KEY != "your_key_here":
        try:
            from app.llm.gemini_client import _get_gemini_client
            client = _get_gemini_client()
            results = []
            for i in range(0, len(texts), batch_size):
                batch = texts[i : i + batch_size]
                res = client.models.embed_content(
                    model="text-embedding-004",
                    contents=batch,
                )
                if hasattr(res, "embeddings") and res.embeddings:
                    results.extend([e.values for e in res.embeddings])
                elif hasattr(res, "embedding") and res.embedding:
                    results.append(res.embedding.values)
            if results and len(results) == len(texts):
                return results
        except Exception as e:
            logger.warning("Gemini embedding API failed (%s), falling back to local...", e)

    # 2. Local fallback
    model = get_model()
    prefixed = [f"{prefix}{t}" for t in texts]
    embeddings: np.ndarray = model.encode(
        prefixed,
        batch_size=batch_size,
        normalize_embeddings=True,
        show_progress_bar=len(texts) > 50,
    )
    return embeddings.tolist()


def embed_query(query: str) -> list[float]:
    """Embed a single search query."""
    result = embed_texts([query], prefix="query: ")
    return result[0]
