# Hướng Dẫn Tích Hợp Backend AI & Quy Trình GitHub (Dành Cho FrontEnd)

Tài liệu này được biên soạn nhằm giúp các nhà phát triển Frontend dễ dàng hiểu được cấu trúc Backend của dự án **MLN AI Study Assistant** (Trợ lý học tập Triết học Mác - Lênin), cách tích hợp các API chính, cách chạy thử nghiệm local và các bước đẩy dự án lên GitHub.

---

## 1. Tổng Quan Hệ Thống

Hệ thống Backend được xây dựng bằng **FastAPI** và tích hợp trí tuệ nhân tạo (AI) hỗ trợ sinh viên học tập:
*   **RAG Chatbot**: Trả lời câu hỏi học tập bằng phương pháp RAG (Retrieval-Augmented Generation), dựa vào tài liệu giáo trình được tải lên để đảm bảo câu trả lời chính xác và đáng tin cậy.
*   **MCQ Generator**: Tự động tạo câu hỏi trắc nghiệm kèm giải thích chi tiết cho từng phương án lựa chọn.
*   **Hạ tầng AI**:
    *   **LLM chính**: Gemini 2.5 Flash.
    *   **LLM dự phòng**: Groq Llama 3.3 (Tự động chuyển đổi nếu Gemini bị hết quota).
    *   **Nhúng văn bản (Embeddings)**: Mô hình `intfloat/multilingual-e5-large`.
    *   **Cơ sở dữ liệu Vector**: ChromaDB (Lưu trữ và tìm kiếm ngữ cảnh dựa trên độ tương đồng).

---

## 2. Cấu Trúc Mã Nguồn (Directory Structure)

