from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, db
from ..db import get_db

router = APIRouter(prefix='/foods', tags=['foods'])

@router.get('/')
def list_foods(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Food).offset(skip).limit(limit).all()

@router.get('/{food_name}')
def get_food(food_name: str, db: Session = Depends(get_db)):
    f = db.query(models.Food).filter(models.Food.name.ilike(f"%{food_name}%")).first()
    if not f:
        raise HTTPException(404, 'Food not found')
    return f
