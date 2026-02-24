from datetime import datetime
from sqlalchemy.orm import Session
from ..database import models, schemas

def create_chat(db: Session, chat: schemas.ChatCreate, user_id: int):
    db_chat = models.Chat(
        user_id=user_id,
        model_name=chat.model_name,
        input_tokens=chat.input_tokens,
        output_tokens=chat.output_tokens,
        cost=chat.cost
    )
    db.add(db_chat)
    db.commit()
    db.refresh(db_chat)
    return db_chat

def get_user_chats(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.Chat).filter(
        models.Chat.user_id == user_id
    ).offset(skip).limit(limit).all()

def get_chat(db: Session, chat_id: int):
    return db.query(models.Chat).filter(models.Chat.id == chat_id).first()

def calculate_chat_cost(input_tokens: int, output_tokens: int, model_name: str):
    """
    Calculate the cost of a chat based on input and output tokens.
    This is a simplified pricing model - in production, you'd want more sophisticated pricing.
    """
    # Example pricing (these would be configurable in a real system)
    pricing = {
        "gpt-3.5-turbo": {"input": 0.0015, "output": 0.002},
        "gpt-4": {"input": 0.03, "output": 0.06},
        "llama-2": {"input": 0.0005, "output": 0.0005},
        "vip-gpt-4": {"input": 0.05, "output": 0.10}
    }
    
    if model_name not in pricing:
        # Default pricing
        input_price = 0.001
        output_price = 0.002
    else:
        input_price = pricing[model_name]["input"]
        output_price = pricing[model_name]["output"]
    
    # Convert token counts to thousands for pricing
    input_cost = (input_tokens / 1000) * input_price
    output_cost = (output_tokens / 1000) * output_price
    
    return round(input_cost + output_cost, 4)

def process_chat_request(db: Session, user_id: int, model_name: str, input_tokens: int, output_tokens: int):
    """
    Process a chat request with validation and cost calculation.
    Returns the chat record if successful, None if failed.
    """
    from .subscription_service import can_access_model, can_send_chat, deduct_credits
    
    # Check if user can access the model
    if not can_access_model(db, user_id, model_name):
        return None, "Access denied: Model not available for your subscription"
    
    # Check if user can send chat (rate limiting)
    if not can_send_chat(db, user_id):
        return None, "Rate limit exceeded: Too many requests"
    
    # Calculate cost
    cost = calculate_chat_cost(input_tokens, output_tokens, model_name)
    
    # Check if user has enough credits
    from .user_service import get_user_balance
    balance = get_user_balance(db, user_id)
    if balance is None or balance < cost:
        return None, "Insufficient credits"
    
    # Deduct credits
    deduct_credits(db, user_id, cost, f"Chat with {model_name}")
    
    # Create chat record
    chat = schemas.ChatCreate(
        model_name=model_name,
        input_tokens=input_tokens,
        output_tokens=output_tokens,
        cost=cost
    )
    
    chat_record = create_chat(db, chat, user_id)
    return chat_record, None

def get_chat_statistics(db: Session, user_id: int):
    """
    Get chat statistics for a user.
    """
    chats = db.query(models.Chat).filter(models.Chat.user_id == user_id).all()
    
    total_chats = len(chats)
    total_tokens = sum(chat.input_tokens + chat.output_tokens for chat in chats)
    total_cost = sum(chat.cost for chat in chats)
    
    # Group by model
    model_stats = {}
    for chat in chats:
        if chat.model_name not in model_stats:
            model_stats[chat.model_name] = {
                "count": 0,
                "tokens": 0,
                "cost": 0
            }
        model_stats[chat.model_name]["count"] += 1
        model_stats[chat.model_name]["tokens"] += chat.input_tokens + chat.output_tokens
        model_stats[chat.model_name]["cost"] += chat.cost
    
    return {
        "total_chats": total_chats,
        "total_tokens": total_tokens,
        "total_cost": total_cost,
        "model_stats": model_stats
    }