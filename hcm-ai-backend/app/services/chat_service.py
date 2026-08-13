"""
Chat service: orchestrates guardrail → retrieve → prompt → LLM → response.
"""

import logging
import uuid
from typing import Optional

from app.core.prompts import CHAT_HISTORY_TEMPLATE, CHAT_SYSTEM_PROMPT
from app.llm.gemini_client import generate_chat_answer
from app.rag.guardrail import check_relevance
from app.rag.retriever import retrieve
from app.schemas.chat import ChatRequest, ChatResponse, SourceChunk

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# In-memory session history: session_id → list of (role, message) tuples
# ---------------------------------------------------------------------------
_sessions: dict[str, list[dict]] = {}
MAX_HISTORY_TURNS = 10

# The LLM is instructed to prefix refusals with this string
_REFUSAL_PREFIX = "TỪ CHỐI:"


def _get_or_create_session(session_id: Optional[str]) -> tuple[str, list[dict]]:
    """Get existing session or create a new one."""
    if session_id is None:
        session_id = str(uuid.uuid4())
    if session_id not in _sessions:
        _sessions[session_id] = []
    return session_id, _sessions[session_id]


def _format_chunks_for_prompt(chunks: list[dict]) -> str:
    """Format retrieved chunks into a string for the prompt template."""
    if not chunks:
        return "(Không tìm thấy tài liệu liên quan.)"

    parts = []
    for chunk in chunks:
        doc = chunk['document']
        if doc.startswith('page_') and doc.endswith('.txt'):
            page_num = doc[5:-4]
            source_info = f"[Nguồn: Trang {page_num}]"
        else:
            source_info = f"[Nguồn: {doc}]"
        parts.append(f"--- {source_info} ---\n{chunk['snippet']}")
    return "\n\n".join(parts)


def _format_history(history: list[dict]) -> str:
    """Format recent chat history for the prompt."""
    if not history:
        return ""
    recent = history[-MAX_HISTORY_TURNS * 2:]  # last N turns (user + assistant)
    lines = []
    for entry in recent:
        role = "Student" if entry["role"] == "user" else "Assistant"
        lines.append(f"{role}: {entry['message']}")
    return CHAT_HISTORY_TEMPLATE.format(history="\n".join(lines))


async def handle_chat(request: ChatRequest) -> ChatResponse:
    """
    Main chat handler following the spec's service flow:
    1. Run guardrail → if off-topic, return refusal (no LLM call).
    2. Retrieve top-k chunks.
    3. Build prompt from template + chunks + query.
    4. Call Gemini (temperature=0.2).
    5. Detect if LLM itself refused (TỪ CHỐI: prefix) → set is_relevant=False.
    6. Attach sources from retrieved chunks.
    7. Return ChatResponse.
    """
    session_id, history = _get_or_create_session(request.session_id)

    # 1. Guardrail check (Layer 1 — embedding similarity)
    is_relevant, refusal_msg = check_relevance(request.query)
    if not is_relevant:
        logger.info("Off-topic query refused by guardrail: '%s'", request.query[:100])
        return ChatResponse(
            answer=refusal_msg,
            is_relevant=False,
            sources=[],
            session_id=session_id,
        )

    # 2. Retrieve relevant chunks
    chunks = retrieve(request.query)

    # 3. Build prompt
    chunks_text = _format_chunks_for_prompt(chunks)
    history_text = _format_history(history)

    prompt = ""
    if history_text:
        prompt += history_text
    prompt += CHAT_SYSTEM_PROMPT.format(
        retrieved_chunks=chunks_text,
        query=request.query,
    )

    # 4. Call LLM
    answer = generate_chat_answer(prompt)

    # 5. Detect if the LLM itself chose to refuse (Layer 2 guardrail detection)
    llm_refused = answer.strip().startswith(_REFUSAL_PREFIX)
    final_is_relevant = not llm_refused
    if llm_refused:
        logger.info("Off-topic query refused by LLM: '%s'", request.query[:100])
        # Strip the prefix from the displayed answer so it reads naturally
        answer = answer.strip()[len(_REFUSAL_PREFIX):].strip()

    # 6. Build sources from retriever metadata (not from LLM output)
    # Only include sources when the answer is actually relevant
    sources = []
    if final_is_relevant:
        sources = [
            SourceChunk(
                document=chunk["document"],
                chunk_id=chunk["chunk_id"],
                snippet=chunk["snippet"][:200] + "..." if len(chunk["snippet"]) > 200 else chunk["snippet"],
            )
            for chunk in chunks
        ]

    # 7. Update session history (only for relevant exchanges)
    history.append({"role": "user", "message": request.query})
    history.append({"role": "assistant", "message": answer})

    logger.info("Chat response generated (is_relevant=%s, %d sources)", final_is_relevant, len(sources))

    return ChatResponse(
        answer=answer,
        is_relevant=final_is_relevant,
        sources=sources,
        session_id=session_id,
    )
