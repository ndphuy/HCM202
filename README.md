# HCM202 - AI Study Assistant

> Bài thuyết trình tương tác về **Tư tưởng Hồ Chí Minh về Nhà nước của nhân dân, do nhân dân, vì nhân dân** — môn HCM202

## Tính năng

- 🎯 **Bài thuyết trình 6 slides**: Trang chủ | Bối cảnh LS | Lý thuyết | Thực tiễn | Bài học | Quiz
- 🤖 **AI Chatbox RAG**: Trả lời câu hỏi dựa trên tài liệu giáo trình HCM202
- 📝 **Quiz AI**: Tự động sinh câu hỏi trắc nghiệm từ tài liệu
- 📎 **Upload tài liệu**: Thêm hình ảnh/PDF từ giáo viên vào hệ thống RAG

## Cấu trúc

```
HCM202/
├── hcm-ai-backend/     # FastAPI + RAG + Gemini/Groq
└── hcm-ai-frontend/    # Next.js + Tailwind
```

## Chạy dự án

### Backend

```bash
cd hcm-ai-backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
# Tạo .env từ .env.example và điền API keys
uvicorn app.main:app --reload
```

### Frontend

```bash
cd hcm-ai-frontend
npm install
npm run dev
```

Mở trình duyệt tại `http://localhost:3000`

## Upload tài liệu

Đặt file PDF/ảnh từ giáo viên vào thư mục:
```
hcm-ai-backend/data/raw_documents/
```
Backend sẽ tự động ingest khi khởi động.

## Tech Stack

- **Frontend**: Next.js 15, Tailwind CSS
- **Backend**: FastAPI, ChromaDB, Sentence-Transformers
- **LLM**: Google Gemini (fallback: Groq Llama 3)
