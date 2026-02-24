from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    USER = "user"
    VIP = "vip"
    ADMIN = "admin"

class TransactionType(str, Enum):
    DEPOSIT = "deposit"
    WITHDRAWAL = "withdrawal"
    CHAT_COST = "chat_cost"
    SUBSCRIPTION = "subscription"

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    role: UserRole
    credits: float
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class TransactionCreate(BaseModel):
    amount: float
    transaction_type: TransactionType
    description: Optional[str] = None

class TransactionResponse(BaseModel):
    id: int
    user_id: int
    amount: float
    transaction_type: TransactionType
    description: Optional[str]
    balance_after: float
    created_at: datetime

    class Config:
        from_attributes = True

class SubscriptionPlanCreate(BaseModel):
    name: str
    price: float
    duration_days: int
    max_chats_per_hour: int = 10
    max_tokens_per_month: int = 1000000
    can_access_vip_models: bool = False
    description: Optional[str] = None

class SubscriptionPlanResponse(BaseModel):
    id: int
    name: str
    price: float
    duration_days: int
    max_chats_per_hour: int
    max_tokens_per_month: int
    can_access_vip_models: bool
    description: Optional[str]

    class Config:
        from_attributes = True

class SubscriptionCreate(BaseModel):
    plan_id: int

class SubscriptionResponse(BaseModel):
    id: int
    user_id: int
    plan_id: int
    start_date: datetime
    end_date: datetime
    is_active: bool

    class Config:
        from_attributes = True

class ChatCreate(BaseModel):
    model_name: str
    input_tokens: int
    output_tokens: int
    cost: float

class ChatResponse(BaseModel):
    id: int
    user_id: int
    model_name: str
    input_tokens: int
    output_tokens: int
    cost: float
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None