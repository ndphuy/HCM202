"""
Two-layer relevance guardrail to refuse off-topic questions.

Layer 1 (cheap, no LLM call):
  Compare query embedding similarity against the corpus.
  If max similarity is below a threshold → very likely off-topic → canned refusal.

Layer 2 (belt-and-suspenders):
  The chat system prompt itself instructs the model to refuse off-topic questions.
  This is handled in the prompt, not in this module.
"""

import logging
from typing import Optional

from app.core.config import get_settings
from app.core.prompts import OFF_TOPIC_REFUSAL
from app.rag.embeddings import embed_query
from app.rag.ingest import get_chroma_collection

logger = logging.getLogger(__name__)


def check_relevance(query: str) -> tuple[bool, Optional[str]]:
    """
    Layer 1 guardrail: check if the query is on-topic by comparing its
    embedding against the corpus.

    Args:
        query: The student's question.

    Returns:
        Tuple of (is_relevant, refusal_message).
        - (True, None) if the query is on-topic.
        - (False, refusal_message) if the query is off-topic.
    """
    settings = get_settings()
    collection = get_chroma_collection()

    # If no documents are ingested, auto-ingest raw documents
    if collection.count() == 0:
        logger.info("No documents ingested — auto-ingesting raw documents from %s", settings.RAW_DOCUMENTS_DIR)
        from app.rag.ingest import batch_ingest_directory
        batch_ingest_directory(settings.RAW_DOCUMENTS_DIR)

    query_embedding = embed_query(query)

    # Get the single most similar chunk
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=1,
        include=["distances"],
    )

    if not results or not results["distances"] or not results["distances"][0]:
        logger.warning("No results from ChromaDB — allowing query through.")
        return True, None

    # ChromaDB with cosine space returns distances where lower = more similar
    # Distance range: 0 (identical) to 2 (opposite)
    # We convert to similarity: similarity = 1 - (distance / 2)
    min_distance = results["distances"][0][0]
    similarity = 1.0 - (min_distance / 2.0)

    logger.info(
        "Relevance check: distance=%.4f, similarity=%.4f, threshold=%.4f",
        min_distance,
        similarity,
        settings.RELEVANCE_THRESHOLD,
    )

    if similarity < settings.RELEVANCE_THRESHOLD:
        logger.info("Query classified as OFF-TOPIC: '%s'", query[:100])
        return False, OFF_TOPIC_REFUSAL

    return True, None
