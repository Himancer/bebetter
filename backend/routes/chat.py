from flask import Blueprint, jsonify, request
from models import db, ChatMessage, Player, WeightLog, Workout, MealLog
import os
import requests

chat_bp = Blueprint('chat', __name__)

GROQ_API_KEY = os.environ.get('GROQ_API_KEY', '')
# Groq retires models over time (llama3-8b-8192 died 2025-05, llama-3.1-8b-instant
# free-tier died 2026-06). Keep the model configurable so a swap never needs a code change.
GROQ_MODEL = os.environ.get('GROQ_MODEL', 'openai/gpt-oss-20b')

SYSTEM_PROMPT = (
    "You are BetterMe — the user's future self: fit, disciplined, and successful. "
    "You talk in Hinglish with tough-love motivation, Solo Leveling references, and the "
    "mantra 'Ab Nahi To Kab'. Keep replies short, punchy, and practical — like a coach, not an essay."
)

def get_groq_response(message: str) -> str:
    if not GROQ_API_KEY:
        return "Bro, GROQ_API_KEY missing hai. Check the server environment settings."

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": GROQ_MODEL,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": message}
        ],
        "temperature": 0.7,
        "max_tokens": 1024
    }

    try:
        resp = requests.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=payload, timeout=20)
        resp.raise_for_status()
        data = resp.json()
        return data['choices'][0]['message']['content'].strip()
    except requests.HTTPError as e:
        # Log the real error server-side; keep the user-facing message clean.
        body = e.response.text[:500] if e.response is not None else 'no body'
        print(f"Groq API HTTP error ({GROQ_MODEL}):", str(e), "|", body)
        return "System reboot ho raha hai, bro. Try again in a minute. 🔧"
    except Exception as e:
        print("Groq API error:", str(e))
        return "Connection issue, bro. Ek baar aur try kar. 🔧"

@chat_bp.route('/chat', methods=['GET'])
def get_chat_history():
    limit = request.args.get('limit', 50, type=int)
    messages = ChatMessage.query.filter_by(user_id=request.user.id).order_by(ChatMessage.created_at.desc()).limit(limit).all()
    return jsonify([m.to_dict() for m in reversed(messages)])

@chat_bp.route('/chat', methods=['POST'])
def send_message():
    data = request.json
    user_message = data.get('message', '').strip()
    if not user_message:
        return jsonify({'error': 'Message required'}), 400

    user_msg = ChatMessage(user_id=request.user.id, role='user', content=user_message)
    db.session.add(user_msg)
    
    response_text = get_groq_response(user_message)
    
    assistant_msg = ChatMessage(user_id=request.user.id, role='assistant', content=response_text)
    db.session.add(assistant_msg)
    db.session.commit()

    return jsonify({
        'user': user_msg.to_dict(),
        'assistant': assistant_msg.to_dict(),
    })

@chat_bp.route('/chat/clear', methods=['DELETE'])
def clear_chat():
    ChatMessage.query.filter_by(user_id=request.user.id).delete()
    db.session.commit()
    return jsonify({'message': 'Chat cleared'})
