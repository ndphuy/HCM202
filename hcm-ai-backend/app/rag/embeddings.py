"""
Wrapper around sentence-transformers for embedding text.

Uses intfloat/multilingual-e5-large which requires specific prefixes:
- "query: " for search queries
- "passage: " for document chunks being indexed
"""

import logging
from typing import Optional

import numpy as np
from sentence_transformers import SentenceTransformer

from app.core.config import get_settings

logger = logging.getLogger(__name__)

_model: Optional[SentenceTransformer] = None


def get_model() -> SentenceTransformer:
    """Lazily load the embedding model (first call downloads ~2.2 GB)."""
    global _model
    if _model is None:
        settings = get_settings()
        logger.info("Loading embedding model: %s ...", settings.EMBEDDING_MODEL)
        _model = SentenceTransformer(settings.EMBEDDING_MODEL)
        logger.info("Embedding model loaded successfully.")
    return _model


def embed_texts(
    texts: list[str],
    *,
    prefix: str = "passage: ",
    batch_size: int = 32,
) -> list[list[float]]:
    """
    Encode a list of texts into embeddings.

    Args:
        texts: Raw text strings to embed.
        prefix: "passage: " for indexing, "query: " for search queries.
                Required by the multilingual-e5-large model for best results.
        batch_size: Batch size for encoding.

    Returns:
        List of embedding vectors (each a list of floats).
    """
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
    """Embed a single search query (uses 'query: ' prefix)."""
    result = embed_texts([query], prefix="query: ")
    return result[0]
