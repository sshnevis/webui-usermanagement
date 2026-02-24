from sqlalchemy.orm import Session
from ..database import models, schemas
from ..services.auth import get_password_hash, verify_password

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_user_by_id(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def update_user(db: Session, user_id: int, user_update: schemas.UserUpdate):
    db_user = get_user_by_id(db, user_id)
    if not db_user:
        return None
    
    if user_update.username:
        db_user.username = user_update.username
    if user_update.email:
        db_user.email = user_update.email
    if user_update.password:
        db_user.hashed_password = get_password_hash(user_update.password)
    
    db.commit()
    db.refresh(db_user)
    return db_user

def delete_user(db: Session, user_id: int):
    db_user = get_user_by_id(db, user_id)
    if not db_user:
        return False
    
    db.delete(db_user)
    db.commit()
    return True

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()

def add_credits(db: Session, user_id: int, amount: float):
    db_user = get_user_by_id(db, user_id)
    if not db_user:
        return None
    
    db_user.credits += amount
    
    # Create transaction record
    transaction = models.Transaction(
        user_id=user_id,
        amount=amount,
        transaction_type=models.TransactionType.DEPOSIT,
        description=f"Added {amount} credits",
        balance_after=db_user.credits
    )
    
    db.add(transaction)
    db.commit()
    db.refresh(db_user)
    return db_user

def deduct_credits(db: Session, user_id: int, amount: float, description: str = ""):
    db_user = get_user_by_id(db, user_id)
    if not db_user:
        return None
    
    if db_user.credits < amount:
        return None  # Insufficient credits
    
    db_user.credits -= amount
    
    # Create transaction record
    transaction = models.Transaction(
        user_id=user_id,
        amount=-amount,
        transaction_type=models.TransactionType.WITHDRAWAL,
        description=description,
        balance_after=db_user.credits
    )
    
    db.add(transaction)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_user_transactions(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.Transaction).filter(
        models.Transaction.user_id == user_id
    ).offset(skip).limit(limit).all()

def get_user_balance(db: Session, user_id: int):
    db_user = get_user_by_id(db, user_id)
    if not db_user:
        return None
    return db_user.credits