"""
Document ingestion pipeline: parse → chunk → embed → store in ChromaDB.
Supports both text-based PDFs (PyMuPDF) and scanned/image-based PDFs (OCR via pytesseract).
"""

import hashlib
import logging
import re
from pathlib import Path
from typing import Optional

import chromadb
import pymupdf  # PyMuPDF (fitz)

from app.core.config import get_settings
from app.rag.embeddings import embed_texts

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Tesseract OCR setup
# ---------------------------------------------------------------------------
_TESSERACT_CONFIGURED = False

def _configure_tesseract() -> bool:
    """
    Configure pytesseract to find the Tesseract binary.
    Checks the env var first, then common Windows install paths.
    Returns True if Tesseract is available.
    """
    global _TESSERACT_CONFIGURED
    if _TESSERACT_CONFIGURED:
        return True

    try:
        import pytesseract

        settings = get_settings()
        # Use config value if set
        if settings.TESSERACT_CMD and Path(settings.TESSERACT_CMD).exists():
            pytesseract.pytesseract.tesseract_cmd = settings.TESSERACT_CMD
            _TESSERACT_CONFIGURED = True
            logger.info("Tesseract configured from settings: %s", settings.TESSERACT_CMD)
            return True

        # Auto-detect common Windows paths
        candidates = [
            r"C:\Program Files\Tesseract-OCR\tesseract.exe",
            r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
            r"C:\Users\Admin\AppData\Local\Programs\Tesseract-OCR\tesseract.exe",
        ]
        for path in candidates:
            if Path(path).exists():
                pytesseract.pytesseract.tesseract_cmd = path
                _TESSERACT_CONFIGURED = True
                logger.info("Tesseract auto-detected at: %s", path)
                return True

        logger.warning(
            "Tesseract binary not found. OCR fallback will be unavailable. "
            "Install Tesseract and set TESSERACT_CMD in .env."
        )
        return False

    except ImportError:
        logger.warning("pytesseract not installed. OCR fallback unavailable.")
        return False


# Available Tesseract language pack (vie requires tessdata/vie.traineddata)
_VIE_AVAILABLE: Optional[bool] = None

def _get_ocr_lang() -> str:
    """Return the best available Tesseract language string."""
    global _VIE_AVAILABLE
    if _VIE_AVAILABLE is None:
        vie_path = Path(r"C:\Program Files\Tesseract-OCR\tessdata\vie.traineddata")
        _VIE_AVAILABLE = vie_path.exists()
        if _VIE_AVAILABLE:
            logger.info("Vietnamese Tesseract language pack found.")
        else:
            logger.warning(
                "vie.traineddata not found. OCR will use English only. "
                "Download from: https://github.com/tesseract-ocr/tessdata/blob/main/vie.traineddata"
            )
    return "vie+eng" if _VIE_AVAILABLE else "eng"

# ---------------------------------------------------------------------------
# In-memory registry: document_id → metadata
# Shared across modules so the question service can look up full text.
# ---------------------------------------------------------------------------
document_registry: dict[str, dict] = {}

# ---------------------------------------------------------------------------
# ChromaDB client (singleton)
# ---------------------------------------------------------------------------
_chroma_client: Optional[chromadb.PersistentClient] = None
_collection: Optional[chromadb.Collection] = None

COLLECTION_NAME = "mln_documents"


def get_chroma_collection() -> chromadb.Collection:
    """Get or create the ChromaDB collection."""
    global _chroma_client, _collection
    if _collection is None:
        settings = get_settings()
        _chroma_client = chromadb.PersistentClient(path=settings.CHROMA_PERSIST_DIR)
        _collection = _chroma_client.get_or_create_collection(
            name=COLLECTION_NAME,
            metadata={"hnsw:space": "cosine"},
        )
        logger.info(
            "ChromaDB collection '%s' ready (%d items).",
            COLLECTION_NAME,
            _collection.count(),
        )
    return _collection


# ---------------------------------------------------------------------------
# Parsing
# ---------------------------------------------------------------------------

# Minimum characters on a page before we consider it "has text"
_MIN_TEXT_CHARS = 50


def _ocr_page(page: pymupdf.Page, page_num: int, filename: str) -> str:
    """
    Render a PDF page as an image and run Tesseract OCR on it.
    Used as fallback when PyMuPDF finds no embedded text.

    Returns:
        Extracted text string (may be empty if OCR also fails).
    """
    if not _configure_tesseract():
        return ""

    try:
        import pytesseract
        from PIL import Image
        import io

        # Render at 300 DPI for good OCR quality (matrix = 300/72 scale)
        mat = pymupdf.Matrix(300 / 72, 300 / 72)
        pix = page.get_pixmap(matrix=mat, colorspace=pymupdf.csRGB)
        img_bytes = pix.tobytes("png")
        img = Image.open(io.BytesIO(img_bytes))

        lang = _get_ocr_lang()
        text = pytesseract.image_to_string(img, lang=lang, config="--psm 3")
        text = text.strip()

        if text:
            logger.info(
                "OCR page %d of %s: extracted %d chars (lang=%s)",
                page_num, filename, len(text), lang,
            )
        else:
            logger.warning("OCR page %d of %s: no text extracted.", page_num, filename)

        return text

    except Exception as e:
        logger.error("OCR failed on page %d of %s: %s", page_num, filename, e)
        return ""


