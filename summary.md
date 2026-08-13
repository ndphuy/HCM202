# HCM202 AI Study Assistant - Project Summary

## Overview

HCM202 AI Study Assistant: FastAPI backend + Next.js frontend for **Tu tuong Ho Chi Minh (HCM202)**.
1. RAG Chatbot: Answers questions from ingested study materials (slides, PDFs, images from teachers).
2. MCQ Generator: Generates multiple-choice questions from uploaded document contents.

---

## Folder Structure

```
HCM202/
├── README.md
├── .gitignore
├── hcm-ai-backend/                   # Python FastAPI Backend
│   ├── app/
│   │   ├── api/routes_chat.py        # Chat RAG endpoints
│   │   ├── api/routes_documents.py   # Upload/list endpoints
│   │   ├── api/routes_questions.py   # MCQ endpoints
│   │   ├── core/config.py            # Pydantic Settings
│   │   ├── core/prompts.py           # HCM202-specific LLM prompts
│   │   ├── llm/gemini_client.py
│   │   ├── llm/groq_client.py        # Groq fallback
│   │   ├── rag/embeddings.py
│   │   ├── rag/guardrail.py
│   │   ├── rag/ingest.py
│   │   ├── rag/retriever.py
│   │   ├── services/chat_service.py
│   │   ├── services/question_service.py
│   │   └── main.py
│   ├── data/raw_documents/           # Drop teacher images/PDFs here
│   └── requirements.txt
│
└── hcm-ai-frontend/                  # Next.js 15 Frontend
    └── src/
        ├── app/globals.css            # Dark mode: crimson + gold
        ├── app/layout.tsx
        ├── app/page.tsx               # 6-tab engine + Chat Drawer
        └── components/
            ├── TabHome.tsx            # Slide 0: Title
            ├── TabCaseStudy.tsx       # Slide 1: Historical context 1945-1969
            ├── TabTheory.tsx          # Slide 2: 3 pillars interactive
            ├── TabAnalysis.tsx        # Slide 3: Practice + AI prompts
            ├── TabLesson.tsx          # Slide 4: Lessons
            ├── TabQuiz.tsx            # Slide 5: AI Quiz
            ├── ChatDrawer.tsx         # AI chatbox
            └── UploadModal.tsx        # Upload modal
```

---

## Presentation (6 Tabs)

| Tab | Title | Content |
|-----|-------|---------|
| 0 | Trang chu | Title: Tu tuong HCM ve Nha nuoc |
| 1 | Boi canh LS | Timeline 1945-1969 |
| 2 | Ly thuyet | 3 pillars: Cua ND / Do ND / Vi ND |
| 3 | Thuc tien | VN practice + AI quick prompts |
| 4 | Bai hoc | 4 key lessons |
| 5 | Quiz | AI MCQ from teacher materials |

---

## Prompts

prompts.py scoped to HCM202 domain: constrains chatbot, MCQ generator, and off-topic refusal to Tu tuong Ho Chi Minh subject.

---

## Image Ingestion

Teacher images -> hcm-ai-backend/data/raw_documents/ -> auto-ingest on startup -> ChromaDB -> RAG + Quiz AI.

---

## Git

Local: d:\Ky_8\HCM202 | master branch
Remote: https://github.com/ndphuy/HCM202.git

---

## Converted from MLN122

Original: Tuan hoan Tu ban (Capital Circulation)
New: Tu tuong HCM ve Nha nuoc cua nhan dan, do nhan dan, vi nhan dan
Preserved: Architecture, RAG, dark mode, 6-tab structure
Changed: All content, prompts, headers, icons, AI quick prompts
