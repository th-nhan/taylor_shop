# 🧵 NHÀ MAY THÚY DIỄM - Website Tư Vấn May Đo & Quản Lý Mẫu Thời Trang

Hệ thống ứng dụng web hiện đại kết hợp giữa **Danh mục mẫu thời trang may đo** và **Trợ lý AI tư vấn kiểu dáng, chất liệu vải**. 

![Tech Stack](https://img.shields.io/badge/Frontend-React%20%7C%20Vite%20%7C%20TailwindCSS-blue)
![Tech Stack](https://img.shields.io/badge/Backend-FastAPI%20%7C%20SQLModel%20%7C%20SQLite-green)

---

## 🌟 Tính Năng Nổi Bật

- 👗 **Danh Mục Mẫu Đồ May Đo**: Xem bộ sưu tập thời trang (Đầm dạ hội, Áo sơ mi, Quần tây, Áo dài...), bộ sưu tập hình ảnh chi tiết, chi phí ước tính và tư vấn loại vải tối ưu.
- 🤖 **Trợ Lý AI Tư Vấn Trực Tuyến**: Gợi ý phom dáng, phối đồ và chọn loại vải theo vóc dáng, sở thích hoặc dịp sự kiện của khách hàng.
- 🔐 **Quản Lý Tài Khoản Khách Hàng**: Đăng ký và đăng nhập nhanh chóng bằng số điện thoại.
- 📱 **Giao Diện Hiện Đại & Responsive**: Thiết kế tương thích mượt mà trên cả máy tính (Desktop) và điện thoại (Mobile).

---

## 🛠️ Công Nghệ Sử Dụng

### **Backend**
- **Language**: Python 3.9+
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/)
- **ORM / Database**: [SQLModel](https://sqlmodel.tiangolo.com/) + SQLite (`nhamay.db`)
- **Server**: Uvicorn

### **Frontend**
- **Framework**: [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **HTTP Client**: Axios

---

## 📁 Cấu Trúc Thư Mục

```text
nha_may_app/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py          # FastAPI app & API routes
│   │   ├── models.py        # SQLModel Schemas (Product, User, ChatHistory)
│   │   └── seed.py          # Khởi tạo dữ liệu mẫu ban đầu
│   ├── nhamay.db            # Cơ sở dữ liệu SQLite
│   └── requirements.txt     # Các thư viện Python phụ thuộc
│
├── frontend/
│   ├── src/
│   │   ├── components/      # React components (Header, ProductCard, Chatbox, AuthModal)
│   │   ├── api.js           # Cấu hình Axios gọi Backend API
│   │   ├── App.jsx          # Component chính kết nối giao diện
│   │   └── main.jsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
└── README.md
```

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Ứng Dụng

### 1. Chuẩn bị Môi trường
- **Node.js**: phiên bản >= 18.x
- **Python**: phiên bản >= 3.9

---

### 2. Cài Đặt & Khởi Chạy Backend (FastAPI)

1. Mở Terminal và di chuyển vào thư mục `backend`:
   ```bash
   cd backend
   ```

2. Tạo và kích hoạt môi trường ảo (tùy chọn nhưng khuyến khích):
   - **Windows**:
     ```bash
     py -m venv venv
     .\venv\Scripts\activate
     ```
   - **macOS/Linux**:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. Cài đặt các thư viện cần thiết:
   ```bash
   pip install -r requirements.txt
   ```

4. Khởi chạy server FastAPI:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   > 📌 **Backend Server API**: `http://127.0.0.1:8000`  
   > 📌 **Swagger API Docs**: `http://127.0.0.1:8000/docs`

---

### 3. Cài Đặt & Khởi Chạy Frontend (React + Vite)

1. Mở một cửa sổ Terminal mới và di chuyển vào thư mục `frontend`:
   ```bash
   cd frontend
   ```

2. Cài đặt các gói phụ thuộc (npm packages):
   ```bash
   npm install
   ```

3. Khởi chạy giao diện Frontend:
   ```bash
   npm run dev
   ```
   > 📌 **Frontend App**: `http://localhost:5173`

---

## 📡 Danh Sách API Endpoints

| Phương thức | Endpoint | Mô tả |
| :--- | :--- | :--- |
| `GET` | `/api/products` | Lấy danh sách mẫu sản phẩm (có hỗ trợ lọc theo `category`) |
| `GET` | `/api/products/{id}` | Lấy thông tin chi tiết của 1 sản phẩm |
| `POST` | `/api/chat` | Gửi tin nhắn hỏi đáp tư vấn cho Trợ lý AI |
| `POST` | `/api/auth/register` | Đăng ký tài khoản mới bằng SĐT |
| `POST` | `/api/auth/login` | Đăng nhập tài khoản |

---

## 📝 Giấy Phép & Bản Quyền

Dự án phát triển dành cho **Nhà May Thúy Diễm**. Bản quyền thuộc về đội ngũ phát triển dự án (Đỗ Thành Nhân).
