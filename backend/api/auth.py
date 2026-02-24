from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from ..database import database
from ..services import auth, user_service
from ..models import schemas

router = APIRouter()

@router.post("/token", response_model=schemas.Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(database.get_db)
):
    user = auth.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/register", response_model=schemas.UserResponse)
def register_user(
    user: schemas.UserCreate,
    db: Session = Depends(database.get_db)
):
    db_user = user_service.get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    db_user = user_service.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    return user_service.create_user(db=db, user=user)

@router.get("/users/me", response_model=schemas.UserResponse)
async def read_users_me(current_user: schemas.UserResponse = Depends(auth.get_current_active_user)):
    return current_user

@router.put("/users/me", response_model=schemas.UserResponse)
async def update_user_me(
    user_update: schemas.UserUpdate,
    current_user: schemas.UserResponse = Depends(auth.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    return user_service.update_user(db, current_user.id, user_update)

@router.get("/users/me/balance")
async def get_user_balance(
    current_user: schemas.UserResponse = Depends(auth.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    balance = user_service.get_user_balance(db, current_user.id)
    return {"balance": balance}

@router.get("/users/me/transactions")
async def get_user_transactions(
    skip: int = 0,
    limit: int = 100,
    current_user: schemas.UserResponse = Depends(auth.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    transactions = user_service.get_user_transactions(db, current_user.id, skip=skip, limit=limit)
    return transactions

@router.post("/users/me/add-credits")
async def add_credits(
    amount: float,
    current_user: schemas.UserResponse = Depends(auth.get_current_active_user),
    db: Session = Depends(database.get_db)
):
    if amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")
    
    user = user_service.add_credits(db, current_user.id, amount)
    return {"message": f"Added {amount} credits", "new_balance": user.credits}