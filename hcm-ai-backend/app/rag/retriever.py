"""
Similarity search against ChromaDB for RAG retrieval.
"""

import logging

from app.core.config import get_settings
from app.rag.embeddings import embed_query
from app.rag.ingest import get_chroma_collection

logger = logging.getLogger(__name__)


def retrieve(query: str, top_k: int | None = None) -> list[dict]:
    """
    Embed the user query and find the top-k most similar chunks.

    Args:
        query: The student's question.
        top_k: Number of results to return (defaults to settings.RETRIEVAL_TOP_K).

    Returns:
        List of dicts, each with:
          - document: source document name
          - page: page number (or 0 if unavailable)
          - chunk_id: unique chunk identifier
          - snippet: the chunk text
          - distance: cosine distance (lower = more similar)
    """
    settings = get_settings()
    if top_k is None:
        top_k = settings.RETRIEVAL_TOP_K

    collection = get_chroma_collection()

    # If the collection is empty, auto-ingest raw_documents
    if collection.count() == 0:
        logger.info("ChromaDB collection is empty — auto-ingesting documents from %s", settings.RAW_DOCUMENTS_DIR)
        from app.rag.ingest import batch_ingest_directory
        batch_ingest_directory(settings.RAW_DOCUMENTS_DIR)

    query_embedding = embed_query(query)

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=min(top_k, collection.count()),
        include=["documents", "metadatas", "distances"],
    )

    chunks = []
    if results and results["ids"] and results["ids"][0]:
        for i, chunk_id in enumerate(results["ids"][0]):
            chunks.append({
                "document": results["metadatas"][0][i].get("document_name", "unknown"),
                "page": results["metadatas"][0][i].get("page", 0),
                "chunk_id": chunk_id,
                "snippet": results["documents"][0][i],
                "distance": results["distances"][0][i],
            })

    logger.info(
        "Retrieved %d chunks for query (top distance: %.4f)",
        len(chunks),
        chunks[0]["distance"] if chunks else -1,
    )
    return chunks
