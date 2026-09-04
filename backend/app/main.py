import os
import shutil
import uuid
from contextlib import asynccontextmanager
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, status, File, UploadFile, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlmodel import SQLModel, create_engine, Session, select

from app.models import (
    Product, User, ChatHistory,
    UserRegister, UserLogin, UserResponse, AuthResponse,
    ChatRequest, ChatResponse
)
from app.seed import seed_data

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./nhamay.db")
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args)

def get_session():
    with Session(engine) as session:
        yield session

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Khởi tạo bảng DB & Seed data khi ứng dụng chạy
    SQLModel.metadata.create_all(engine)
    # Tự động thêm cột is_pinned nếu chưa tồn tại
    try:
        from sqlalchemy import text
        with Session(engine) as session:
            session.execute(text("ALTER TABLE product ADD COLUMN is_pinned BOOLEAN DEFAULT 0"))
            session.commit()
    except Exception:
        pass
    seed_data(engine)
    yield

app = FastAPI(
    title="NHÀ MAY THÚY DIỄM API",
    description="Backend Service cho Quản lý Mẫu đồ & Trợ lý AI Tư vấn May đo",
    version="1.0.0",
    lifespan=lifespan
)

# Cấu hình thư mục chứa ảnh upload
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOAD_DIR = os.path.join(BASE_DIR, "static", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Mount Static Files
app.mount("/static", StaticFiles(directory=os.path.join(BASE_DIR, "static")), name="static")

# Cấu hình CORS mở rộng cho phép Vercel, localhost và mọi domain truy cập
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https?://.*",
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"message": "Chào mừng đến với API NHÀ MAY THÚY DIỄM!", "status": "active"}

from app.uploader import process_and_store_image

@app.post("/api/upload")
async def upload_image(
    request: Request,
    files: Optional[List[UploadFile]] = File(default=None),
    file: Optional[UploadFile] = File(default=None)
):
    # Cấu hình Base URL server
    backend_env_url = os.getenv("BACKEND_URL") or os.getenv("PUBLIC_URL") or os.getenv("RENDER_EXTERNAL_URL")
    if backend_env_url:
        base_url = backend_env_url.rstrip("/")
    else:
        proto = request.headers.get("x-forwarded-proto") or request.url.scheme
        host = request.headers.get("x-forwarded-host") or request.headers.get("host") or request.url.netloc
        base_url = f"{proto}://{host}"

    all_files = []
    if file:
        all_files.append(file)
    elif files:
        all_files.extend(files)
        
    # Fallback đọc từ request.form() nếu FastAPI không bind tự động
    if not all_files:
        try:
            form = await request.form()
            for key in ["file", "files"]:
                for item in form.getlist(key):
                    if hasattr(item, "filename") and item.filename:
                        all_files.append(item)
            if not all_files:
                for k, v in form.items():
                    if hasattr(v, "filename") and v.filename:
                        all_files.append(v)
        except Exception:
            pass

    if not all_files:
        raise HTTPException(status_code=400, detail="Không có tệp ảnh nào được gửi lên.")

    uploaded_urls = []
    for f in all_files:
        try:
            content = await f.read()
            filename = f.filename or "image.jpg"
            stored_url = process_and_store_image(
                image_bytes=content,
                filename=filename,
                upload_dir=UPLOAD_DIR,
                base_url=base_url
            )
            if stored_url:
                uploaded_urls.append(stored_url)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Không thể xử lý và lưu ảnh {f.filename}: {str(e)}")
        
    return {
        "url": uploaded_urls[0] if uploaded_urls else "",
        "urls": uploaded_urls
    }


# ==========================================
# 1. API SẢN PHẨM & MẪU ĐỒ
# ==========================================

@app.get("/api/products", response_model=List[Product])
def get_products(category: Optional[str] = None, session: Session = Depends(get_session)):
    statement = select(Product).order_by(Product.is_pinned.desc(), Product.id.desc())
    results = session.exec(statement).all()
    if category and category != "Tất cả":
        results = [p for p in results if category in p.categories]
    return results

