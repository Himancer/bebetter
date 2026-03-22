from flask import Blueprint, jsonify, request
from models import db, ChatMessage, Player, WeightLog, Workout, MealLog
from datetime import date
import os
import requests

chat_bp = Blueprint('chat', __name__)

GROQ_API_KEY = os.environ.get('GROQ_API_KEY', '')

def get_groq_response(message: str) -> str:
    if not GROQ_API_KEY:
        return "Bro, GROQ_API_KEY missing hai. System check kar pehle."

    system_prompt = "You are Future Himanshu — 70kg, fit, successful AI engineer. You talk in Hinglish. You reference Solo Leveling and Ab Nahi To Kab. You give tough love motivation."

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "llama3-8b-8192",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": message}
        ],
        "temperature": 0.7,
        "max_tokens": 1024
    }

    try:
        resp = requests.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=payload, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        return data['choices'][0]['message']['content'].strip()
    except Exception as e:
        print("Groq API error:", str(e))
        return f"Error contacting Future Himanshu server. Solo Leveling paused: {str(e)}"

@chat_bp.route('/chat', methods=['GET'])
def get_chat_history():
    limit = request.args.get('limit', 50, type=int)
    messages = ChatMessage.query.order_by(ChatMessage.created_at.desc()).limit(limit).all()
    return jsonify([m.to_dict() for m in reversed(messages)])

@chat_bp.route('/chat', methods=['POST'])
def send_message():
    data = request.json
    user_message = data.get('message', '').strip()
    if not user_message:
        return jsonify({'error': 'Message required'}), 400

    # Save user message
    user_msg = ChatMessage(role='user', content=user_message)
    db.session.add(user_msg)

    # Generate response via Groq
    response_text = get_groq_response(user_message)

    # Save assistant message
    assistant_msg = ChatMessage(role='assistant', content=response_text)
    db.session.add(assistant_msg)
    db.session.commit()

    return jsonify({
        'user': user_msg.to_dict(),
        'assistant': assistant_msg.to_dict(),
    })

@chat_bp.route('/chat/clear', methods=['DELETE'])
def clear_chat():
    ChatMessage.query.delete()
    db.session.commit()
    return jsonify({'message': 'Chat cleared'})
