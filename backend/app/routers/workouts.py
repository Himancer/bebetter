from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import db, models

router = APIRouter(prefix='/workouts', tags=['workouts'])

@router.post('/')
def log_workout(user_id: str, duration: float, calories_burned: float, db: Session = Depends(db.get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(404, 'User not found')
    
    w = models.WorkoutLog(user_id=user_id, duration=duration, calories_burned=calories_burned)
    db.add(w)
    db.commit()
    db.refresh(w)
    return w

@router.get('/{user_id}')
def get_workouts(user_id: str, db: Session = Depends(db.get_db)):
    return db.query(models.WorkoutLog).filter(models.WorkoutLog.user_id == user_id).all()