Thư mục chứa mã nguồn chính nằm trong [app](file:///c:/Users/Admin/Desktop/SU2026/MLN122/AI_Brain/mln-ai-backend/app). Dưới đây là giải thích chi tiết:

```
mln-ai-backend/
├── app/                        # Thư mục ứng dụng chính
│   ├── api/                    # Định nghĩa các Route/Endpoints API
│   │   ├── routes_chat.py      # API Endpoint cho hội thoại/chatbot
│   │   ├── routes_documents.py # API Endpoint để tải lên và xử lý tài liệu
│   │   └── routes_questions.py # API Endpoint tạo và kiểm tra câu hỏi trắc nghiệm
│   ├── core/                   # Cấu hình hệ thống & prompt mẫu
│   │   ├── config.py           # Quản lý các biến môi trường (.env)
│   │   └── prompts.py          # Hệ thống các Prompt Template định hướng câu trả lời của AI
│   ├── llm/                    # Client giao tiếp với API của các Mô hình Ngôn ngữ Lớn
│   │   ├── gemini_client.py    # Gọi API Gemini 2.5 Flash
│   │   └── groq_client.py      # Gọi API Groq Llama 3 (Dự phòng)
│   ├── rag/                    # Logic của RAG (Retrieval-Augmented Generation)
│   │   ├── embeddings.py       # Nạp mô hình Sentence-Transformers chuyển văn bản thành vector
│   │   ├── guardrail.py        # Bộ lọc kiểm tra câu hỏi đầu vào có đúng chủ đề hay không
│   │   ├── ingest.py           # Phân tách, trích xuất và lưu văn bản PDF/Docx vào ChromaDB
│   │   └── retriever.py        # Tìm kiếm các đoạn tài liệu tương đồng nhất với câu hỏi
│   ├── schemas/                # Khai báo cấu trúc dữ liệu Request/Response (Pydantic models)
│   │   ├── chat.py             # Schema cho Chat API
│   │   ├── documents.py        # Schema cho Document API
│   │   └── questions.py        # Schema cho Questions/MCQ API
│   ├── services/               # Tầng nghiệp vụ xử lý logic chính
│   │   ├── chat_service.py     # Xử lý hội thoại chat lịch sử và RAG
│   │   └── question_service.py # Xử lý tạo và đối chiếu câu hỏi trắc nghiệm
│   └── main.py                 # File chạy chính của FastAPI (Cấu hình CORS, khởi tạo, dọn dẹp)
├── data/                       # Chứa dữ liệu tĩnh và cơ sở dữ liệu
│   ├── chroma_db/              # Thư mục lưu cơ sở dữ liệu vector ChromaDB sau khi nhúng
│   └── raw_documents/          # Thư mục chứa tài liệu thô ban đầu (PDF, DOCX, TXT)
├── tests/                      # Thư mục chứa các đoạn mã kiểm thử tự động (Pytest)
├── .env                        # Chứa các API Key và cấu hình quan trọng (Không commit lên Git)
├── .env.example                # File mẫu cấu hình biến môi trường
├── requirements.txt            # Danh sách thư viện Python cần cài đặt
└── README.md                   # Hướng dẫn chạy dự án sơ bộ
```

---

## 3. Danh Sách API Dành Cho FrontEnd Tích Hợp

Đường dẫn local mặc định của API: `http://localhost:8000`.  
Bạn có thể xem tài liệu tương tác đầy đủ (Swagger UI) tại: `http://localhost:8000/docs`.

### 3.1. API Chatbot (RAG Chat)
*   **Phương thức**: `POST`
*   **Endpoint**: `/api/chat`
*   **Request Body (`ChatRequest`)**:
    ```json
    {
      "query": "Hàng hóa là gì? Nêu hai thuộc tính của hàng hóa.",
      "session_id": null, // Hoặc gửi lại session_id cũ để tiếp tục lịch sử trò chuyện
      "response_format": "text" // "text" hoặc "json"
    }
    ```
*   **Response Body (`ChatResponse`)**:
    ```json
    {
      "answer": "Theo Trang 54, hàng hóa là sản phẩm của lao động, có thể thỏa mãn nhu cầu nào đó của con người thông qua trao đổi, mua bán...",
      "is_relevant": true, // false nếu câu hỏi bị phát hiện là lạc đề
      "sources": [
        {
          "document": "page_54.txt",
          "chunk_id": "doc_5bc2fcb4_chunk0",
          "snippet": "Nội dung đoạn văn bản gốc được trích xuất dùng làm căn cứ trả lời..."
        }
      ],
      "session_id": "c1f78cbb-d372-4d1a-8c5e-8be8a983b632" // Dùng ID này cho lần gửi tiếp theo để tiếp tục hội thoại
    }
    ```

### 3.2. API Tạo Câu Hỏi Trắc Nghiệm (Generate MCQs)
*   **Phương thức**: `GET`
*   **Endpoint**: `/api/questions/generate`
*   **Query Parameters**:
    *   `num_questions` (số nguyên, mặc định: 5): Số câu hỏi muốn tạo.
    *   `level` (lựa chọn: `"easy"`, `"medium"`, `"hard"`, mặc định: `"medium"`): Độ khó của câu hỏi.
*   **Response Body (`GenerateQuestionsResponse`)**:
    ```json
    {
      "questions": [
        {
          "id": "q_0",
          "question": "Thuộc tính nào quyết định giá trị trao đổi của hàng hóa?",
          "options": [
            "A. Giá trị sử dụng",
            "B. Giá trị của hàng hóa",
            "C. Tính hữu ích",
            "D. Sự khan hiếm"
          ],
          "correct_index": 1, // Vị trí câu trả lời đúng (0 đến 3)
          "explanations": [
            "Giá trị sử dụng không quyết định trực tiếp tỷ lệ trao đổi vật lý.",
            "Chính xác. Giá trị hàng hóa phản ánh lao động xã hội kết tinh, quyết định tỷ lệ trao đổi.",
            "Tính hữu ích chỉ là điều kiện cần của giá trị sử dụng.",
            "Sự khan hiếm chỉ ảnh hưởng tới cung cầu và giá cả tức thời."
          ]
        }
      ],
      "document_used": "page_54.txt"
    }
    ```

### 3.3. API Kiểm Tra Câu Trả Lời Trắc Nghiệm (Check MCQ Answer)
*   **Phương thức**: `GET`
*   **Endpoint**: `/api/questions/check`
*   **Query Parameters**:
    *   `question_id`: ID câu hỏi (Ví dụ: `q_0`).
    *   `selected_index`: Vị trí đáp án người dùng chọn (0 đến 3).
*   **Response Body (`CheckAnswerResponse`)**:
    ```json
    {
      "correct": true, // true nếu đúng, false nếu sai
      "explanation": "Chính xác. Giá trị hàng hóa phản ánh lao động xã hội kết tinh, quyết định tỷ lệ trao đổi."
    }
    ```

---

## 4. Hướng Dẫn Cài Đặt và Chạy Thử Local (Từng Bước Từ Đầu)

Dành cho các bạn FrontEnd chưa quen cấu hình Python backend. Làm theo các bước dưới đây để thiết lập và chạy hệ thống trên máy tính cá nhân (hệ điều hành Windows):

### Bước 4.1: Kiểm tra Python
Hệ thống yêu cầu máy tính đã cài đặt **Python 3.10 trở lên**.
1. Mở terminal (PowerShell hoặc Command Prompt).
2. Chạy lệnh kiểm tra phiên bản:
   ```powershell
   python --version
   ```
   *Nếu hiển thị lỗi hoặc phiên bản cũ hơn 3.10, vui lòng tải và cài đặt Python bản mới nhất từ trang chủ [python.org](https://www.python.org/downloads/) (Lưu ý tích chọn ô **"Add Python to PATH"** trong quá trình cài đặt).*

### Bước 4.2: Mở thư mục dự án và Tạo môi trường ảo (Virtual Environment)
Môi trường ảo giúp cài đặt các thư viện độc lập không ảnh hưởng tới hệ thống.
1. Di chuyển vào thư mục backend:
   ```powershell
   cd c:\Users\Admin\Desktop\SU2026\MLN122\AI_Brain\mln-ai-backend
   ```
2. Khởi tạo môi trường ảo có tên là `venv` (nếu thư mục `venv` chưa tồn tại):
   ```powershell
   python -m venv venv
   ```

### Bước 4.3: Kích hoạt môi trường ảo
*   **Nếu dùng PowerShell (Mặc định trong VS Code)**:
    Do Windows mặc định chặn chạy script lạ, hãy cấp quyền tạm thời cho terminal hiện tại rồi chạy file kích hoạt:
    ```powershell
    Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process
    .\venv\Scripts\Activate.ps1
    ```
*   **Nếu dùng Command Prompt (cmd)**:
    ```cmd
    .\venv\Scripts\activate.bat
    ```
*Khi kích hoạt thành công, bạn sẽ thấy chữ **`(venv)`** xuất hiện ở đầu dòng lệnh terminal.*

### Bước 4.4: Cài đặt thư viện phụ thuộc (Dependencies)
Đảm bảo đã kích hoạt môi trường ảo `(venv)` trước khi chạy lệnh này:
```powershell
python -m pip install --upgrade pip
pip install -r requirements.txt
```
*Lưu ý: Quá trình cài đặt thư viện nhúng (`sentence-transformers`) có dung lượng tương đối nặng và có thể mất vài phút tùy vào tốc độ mạng của bạn.*

### Bước 4.5: Cấu hình biến môi trường (`.env`)
Dự án cần API Key để kết nối với các mô hình ngôn ngữ lớn:
1. Tạo tệp cấu hình `.env` từ file mẫu:
   ```powershell
   copy .env.example .env
   ```
2. Mở file `.env` vừa tạo bằng VS Code hoặc Notepad và chỉnh sửa thông tin:
   *   `GEMINI_API_KEY`: Điền khóa API của bạn (Lấy miễn phí tại [Google AI Studio](https://aistudio.google.com/)).
   *   `GROQ_API_KEY`: Điền khóa API Groq nếu có (Lấy tại [Groq Console](https://console.groq.com/)), dùng làm phương án dự phòng khi Gemini hết hạn ngạch. Nếu không dùng có thể bỏ trống.

### Bước 4.6: Chuẩn bị dữ liệu tài liệu môn học
Để chatbot có dữ liệu trả lời chính xác:
1. Đảm bảo các file bài học dạng `.txt` (ví dụ: `page_53.txt`, `page_54.txt`,...) được đặt trong thư mục: `data/raw_documents/`.
2. Khi khởi chạy server lần đầu, backend sẽ tự động đọc các file này, chia đoạn (chunk), mã hóa vector và lưu vào cơ sở dữ liệu Vector (`data/chroma_db/`) và tạo cache văn bản (`data/parsed_text/`). Những lần khởi động sau, hệ thống sẽ bỏ qua bước này để tối ưu tốc độ.

### Bước 4.7: Khởi chạy Máy chủ Backend
Chạy lệnh khởi động Uvicorn server với tham số `--reload` (server tự khởi động lại khi phát hiện thay đổi trong code):
```powershell
python -m uvicorn app.main:app --reload
```
*   **Địa chỉ chạy thử API**: `http://localhost:8000`
*   **Tài liệu hướng dẫn trực quan & Chạy thử trực tiếp (Swagger UI)**: `http://localhost:8000/docs`

### Bước 4.8: Xác minh hoạt động
Sau khi server chạy, bạn truy cập link `http://localhost:8000/health` bằng trình duyệt. Nếu trang trả về:
```json
{
  "status": "ok",
  "database": "connected",
  "documents_loaded": 27
}
```
Nghĩa là hệ thống đã hoạt động bình thường và sẵn sàng phục vụ các request từ FrontEnd!

---

## 5. Quy Trình GitHub: Đẩy và Phát Hành Dự Án

Để đẩy mã nguồn của bạn lên GitHub một cách an toàn và đúng chuẩn, hãy làm theo quy trình dưới đây.

### 5.1. Kiểm Tra Cấu Hình Git Lọc File Nhạy Cảm (`.gitignore`)
Trước khi đẩy code lên GitHub, chúng ta phải đảm bảo các file chứa thông tin bảo mật hoặc các file tự sinh có dung lượng lớn không bị commit.
Mở file `.gitignore` và xác nhận nó đã chặn những file sau:
*   `.env` (Chứa khóa API bảo mật cá nhân)
*   `venv/` (Môi trường ảo của Python - rất nặng và không cần thiết)
*   `data/chroma_db/` (Cơ sở dữ liệu nhúng vector, có thể sinh tự động trên server)
*   `__pycache__/` và `.pytest_cache/` (Bộ nhớ đệm mã chạy thử)

### 5.2. Các Bước Đẩy Dự Án Lên GitHub Lần Đầu
Thực hiện các lệnh sau tại thư mục gốc của dự án:

1.  **Khởi tạo Git Repository** (nếu chưa khởi tạo):
    ```bash
    git init
    ```

2.  **Chuyển nhánh mặc định sang `main`**:
    ```bash
    git branch -M main
    ```

3.  **Theo dõi toàn bộ các tệp tin hợp lệ**:
    ```bash
    git add .
    ```

4.  **Tạo Commit đầu tiên**:
    ```bash
    git commit -m "feat: init FastAPI MLN AI backend with RAG and MCQ generation"
    ```

5.  **Liên kết với Kho lưu trữ trống trên GitHub**:
    *(Thay thế URL bằng link Repository GitHub thực tế của bạn)*:
    ```bash
    git remote add origin https://github.com/your-username/mln-ai-backend.git
    ```

6.  **Đẩy mã nguồn lên GitHub**:
    ```bash
    git push -u origin main
    ```

### 5.3. Tạo Bản Phát Hành (GitHub Release)
Để đóng gói và đánh dấu phiên bản ổn định cho dự án phục vụ triển khai hoặc chia sẻ, bạn có thể tạo thẻ phiên bản (Git Tag) và phát hành (GitHub Release).

#### Cách 1: Tạo thẻ Git Tag từ Terminal
Bạn có thể đánh dấu phiên bản `v1.0.0` ngay trên máy cục bộ rồi đẩy lên:
```bash
# 1. Tạo thẻ phiên bản kèm chú thích
git tag -a v1.0.0 -m "Phiên bản phát hành đầu tiên: Hoàn thành RAG Chat và Tạo câu hỏi MCQ"

# 2. Đẩy thẻ phiên bản lên GitHub
git push origin v1.0.0
```

#### Cách 2: Tạo Release trực tiếp trên Trang web GitHub
1. Truy cập vào kho lưu trữ (Repository) của bạn trên GitHub.
2. Tại cột bên phải, nhấp vào **Releases** -> Chọn **Draft a new release**.
3. Nhấp vào nút **Choose a tag**, nhập tên thẻ mới (ví dụ `v1.0.0`) và chọn **Create new tag**.
4. Điền tiêu đề phát hành (Ví dụ: `Release v1.0.0 - Initial stable backend`).
5. Viết nội dung mô tả phiên bản phát hành (Các chức năng chính đã hoạt động, hướng dẫn tích hợp nhanh).
6. Nhấp vào **Publish release**. Bản phát hành này sẽ đi kèm mã nguồn nén dạng `.zip` và `.tar.gz` để dễ dàng tải về cài đặt.

---

Nếu gặp bất kỳ khó khăn hoặc lỗi nào trong quá trình tích hợp API hoặc thao tác Git, vui lòng liên hệ nhóm Backend để được hỗ trợ kịp thời!
