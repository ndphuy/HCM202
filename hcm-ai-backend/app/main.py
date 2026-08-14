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
    Ensures data directories exist and starts FastAPI immediately.
    """
    settings = get_settings()
    settings.ensure_dirs()

    logger.info("=" * 60)
    logger.info("HCM202 AI Study Assistant — Starting up")
    logger.info("=" * 60)

    yield  # App is running instantly

    logger.info("Shutting down HCM202 AI Study Assistant.")

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
