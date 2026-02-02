from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import db, models
from datetime import datetime, timedelta
from typing import List

router = APIRouter(prefix='/ai', tags=['ai'])

# Simple in-app AI assistant stub using templates. Replace with LLM calls in production.

SYSTEM_PROMPT = (
    "You are BetterMe, a friendly practical fitness coach. "
    "Use the user's goal, BMI, recent meals, workout history, protein intake, and calorie balance to provide concise advice. "
    "Do not give medical diagnoses or prescribe supplements."
)

def build_context(user, recent_meals: List[dict], workouts: List[dict]):
    ctx = {
        'name': user.name,
        'goal': user.goal,
        'height_cm': user.height_cm,
        'weight_kg': user.weight_kg,
        'recent_meals': recent_meals,
        'workouts': workouts,
    }
    return ctx

@router.post('/chat')
def chat(user_id: str, message: str, db: Session = Depends(db.get_db)):
    # Enforce 10 messages/day and 7-day memory window
    now = datetime.utcnow()
    day_ago = now - timedelta(days=1)
    count_today = db.query(models.AIChat).filter(models.AIChat.user_id == user_id, models.AIChat.timestamp >= day_ago).count()
    if count_today >= 10:
        raise HTTPException(403, 'Daily AI message limit reached')

    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(404, 'User not found')

    # gather recent context
    seven_days = now - timedelta(days=7)
    meals = []
    workouts = []
    # in a fuller implementation we would query recent food_scan_logs and workout_logs

    context = build_context(user, meals, workouts)

    # simple rule-based reply
    reply = f"Hi {user.name.split()[0] if user.name else 'there'}. "
    if user.goal and 'fat' in (user.goal or '').lower():
        reply += "For fat loss, aim for a moderate calorie deficit and prioritize protein. "
    elif user.goal and 'muscle' in (user.goal or '').lower():
        reply += "For muscle gain, increase protein and follow progressive overload in workouts. "
    else:
        reply += "Focus on consistency with balanced macros. "

    reply += "This is AI-assisted coaching and not medical advice."

    chat = models.AIChat(user_id=user_id, role='user', message=message)
    db.add(chat)
    db.commit()

    db.add(models.AIChat(user_id=user_id, role='assistant', message=reply))
    db.commit()

    return {'reply': reply, 'context': context}
