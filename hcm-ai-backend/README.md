# MLN AI Study Assistant

AI backend for studying **Marxist-Leninist Philosophy** (Triết học Mác - Lênin).

## Features

- **RAG Chatbot** — answers questions grounded strictly in ingested course material
- **MCQ Generator** — generates multiple-choice questions with per-option explanations
- **Relevance Guardrail** — refuses off-topic questions without wasting API calls
- **Groq Fallback** — auto-switches to Groq when Gemini quota is exhausted

## Quick Start

### 1. Create virtual environment

```bash
python -m venv venv
venv\Scripts\activate   # Windows
# source venv/bin/activate  # Linux/Mac
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure environment

```bash
copy .env.example .env
# Edit .env with your API keys
```

### 4. Add course documents

Drop PDF/DOCX files into `data/raw_documents/`. They will be auto-ingested on startup.

### 5. Run the server

```bash
.\venv\Scripts\python.exe -m uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`.  
Interactive docs at `http://localhost:8000/docs`.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/api/chat` | Ask a question (RAG chatbot) |
| POST | `/api/questions/generate` | Generate MCQs from a document |
| POST | `/api/questions/check` | Check an answer |

## Tech Stack

- **LLM**: Gemini 2.5 Flash (primary) + Groq Llama 3.x (fallback)
- **Embeddings**: sentence-transformers / intfloat/multilingual-e5-large
- **Vector Store**: ChromaDB (embedded, file-persisted)
- **Backend**: FastAPI + Pydantic v2 + Uvicorn
- **Document Parsing**: PyMuPDF + python-docx

## Running Tests

```bash
pytest tests/ -v
```
