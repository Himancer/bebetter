from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import db, models, nutrition

router = APIRouter(prefix='/nutrition', tags=['nutrition'])

@router.get('/targets/{user_id}')
def get_targets(user_id: str, db: Session = Depends(db.get_db)):
    """Fetch nutrition targets for a user."""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(404, 'User not found')
    
    if not all([user.weight_kg, user.height_cm, user.age, user.gender, user.goal, user.activity_level]):
        raise HTTPException(400, 'User profile incomplete. Set weight, height, age, gender, goal, activity_level.')
    
    targets = nutrition.calculate_nutrition_targets(
        weight_kg=user.weight_kg,
        height_cm=user.height_cm,
        age=user.age,
        gender=user.gender,
        goal=user.goal,
        activity_level=user.activity_level
    )
    return targets