@app.get("/api/categories", response_model=List[str])
def get_categories(session: Session = Depends(get_session)):
    statement = select(Product)
    products = session.exec(statement).all()
    categories_set = set()
    for p in products:
        if p.categories:
            for cat in p.categories:
                categories_set.add(cat)
    # Danh mục mặc định ban đầu
    default_categories = ["Đầm", "Quần tây", "Đồ bộ", "Sơ mi"]
    for cat in default_categories:
        categories_set.add(cat)
    return sorted(list(categories_set))

@app.get("/api/products/{product_id}", response_model=Product)
def get_product_detail(product_id: int, session: Session = Depends(get_session)):
    product = session.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Không tìm thấy sản phẩm")
    return product

from app.ai_knowledge import generate_expert_reply, QUICK_PROMPT_CATEGORIES

# ==========================================
# 2. API CHATBOT TƯ VẤN AI
# ==========================================

@app.get("/api/chat/prompts")
def get_chat_prompts():
    """Trả về danh mục câu hỏi gợi ý cho khách hàng"""
    return QUICK_PROMPT_CATEGORIES

@app.post("/api/chat", response_model=ChatResponse)
def chat_consultant(req: ChatRequest, session: Session = Depends(get_session)):
    user_text = req.message.strip()
    if not user_text:
        raise HTTPException(status_code=400, detail="Nội dung tin nhắn không được để trống")

    # Lưu tin nhắn của user vào ChatHistory
    user_msg = ChatHistory(user_id=req.user_id, sender="user", message=user_text)
    session.add(user_msg)
    session.commit()

    # Sinh câu trả lời tư vấn may đo chuyên gia dựa trên kho tri thức & dữ liệu sản phẩm
    reply = generate_expert_reply(user_text, session)

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
        password_hash=user_data.password, # Đơn giản hóa hash trong mẫu này
        role="user"
    )
    session.add(new_user)
    session.commit()
    session.refresh(new_user)

    user_resp = UserResponse(
        id=new_user.id,
        full_name=new_user.full_name,
        phone=new_user.phone,
        role=new_user.role,
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
        role=user.role,
        created_at=user.created_at
    )
    return AuthResponse(message="Đăng nhập thành công!", user=user_resp)

# ==========================================
# 4. API QUẢN LÝ TÀI KHOẢN (DASHBOARD)
# ==========================================

@app.get("/api/users", response_model=List[UserResponse])
def get_users(session: Session = Depends(get_session)):
    users = session.exec(select(User)).all()
    return [
        UserResponse(
            id=u.id,
            full_name=u.full_name,
            phone=u.phone,
            role=u.role,
            created_at=u.created_at
        ) for u in users
    ]

@app.delete("/api/users/{user_id}")
def delete_user(user_id: int, session: Session = Depends(get_session)):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Không tìm thấy tài khoản")
    session.delete(user)
    session.commit()
    return {"message": "Xóa tài khoản thành công!"}

# ==========================================
# 5. API QUẢN LÝ SẢN PHẨM (DASHBOARD)
# ==========================================

@app.post("/api/products", response_model=Product)
def create_product(product: Product, session: Session = Depends(get_session)):
    session.add(product)
    session.commit()
    session.refresh(product)
    return product

@app.put("/api/products/{product_id}", response_model=Product)
def update_product(product_id: int, product_data: Product, session: Session = Depends(get_session)):
    db_product = session.get(Product, product_id)
    if not db_product:
        raise HTTPException(status_code=404, detail="Không tìm thấy mẫu sản phẩm")
    
    db_product.name = product_data.name
    db_product.categories = product_data.categories
    db_product.target_gender = product_data.target_gender
    db_product.price_estimate = product_data.price_estimate
    db_product.description = product_data.description
    db_product.design_details = product_data.design_details
    db_product.fabric_recommendations = product_data.fabric_recommendations
    db_product.image_urls = product_data.image_urls
    db_product.is_pinned = product_data.is_pinned
    
    session.add(db_product)
    session.commit()
    session.refresh(db_product)
    return db_product

@app.delete("/api/products/{product_id}")
def delete_product(product_id: int, session: Session = Depends(get_session)):
    product = session.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Không tìm thấy mẫu sản phẩm")
    session.delete(product)
    session.commit()
    return {"message": "Xóa mẫu sản phẩm thành công!"}

