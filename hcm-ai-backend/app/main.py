"""
FastAPI application entrypoint.

Includes:
- CORS middleware (permissive for dev)
- /health endpoint
- All API routers under /api prefix
- Lifespan handler: preloads embedding model + batch-ingests documents on startup
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes_chat import router as chat_router
from app.api.routes_questions import router as questions_router
from app.core.config import get_settings

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-7s | %(name)s | %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Startup/shutdown lifecycle.

    On startup:
    1. Ensure data directories exist.
    2. Pre-load the embedding model (first-time download ~2.2 GB).
    3. Batch-ingest any documents found in RAW_DOCUMENTS_DIR.
    """
    settings = get_settings()
    settings.ensure_dirs()

    logger.info("=" * 60)
    logger.info("MLN AI Study Assistant — Starting up")
    logger.info("=" * 60)

    # Pre-load embedding model
    try:
        logger.info("Pre-loading embedding model: %s", settings.EMBEDDING_MODEL)
        from app.rag.embeddings import get_model
        get_model()

        # Batch-ingest documents from the raw_documents directory
        logger.info("Scanning for documents in: %s", settings.RAW_DOCUMENTS_DIR)
        from app.rag.ingest import batch_ingest_directory
        results = batch_ingest_directory(settings.RAW_DOCUMENTS_DIR)
        if results:
            logger.info("Auto-ingested %d document(s):", len(results))
            for r in results:
                logger.info("  • %s (%s) — %d chunks", r["name"], r["document_id"], r["num_chunks"])
        else:
            logger.info("No documents found to auto-ingest.")
    except Exception as e:
        logger.error("Error during startup pre-loading: %s", e)

    logger.info("=" * 60)
    logger.info("Ready to serve requests!")
    logger.info("=" * 60)

    yield  # App is running

    # Shutdown
    logger.info("Shutting down MLN AI Study Assistant.")


# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------
app = FastAPI(
    title="MLN AI Study Assistant",
    description=(
        "AI backend for studying Marxist-Leninist Philosophy (Triết học Mác - Lênin). "
        "Features: RAG chatbot and MCQ question generator."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — permissive for dev; tighten for production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(chat_router, prefix="/api")
app.include_router(questions_router, prefix="/api")


@app.get("/health", tags=["Health"])
async def health():
    """Health check endpoint."""
    return {"status": "ok"}
