"""
Application settings loaded from environment variables.
Uses pydantic-settings to read from .env file.
"""

from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Central configuration — all values can be overridden via .env or env vars."""

    # --- LLM: Gemini (primary) ---
    GEMINI_API_KEY: str = "your_key_here"
    GEMINI_CHAT_MODEL: str = "gemini-2.5-flash"

    # --- LLM: Groq (fallback) ---
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama-3.3-70b-versatile"

    # --- Embeddings ---
    EMBEDDING_MODEL: str = "intfloat/multilingual-e5-small"

    # --- Base Directory ---
    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent

    # --- ChromaDB ---
    CHROMA_PERSIST_DIR: str = str(Path(__file__).resolve().parent.parent.parent / "data" / "chroma_db")

    # --- Document ingestion ---
    RAW_DOCUMENTS_DIR: str = str(Path(__file__).resolve().parent.parent.parent / "data" / "raw_documents")
    PARSED_TEXT_CACHE_DIR: str = str(Path(__file__).resolve().parent.parent.parent / "data" / "parsed_text")

    # --- RAG tuning ---
    RELEVANCE_THRESHOLD: float = 0.45
    RETRIEVAL_TOP_K: int = 5

    # --- OCR ---
    # Path to the Tesseract binary. Leave empty to auto-detect.
    TESSERACT_CMD: str = ""

    # --- Chunking ---
    CHUNK_SIZE: int = 600  # target tokens per chunk
    CHUNK_OVERLAP: int = 100

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "extra": "ignore",
    }

    def ensure_dirs(self) -> None:
        """Create data directories if they don't exist."""
        Path(self.CHROMA_PERSIST_DIR).mkdir(parents=True, exist_ok=True)
        Path(self.RAW_DOCUMENTS_DIR).mkdir(parents=True, exist_ok=True)
        Path(self.PARSED_TEXT_CACHE_DIR).mkdir(parents=True, exist_ok=True)


@lru_cache()
def get_settings() -> Settings:
    """Cached singleton — import and call this everywhere."""
    return Settings()
