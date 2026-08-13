"""
Chat API route: POST /api/chat
"""

import logging
from typing import Annotated, Optional

from fastapi import APIRouter, Query

from app.schemas.chat import ChatRequest, ChatResponse
from app.services.chat_service import handle_chat

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/chat", tags=["Chat"])


@router.post(
    "",
    response_model=ChatResponse,
    openapi_extra={
        "requestBody": {
            "content": {
                "application/json": {
                    "examples": {
                        "Câu hỏi về hàng hóa": {
                            "summary": "Câu hỏi liên quan (on-topic)",
                            "value": {"query": "Hàng hóa là gì? Nêu hai thuộc tính của hàng hóa."},
                        },
                        "Câu hỏi không liên quan": {
                            "summary": "Câu hỏi ngoài chủ đề (off-topic)",
                            "value": {"query": "Tôi là ai?"},
                        },
                        "Có session": {
                            "summary": "Tiếp tục hội thoại (có session_id)",
                            "value": {
                                "query": "Giải thích thêm về giá trị sử dụng.",
                                "session_id": "paste-your-session-id-here",
                            },
                        },
                    }
                }
            }
        }
    },
)
async def chat(request: ChatRequest) -> ChatResponse:
    """
    Đặt câu hỏi về môn Kinh tế chính trị Mác - Lênin (MLN122).

    - Chatbot trả lời **dựa trên tài liệu giáo trình đã tải lên**.
    - Câu hỏi không liên quan sẽ bị từ chối (`is_relevant: false`) mà không tốn LLM call.
    - `session_id` trong phản hồi — dùng lại để tiếp tục hội thoại trong cùng phiên.
    """
    return await handle_chat(request)