def parse_pdf(file_path: str | Path) -> list[dict]:
    """
    Extract text from a PDF file, page by page.

    For text-based PDFs: uses PyMuPDF's native text extraction (fast).
    For scanned/image-based PDFs: falls back to Tesseract OCR per page.

    Returns:
        List of dicts: [{"page": 1, "text": "..."}, ...]
    """
    file_path = Path(file_path)
    pages = []
    ocr_pages = 0

    with pymupdf.open(str(file_path)) as doc:
        total_pages = len(doc)
        logger.info("Opening %s (%d pages)...", file_path.name, total_pages)

        for page_num, page in enumerate(doc, start=1):
            text = page.get_text("text").strip()

            # Fall back to OCR if page has little/no embedded text
            if len(text) < _MIN_TEXT_CHARS:
                logger.info(
                    "Page %d/%d has minimal text (%d chars) — trying OCR...",
                    page_num, total_pages, len(text),
                )
                ocr_text = _ocr_page(page, page_num, file_path.name)
                if ocr_text:
                    text = ocr_text
                    ocr_pages += 1

            if text.strip():
                pages.append({"page": page_num, "text": text})

    if ocr_pages > 0:
        logger.info(
            "Parsed %d pages from %s (%d via OCR, %d native text).",
            len(pages), file_path.name, ocr_pages, len(pages) - ocr_pages,
        )
    else:
        logger.info("Parsed %d pages from %s (all native text).", len(pages), file_path.name)

    return pages


def parse_docx(file_path: str | Path) -> list[dict]:
    """
    Extract text from a DOCX file.
    DOCX doesn't have real "pages", so we treat each paragraph group as page 1.

    Returns:
        List of dicts: [{"page": None, "text": "full document text"}]
    """
    from docx import Document as DocxDocument

    file_path = Path(file_path)
    doc = DocxDocument(str(file_path))
    full_text = "\n".join(para.text for para in doc.paragraphs if para.text.strip())
    logger.info("Parsed DOCX %s (%d chars)", file_path.name, len(full_text))
    return [{"page": None, "text": full_text}]


def parse_txt(file_path: str | Path) -> list[dict]:
    """
    Extract text from a TXT file.

    Returns:
        List of dicts: [{"page": int | None, "text": "full document text"}]
    """
    import re
    
    file_path = Path(file_path)
    try:
        text = file_path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        text = file_path.read_text(encoding="latin-1")
    logger.info("Parsed TXT %s (%d chars)", file_path.name, len(text))
    
    page_num = None
    match = re.search(r"page_(\d+)", file_path.name, re.IGNORECASE)
    if match:
        page_num = int(match.group(1))
        
    return [{"page": page_num, "text": text}]


def parse_document(file_path: str | Path) -> list[dict]:
    """Route to the correct parser based on file extension."""
    file_path = Path(file_path)
    ext = file_path.suffix.lower()
    if ext == ".pdf":
        return parse_pdf(file_path)
    elif ext in (".docx", ".doc"):
        return parse_docx(file_path)
    elif ext == ".txt":
        return parse_txt(file_path)
    else:
        raise ValueError(f"Unsupported file type: {ext}")


# ---------------------------------------------------------------------------
# Chunking
# ---------------------------------------------------------------------------
def chunk_text(
    pages: list[dict],
    chunk_size: int = 600,
    overlap: int = 100,
) -> list[dict]:
    """
    Split parsed pages into overlapping chunks.

    Tries to split on paragraph boundaries (double newlines) to avoid
    cutting mid-sentence. Falls back to sentence boundaries if needed.

    Returns:
        List of dicts: [{"text": "...", "page": int|None, "chunk_index": int}, ...]
    """
    chunks = []
    chunk_index = 0

    for page_info in pages:
        text = page_info["text"]
        page = page_info.get("page")

        # Split into paragraphs first
        paragraphs = re.split(r"\n\s*\n", text)
        current_chunk = ""

        for para in paragraphs:
            para = para.strip()
            if not para:
                continue

            # If adding this paragraph would exceed chunk_size, finalize current chunk
            if current_chunk and len(current_chunk) + len(para) + 1 > chunk_size:
                chunks.append({
                    "text": current_chunk.strip(),
                    "page": page,
                    "chunk_index": chunk_index,
                })
                chunk_index += 1
                # Keep overlap from the end of the current chunk
                if overlap > 0 and len(current_chunk) > overlap:
                    current_chunk = current_chunk[-overlap:]
                else:
                    current_chunk = ""

            current_chunk += ("\n\n" if current_chunk else "") + para

        # Don't forget the last chunk from this page
        if current_chunk.strip():
            chunks.append({
                "text": current_chunk.strip(),
                "page": page,
                "chunk_index": chunk_index,
            })
            chunk_index += 1

    logger.info("Created %d chunks", len(chunks))
    return chunks


