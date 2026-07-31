import os
from contextlib import asynccontextmanager
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel, create_engine, Session, select

from app.models import (
    Product, User, ChatHistory,
    UserRegister, UserLogin, UserResponse, AuthResponse,
    ChatRequest, ChatResponse
)
from app.seed import seed_data

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./nhamay.db")
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

def get_session():
    with Session(engine) as session:
        yield session

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Khởi tạo bảng DB & Seed data khi ứng dụng chạy
    SQLModel.metadata.create_all(engine)
    seed_data()
    yield

app = FastAPI(
    title="NHÀ MAY THÚY DIỄM API",
    description="Backend Service cho Quản lý Mẫu đồ & Trợ lý AI Tư vấn May đo",
    version="1.0.0",
    lifespan=lifespan
)

# Cấu hình CORS cho phép React Vite truy cập
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Chào mừng đến với API NHÀ MAY THÚY DIỄM!", "status": "active"}

# ==========================================
# 1. API SẢN PHẨM & MẪU ĐỒ
# ==========================================

@app.get("/api/products", response_model=List[Product])
def get_products(category: Optional[str] = None, session: Session = Depends(get_session)):
    statement = select(Product)
    if category and category != "Tất cả":
        statement = statement.where(Product.category == category)
    results = session.exec(statement).all()
    return results

@app.get("/api/products/{product_id}", response_model=Product)
def get_product_detail(product_id: int, session: Session = Depends(get_session)):
    product = session.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Không tìm thấy sản phẩm")
    return product

# ==========================================
# 2. API CHATBOT TƯ VẤN AI
# ==========================================

@app.post("/api/chat", response_model=ChatResponse)
def chat_consultant(req: ChatRequest, session: Session = Depends(get_session)):
    user_text = req.message.strip()
    if not user_text:
        raise HTTPException(status_code=400, detail="Nội dung tin nhắn không được để trống")

    # Lưu tin nhắn của user vào ChatHistory
    user_msg = ChatHistory(user_id=req.user_id, sender="user", message=user_text)
    session.add(user_msg)
    session.commit()

    # Phân tích câu hỏi và sinh câu trả lời tư vấn may đo thông minh
    msg_lower = user_text.lower()
    if any(k in msg_lower for k in ["đầm", "váy", "dạ hội"]):
        reply = "Dạ đối với Đầm dạ hội / đầm suông, tiệm khuyên dùng chất liệu Lụa Satin hoặc Lụa Mango mềm rủ để tạo bước đi uyển chuyển. Bạn có muốn may theo số đo riêng hay lấy mẫu có sẵn ạ?"
    elif any(k in msg_lower for k in ["quần", "quần tây", "kaki"]):
        reply = "Dạ với Quần tây nam/nữ, Nhà May Thúy Diễm sử dụng vải Tuyết mưa phom đứng hoặc Kaki thun co giãn 4 chiều giúp lên dáng cực chuẩn và thoải mái khi ngồi lâu công sở ạ!"
    elif any(k in msg_lower for k in ["sơ mi", "áo"]):
        reply = "Dạ Áo Sơ mi bên tiệm hay tư vấn vải Bamboo (sợi tre) chống nhăn hoặc Cotton 100% thoáng mát. Tiệm hỗ trợ thêu tên cá nhân hóa lên cổ áo/măng séc miễn phí luôn ạ!"
    elif any(k in msg_lower for k in ["giá", "nhiêu", "chi phí", "tiền"]):
        reply = "Dạ chi phí may đo phụ thuộc vào kiểu dáng và loại vải bạn chọn (dao động từ 220.000đ - 650.000đ bao gồm công may). Bạn có thể ghé trực tiếp tiệm hoặc gửi ảnh mẫu để tiệm báo giá chính xác nha!"
    else:
        reply = f"Dạ, về nhu cầu '{user_text}', Nhà May Thúy Diễm rất hân hạnh tư vấn. Bạn cho tiệm xin chiều cao, cân nặng hoặc dịp mặc (đi làm, dự tiệc, đi chơi) để thợ may gợi ý phom dáng chuẩn nhất nhé!"

    # Lưu phản hồi của AI vào DB
    ai_msg = ChatHistory(user_id=req.user_id, sender="ai", message=reply)
    session.add(ai_msg)
    session.commit()

    return ChatResponse(reply=reply, created_at=ai_msg.created_at)

# ==========================================
# 3. API ĐĂNG KÝ & ĐĂNG NHẬP (AUTH)
# ==========================================

@app.post("/api/auth/register", response_model=AuthResponse)
def register(user_data: UserRegister, session: Session = Depends(get_session)):
    # Kiểm tra SĐT tồn tại
    existing_user = session.exec(select(User).where(User.phone == user_data.phone)).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Số điện thoại này đã được đăng ký tài khoản!")

    # Lưu user mới
    new_user = User(
        full_name=user_data.full_name,
        phone=user_data.phone,
        password_hash=user_data.password # Đơn giản hóa hash trong mẫu này
    )
    session.add(new_user)
    session.commit()
    session.refresh(new_user)

    user_resp = UserResponse(
        id=new_user.id,
        full_name=new_user.full_name,
        phone=new_user.phone,
        created_at=new_user.created_at
    )
    return AuthResponse(message="Đăng ký tài khoản thành công!", user=user_resp)

@app.post("/api/auth/login", response_model=AuthResponse)
def login(credentials: UserLogin, session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.phone == credentials.phone)).first()
    if not user or user.password_hash != credentials.password:
        raise HTTPException(status_code=401, detail="Số điện thoại hoặc mật khẩu không chính xác!")

    user_resp = UserResponse(
        id=user.id,
        full_name=user.full_name,
        phone=user.phone,
        created_at=user.created_at
    )
    return AuthResponse(message="Đăng nhập thành công!", user=user_resp)
