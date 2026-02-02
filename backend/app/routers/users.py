from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import schemas, models, auth, db
from ..db import get_db
from datetime import timedelta

router = APIRouter(prefix="/users", tags=["users"])

def get_current_user(token: str = None, db: Session = Depends(get_db)):
    # simple stub — integrate proper JWT parsing
    if not token:
        raise HTTPException(401, 'Not authenticated')
    return None  # stub

@router.post('/register', response_model=schemas.UserOut)
def register(u: schemas.UserCreate, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == u.email).first()
    if existing:
        raise HTTPException(400, 'Email already registered')
    user = models.User(
        name=u.name,
        email=u.email,
        password_hash=auth.get_password_hash(u.password),
        age=u.age,
        gender=u.gender,
        height_cm=u.height_cm,
        weight_kg=u.weight_kg,
        goal=u.goal,
        activity_level=u.activity_level
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.post('/login', response_model=schemas.Token)
def login(email: str, password: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user or not auth.verify_password(password, user.password_hash):
        raise HTTPException(401, 'Invalid credentials')
    token = auth.create_access_token(data={"sub": user.id})
    return {"access_token": token, "token_type": "bearer"}

@router.get('/me', response_model=schemas.UserOut)
def get_me(token: str = None, db: Session = Depends(get_db)):
    # stub — in production extract user_id from JWT token
    if not token:
        raise HTTPException(401, 'Not authenticated')
    # For dev, return first user (or add proper token parsing)
    user = db.query(models.User).first()
    if not user:
        raise HTTPException(404, 'User not found')
    return user
