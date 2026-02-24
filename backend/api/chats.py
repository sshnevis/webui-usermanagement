from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import database
from ..services import chat_service, auth
from ..models import schemas

router = APIRouter()

@router.post("/chats", response_model=schemas.ChatResponse)
def create_chat(
    chat: schemas.ChatCreate,
    current_user: schemas.UserResponse = Depends(auth.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    chat_record, error = chat_service.process_chat_request(
        db, current_user.id, chat.model_name, chat.input_tokens, chat.output_tokens
    )
    
    if error:
        raise HTTPException(status_code=400, detail=error)
    
    return chat_record

@router.get("/chats")
def get_user_chats(
    skip: int = 0,
    limit: int = 100,
    current_user: schemas.UserResponse = Depends(auth.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    return chat_service.get_user_chats(db, current_user.id, skip=skip, limit=limit)

@router.get("/chats/{chat_id}", response_model=schemas.ChatResponse)
def get_chat(
    chat_id: int,
    current_user: schemas.UserResponse = Depends(auth.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    chat = chat_service.get_chat(db, chat_id)
    if chat is None:
        raise HTTPException(status_code=404, detail="Chat not found")
    
    # Check if chat belongs to current user
    if chat.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this chat")
    
    return chat

@router.get("/users/me/chat-statistics")
def get_chat_statistics(
    current_user: schemas.UserResponse = Depends(auth.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    return chat_service.get_chat_statistics(db, current_user.id)

@router.get("/models")
def get_available_models(
    current_user: schemas.UserResponse = Depends(auth.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    """
    Get list of available models for the current user based on their subscription.
    """
    from ..services.subscription_service import get_user_subscription
    
    subscription = get_user_subscription(db, current_user.id)
    
    # Base models available to all users
    available_models = [
        {"name": "gpt-3.5-turbo", "description": "GPT-3.5 Turbo model", "requires_vip": False},
        {"name": "llama-2", "description": "Llama 2 model", "requires_vip": False}
    ]
    
    # Add VIP models if user has VIP subscription
    if subscription and subscription.plan.can_access_vip_models:
        available_models.extend([
            {"name": "gpt-4", "description": "GPT-4 model", "requires_vip": True},
            {"name": "vip-gpt-4", "description": "VIP GPT-4 model", "requires_vip": True}
        ])
    
    # Add admin models if user is admin
    if current_user.role == "admin":
        available_models.append({
            {"name": "admin-gpt-4", "description": "Admin GPT-4 model", "requires_vip": False}
        })
    
    return available_models

@router.get("/users/me/rate-limit-status")
def get_rate_limit_status(
    current_user: schemas.UserResponse = Depends(auth.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    """
    Get current rate limit status for the user.
    """
    from ..services.subscription_service import get_subscription_usage
    
    usage = get_subscription_usage(db, current_user.id)
    
    # Check if user can send more chats
    can_send = chat_service.can_send_chat(db, current_user.id)
    
    return {
        "chats_this_hour": usage["chats_this_hour"],
        "tokens_this_month": usage["tokens_this_month"],
        "plan": usage["plan"],
        "can_send_chat": can_send
    }