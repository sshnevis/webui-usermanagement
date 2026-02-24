from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import database
from ..services import subscription_service, auth
from ..models import schemas

router = APIRouter()

@router.post("/subscription-plans", response_model=schemas.SubscriptionPlanResponse)
def create_subscription_plan(
    plan: schemas.SubscriptionPlanCreate,
    current_user: schemas.UserResponse = Depends(auth.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    # Only admins can create plans
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    return subscription_service.create_subscription_plan(db=db, plan=plan)

@router.get("/subscription-plans")
def get_subscription_plans(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(database.get_db)
):
    return subscription_service.get_subscription_plans(db, skip=skip, limit=limit)

@router.get("/subscription-plans/{plan_id}", response_model=schemas.SubscriptionPlanResponse)
def get_subscription_plan(
    plan_id: int,
    db: Session = Depends(database.get_db)
):
    plan = subscription_service.get_subscription_plan(db, plan_id=plan_id)
    if plan is None:
        raise HTTPException(status_code=404, detail="Plan not found")
    return plan

@router.post("/subscribe")
def subscribe_to_plan(
    subscription: schemas.SubscriptionCreate,
    current_user: schemas.UserResponse = Depends(auth.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    subscription_record = subscription_service.subscribe_user(db, current_user.id, subscription.plan_id)
    if subscription_record is None:
        raise HTTPException(status_code=400, detail="Invalid plan or insufficient credits")
    
    return {"message": "Successfully subscribed", "subscription_id": subscription_record.id}

@router.get("/users/me/subscription")
def get_user_subscription(
    current_user: schemas.UserResponse = Depends(auth.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    subscription = subscription_service.get_user_subscription(db, current_user.id)
    if not subscription:
        return {"message": "No active subscription"}
    return subscription

@router.get("/users/me/subscription/usage")
def get_subscription_usage(
    current_user: schemas.UserResponse = Depends(auth.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    return subscription_service.get_subscription_usage(db, current_user.id)

@router.get("/users/me/subscription/status")
def check_subscription_status(
    current_user: schemas.UserResponse = Depends(auth.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    is_active = subscription_service.check_subscription_status(db, current_user.id)
    return {"is_active": is_active}

@router.get("/users/me/subscription/history")
def get_user_subscriptions(
    skip: int = 0,
    limit: int = 100,
    current_user: schemas.UserResponse = Depends(auth.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    return subscription_service.get_user_subscriptions(db, current_user.id, skip=skip, limit=limit)