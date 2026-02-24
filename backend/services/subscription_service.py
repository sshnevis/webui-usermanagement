from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from ..database import models, schemas

def create_subscription_plan(db: Session, plan: schemas.SubscriptionPlanCreate):
    db_plan = models.SubscriptionPlan(
        name=plan.name,
        price=plan.price,
        duration_days=plan.duration_days,
        max_chats_per_hour=plan.max_chats_per_hour,
        max_tokens_per_month=plan.max_tokens_per_month,
        can_access_vip_models=plan.can_access_vip_models,
        description=plan.description
    )
    db.add(db_plan)
    db.commit()
    db.refresh(db_plan)
    return db_plan

def get_subscription_plan(db: Session, plan_id: int):
    return db.query(models.SubscriptionPlan).filter(models.SubscriptionPlan.id == plan_id).first()

def get_subscription_plans(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.SubscriptionPlan).offset(skip).limit(limit).all()

def subscribe_user(db: Session, user_id: int, plan_id: int):
    # Check if user already has an active subscription
    existing_subscription = db.query(models.Subscription).filter(
        models.Subscription.user_id == user_id,
        models.Subscription.is_active == True
    ).first()
    
    if existing_subscription:
        # Deactivate current subscription
        existing_subscription.is_active = False
        db.commit()
    
    # Get the plan details
    plan = get_subscription_plan(db, plan_id)
    if not plan:
        return None
    
    # Create new subscription
    end_date = datetime.utcnow() + timedelta(days=plan.duration_days)
    db_subscription = models.Subscription(
        user_id=user_id,
        plan_id=plan_id,
        start_date=datetime.utcnow(),
        end_date=end_date,
        is_active=True
    )
    
    db.add(db_subscription)
    db.commit()
    db.refresh(db_subscription)
    
    # Deduct subscription cost from user's credits
    from .user_service import deduct_credits
    deduct_credits(db, user_id, plan.price, f"Subscription: {plan.name}")
    
    return db_subscription

def get_user_subscription(db: Session, user_id: int):
    return db.query(models.Subscription).filter(
        models.Subscription.user_id == user_id,
        models.Subscription.is_active == True
    ).first()

def get_user_subscriptions(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.Subscription).filter(
        models.Subscription.user_id == user_id
    ).offset(skip).limit(limit).all()

def check_subscription_status(db: Session, user_id: int):
    subscription = get_user_subscription(db, user_id)
    if not subscription:
        return False
    
    if subscription.end_date < datetime.utcnow():
        # Subscription expired
        subscription.is_active = False
        db.commit()
        return False
    
    return True

def get_subscription_usage(db: Session, user_id: int):
    subscription = get_user_subscription(db, user_id)
    if not subscription:
        return {"chats_this_hour": 0, "tokens_this_month": 0, "plan": None}
    
    # Calculate chats this hour
    one_hour_ago = datetime.utcnow() - timedelta(hours=1)
    chats_this_hour = db.query(models.Chat).filter(
        models.Chat.user_id == user_id,
        models.Chat.created_at >= one_hour_ago
    ).count()
    
    # Calculate tokens this month
    first_day_of_month = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    tokens_this_month = db.query(models.Chat).filter(
        models.Chat.user_id == user_id,
        models.Chat.created_at >= first_day_of_month
    ).with_entities(models.Chat.input_tokens, models.Chat.output_tokens).all()
    
    total_tokens = sum(input_tokens + output_tokens for input_tokens, output_tokens in tokens_this_month)
    
    return {
        "chats_this_hour": chats_this_hour,
        "tokens_this_month": total_tokens,
        "plan": subscription.plan
    }

def can_access_model(db: Session, user_id: int, model_name: str):
    # Check if user is admin
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user and user.role == models.UserRole.ADMIN:
        return True
    
    # Check if user has VIP subscription
    subscription = get_user_subscription(db, user_id)
    if not subscription:
        return False
    
    # Check if model requires VIP access
    # For this example, let's assume models starting with "vip_" require VIP access
    if model_name.startswith("vip_"):
        return subscription.plan.can_access_vip_models
    
    return True

def can_send_chat(db: Session, user_id: int):
    subscription = get_user_subscription(db, user_id)
    if not subscription:
        return False
    
    usage = get_subscription_usage(db, user_id)
    
    # Check chat limit
    if usage["chats_this_hour"] >= subscription.plan.max_chats_per_hour:
        return False
    
    # Check token limit
    if usage["tokens_this_month"] >= subscription.plan.max_tokens_per_month:
        return False
    
    return True