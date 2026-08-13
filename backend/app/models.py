from datetime import datetime
from typing import Optional, List, Dict, Any
from sqlmodel import SQLModel, Field, JSON, Column
from pydantic import BaseModel

# ==========================================
# DATABASE MODELS
# ==========================================

class Product(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    categories: List[str] = Field(default=[], sa_column=Column(JSON))
    target_gender: str
    price_estimate: str
    description: str
    design_details: Dict[str, str] = Field(default={}, sa_column=Column(JSON))
    fabric_recommendations: List[str] = Field(default=[], sa_column=Column(JSON))
    image_urls: List[str] = Field(default=[], sa_column=Column(JSON))
    is_pinned: bool = Field(default=False)

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    full_name: str
    phone: str = Field(unique=True, index=True)
    password_hash: str
    role: str = Field(default="user")
    created_at: datetime = Field(default_factory=datetime.now)

class ChatHistory(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: Optional[int] = Field(default=None, foreign_key="user.id")
    sender: str  # "user" hoặc "ai"
    message: str
    created_at: datetime = Field(default_factory=datetime.now)

# ==========================================
# REQUEST & RESPONSE SCHEMAS
# ==========================================

class UserRegister(BaseModel):
    full_name: str
    phone: str
    password: str

class UserLogin(BaseModel):
    phone: str
    password: str

class UserResponse(BaseModel):
    id: int
    full_name: str
    phone: str
    role: str
    created_at: datetime

class AuthResponse(BaseModel):
    message: str
    user: UserResponse

class ChatRequest(BaseModel):
    message: str
    user_id: Optional[int] = None

class ChatResponse(BaseModel):
    reply: str
    created_at: datetime