# ---------------------------------------------------------------------------
# Ingestion orchestrator
# ---------------------------------------------------------------------------
def generate_document_id(file_path: str | Path) -> str:
    """Generate a short, deterministic document ID from the file name."""
    name = Path(file_path).name
    hash_hex = hashlib.md5(name.encode()).hexdigest()[:8]
    return f"doc_{hash_hex}"


def get_cached_text_path(document_id: str) -> Path:
    """Get the path to the cached parsed text file."""
    settings = get_settings()
    cache_dir = Path(settings.PARSED_TEXT_CACHE_DIR)
    cache_dir.mkdir(parents=True, exist_ok=True)
    return cache_dir / f"{document_id}.txt"


def ingest_document(
    file_path: str | Path,
    document_id: Optional[str] = None,
    document_name: Optional[str] = None,
) -> int:
    """
    Full ingestion pipeline: parse → chunk → embed → store in ChromaDB.

    Args:
        file_path: Path to the PDF/DOCX file.
        document_id: Optional override; generated from filename if not given.
        document_name: Optional override; uses filename if not given.

    Returns:
        Number of chunks stored.
    """
    file_path = Path(file_path)
    if document_id is None:
        document_id = generate_document_id(file_path)
    if document_name is None:
        document_name = file_path.name

    collection = get_chroma_collection()

    # Check if already ingested — skip only if it produced chunks
    # (re-ingest if previous attempt produced 0 chunks, e.g. was a scanned PDF)
    existing = collection.get(where={"document_id": document_id})
    if existing and existing["ids"]:
        logger.info(
            "Document '%s' (%s) already ingested (%d chunks). Skipping.",
            document_name,
            document_id,
            len(existing["ids"]),
        )
        
        # Load full text from cache if it exists, otherwise parse and cache
        cache_path = get_cached_text_path(document_id)
        if cache_path.exists():
            logger.info("Loading parsed text from cache for '%s'.", document_name)
            full_text = cache_path.read_text(encoding="utf-8")
        else:
            logger.info("Cache not found for '%s'. Re-parsing document to extract text...", document_name)
            pages = parse_document(file_path)
            full_text = "\n\n".join(p["text"] for p in pages)
            cache_path.write_text(full_text, encoding="utf-8")

        # Still register it in memory
        document_registry[document_id] = {
            "name": document_name,
            "file_path": str(file_path),
            "full_text": full_text,
            "num_chunks": len(existing["ids"]),
        }
        return len(existing["ids"])
    # If previously ingested but got 0 chunks, fall through to re-ingest

    # 1. Parse
    pages = parse_document(file_path)
    full_text = "\n\n".join(p["text"] for p in pages)
    
    # Save to cache for future fast startups
    cache_path = get_cached_text_path(document_id)
    cache_path.write_text(full_text, encoding="utf-8")

    # 2. Chunk
    settings = get_settings()
    chunks = chunk_text(pages, chunk_size=settings.CHUNK_SIZE, overlap=settings.CHUNK_OVERLAP)

    if not chunks:
        logger.warning("No chunks produced from %s", file_path.name)
        return 0

    # 3. Embed
    texts = [c["text"] for c in chunks]
    embeddings = embed_texts(texts, prefix="passage: ")

    # 4. Store in ChromaDB
    ids = [f"{document_id}_chunk{c['chunk_index']}" for c in chunks]
    metadatas = [
        {
            "document_id": document_id,
            "document_name": document_name,
            "page": c.get("page") or 0,
            "chunk_index": c["chunk_index"],
        }
        for c in chunks
    ]

    collection.add(
        ids=ids,
        embeddings=embeddings,
        documents=texts,
        metadatas=metadatas,
    )

    # 5. Register in memory for question service
    document_registry[document_id] = {
        "name": document_name,
        "file_path": str(file_path),
        "full_text": full_text,
        "num_chunks": len(chunks),
    }

    logger.info(
        "Ingested '%s' → %d chunks stored in ChromaDB.",
        document_name,
        len(chunks),
    )
    return len(chunks)


def batch_ingest_directory(directory: str | Path) -> list[dict]:
    """
    Scan a directory for PDF/DOCX files and ingest any that haven't been
    ingested yet. Called on startup.

    Returns:
        List of dicts: [{"document_id": ..., "name": ..., "num_chunks": ...}, ...]
    """
    directory = Path(directory)
    if not directory.exists():
        logger.info("Raw documents directory does not exist yet: %s", directory)
        return []

    results = []
    supported_extensions = {".pdf", ".docx", ".doc", ".txt"}

    for file_path in sorted(directory.iterdir()):
        if file_path.suffix.lower() in supported_extensions:
            try:
                doc_id = generate_document_id(file_path)
                num_chunks = ingest_document(file_path, document_id=doc_id)
                results.append({
                    "document_id": doc_id,
                    "name": file_path.name,
                    "num_chunks": num_chunks,
                })
            except Exception as e:
                logger.error("Failed to ingest %s: %s", file_path.name, e)

    logger.info("Batch ingestion complete: %d documents processed.", len(results))
    return results
