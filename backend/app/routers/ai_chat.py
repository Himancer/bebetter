from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import db, models
from ..fitness_coach import get_betterme_response
from datetime import datetime, timedelta
from typing import List

router = APIRouter(prefix='/ai-chat', tags=['ai-chat'])

@router.post('/message')
def send_message(user_id: str, message: str, db: Session = Depends(db.get_db)):
    """Send message to BetterMe AI coach - 10 msgs/day limit"""
    now = datetime.utcnow()
    day_ago = now - timedelta(days=1)
    
    # Check daily message limit
    count_today = db.query(models.AIChat).filter(
        models.AIChat.user_id == user_id, 
        models.AIChat.timestamp >= day_ago
    ).count()
    
    if count_today >= 10:
        raise HTTPException(status_code=403, detail='Daily message limit (10/day) reached')
    
    # Get user
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail='User not found')
    
    # Get AI response using fitness coach knowledge base
    response = get_betterme_response(message)
    
    # Save user message
    user_msg = models.AIChat(
        user_id=user_id, 
        role='user', 
        message=message,
        timestamp=now
    )
    db.add(user_msg)
    
    # Save AI response
    ai_msg = models.AIChat(
        user_id=user_id, 
        role='assistant', 
        message=response,
        timestamp=now
    )
    db.add(ai_msg)
    db.commit()
    
    return {
        'response': response,
        'messages_remaining': 10 - (count_today + 1)
    }

@router.get('/messages')
def get_messages(user_id: str, db: Session = Depends(db.get_db)):
    """Get chat history for user"""
    messages = db.query(models.AIChat).filter(
        models.AIChat.user_id == user_id
    ).order_by(models.AIChat.timestamp.desc()).limit(50).all()
    
    return [
        {
            'role': msg.role,
            'message': msg.message,
            'timestamp': msg.timestamp.isoformat()
        } 
        for msg in reversed(messages)
    ]

@router.post('/message-stream')
def send_message_stream(user_id: str, message: str, db: Session = Depends(db.get_db)):
    """Stream response from BetterMe for real-time chat experience"""
    # Similar to above but with streaming capability for frontend
    now = datetime.utcnow()
    day_ago = now - timedelta(days=1)
    
    count_today = db.query(models.AIChat).filter(
        models.AIChat.user_id == user_id, 
        models.AIChat.timestamp >= day_ago
    ).count()
    
    if count_today >= 10:
        return {'error': 'Daily message limit (10/day) reached'}
    
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        return {'error': 'User not found'}
    
    # Get response
    response = get_betterme_response(message)
    
    # Save messages
    user_msg = models.AIChat(user_id=user_id, role='user', message=message, timestamp=now)
    ai_msg = models.AIChat(user_id=user_id, role='assistant', message=response, timestamp=now)
    db.add(user_msg)
    db.add(ai_msg)
    db.commit()
    
    return {
        'response': response,
        'messages_remaining': 10 - (count_today + 1),
        'user_id': user_id
    }

    db.add(chat)
    db.commit()

    db.add(models.AIChat(user_id=user_id, role='assistant', message=reply))
    db.commit()

    return {'reply': reply, 'context': context}
