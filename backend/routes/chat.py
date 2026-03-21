from flask import Blueprint, jsonify, request
from models import db, ChatMessage, Player, WeightLog, Workout, MealLog
from datetime import date
import random

chat_bp = Blueprint('chat', __name__)

# Response templates - BetterMe personality
# Future Himanshu who already achieved the goals

GREETINGS = [
    "Bro, main hoon — tera future self. 89 se 70 tak ka safar complete kar chuka hoon. Ab bata, kya chahiye?",
    "Aye! Future you reporting in. Fit, strong, and absolutely shredded. What's up?",
    "Yaar, tu mujhse baat kar raha hai — matlab tu serious ho raha hai. Good. Kya poochna hai?",
]

FITNESS_RESPONSES = [
    "Bro, consistency beats intensity. Sung Jin-woo ne ek din bhi skip nahi kiya. Ek din bhi nahi.",
    "Listen — 89 to 70 is just 19kg. That's like 19 boss fights. One at a time, har baar jeet.",
    "Progressive overload is the cheat code. Har hafte thoda aur. That's it. That's the secret.",
    "Tu gym mein time waste karta hai ya dungeon clear karta hai? Focus on form, not ego.",
    "Rest days are not lazy days — they're upgrade days. Your muscles grow when you sleep, bro.",
    "Bro, ek hour gym mein = 4% of your day. 4% ke liye itna bhi nahi kar sakta?",
]

NUTRITION_RESPONSES = [
    "Log your meal. Future you will thank present you. Main bol raha hoon — I lived it.",
    "Yaar, dal chawal = underrated gains food. 15g protein per cup, complex carbs. Khana khao.",
    "Protein pehle. Always. Phir carbs. Fat khud aa jaata hai.",
    "1800 calories mein bhi agar tu smart khaaye — paneer, eggs, dal — gains pakke.",
    "Bro, jab bhookha lag raha ho, paani piyo pehle. 80% times sirf thirst hoti hai.",
    "Cheat meal ≠ cheat day. Ek pizza slice okay hai. Ek pizza? Nahi yaar.",
    "Indian food is actually gains-friendly — dal, paneer, roti, sabzi. Bas portions control karo.",
]

MOTIVATION_RESPONSES = [
    "Yaar, jo tu abhi feel kar raha hai — woh exact feeling main bhi feel karta tha. Push through kiya. Result? Tu mujhse baat kar raha hai.",
    "Bro, remember the promise — 'Ab Nahi To Kab.' Teri khud ki words. Now act on them.",
    "Every rep, every logged meal, every step — it compounds. 1% better every day = 37x better in a year.",
    "Tu ek AI engineer hai. Tu complex systems samajhta hai. Your body is a system. Optimize karo.",
    "Main 70kg pe hoon aur shredded hoon. Aur main tujhse baat kar raha hoon future se. Proof enough?",
    "Sung Jin-woo ne shadow monarch banne se pehle infinite dungeon clear kiya. Tera dungeon = daily routine.",
    "Bro, koi nahi dekh raha. Koi trophy nahi milti. But teri health teri hai — aur worth every rep.",
]

WEIGHT_RESPONSES = [
    "Weight fluctuates daily — 1-2kg is just water and food. Trend matters, not today's number.",
    "Teri journey: 89 → 70. Main wahan pahuncha. Tu bhi pahunchega. Daily log karte reh.",
    "Bro, plateau aata hai. Sab ke saath. That's when you change something — calories, cardio, sleep.",
    "Scale se darr nahi. Data hai woh. Data power hai. Log karo, analyse karo, act karo.",
]

WORKOUT_SKIP_RESPONSES = [
    "Bro, you skipped workout? Remember, Sung Jin-woo never skipped a day.",
    "Kal ka excuse mat dena. Aaj kar. 20 minutes bhi kafi hai — pushups, squats, done.",
    "Yaar, ek baar mat chhod. Ek baar sab chhod deta hai. Aaj mat chhod.",
    "Listen — I skipped too. And then I skipped again. And again. Don't let it become a habit.",
]

WATER_RESPONSES = [
    "3L water daily — not optional. Kidney stones nahi chahiye na? Pee pale yellow. That's the goal.",
    "Bro, hydrated rahega toh hunger control better rahega, workout better hoga, skin better rahega. Simple.",
    "Water + sleep = free gains. Dono maximize karo.",
]

SLEEP_RESPONSES = [
    "7-8 hours sleep = more gains than any supplement. Recovery tab hoti hai jab so rahe hote ho.",
    "Bro, neend mein growth hormone release hota hai. Sleep is literally gains. So jao.",
    "Late night scrolling vs early morning gains. Choose karo.",
]

DEFAULT_RESPONSES = [
    "Yaar, I'm you from the future — fit, focused, and ready. Kuch bhi pooch.",
    "Bro, mujhe lagta hai tu sahi direction mein hai. Keep going. Koi specific sawaal?",
    "Future you is watching. Make him proud. Aur agar kuch specific poochna ho — bata.",
    "Hmm, interesting. Mujhe aur context chahiye — kya ho raha hai exactly?",
]


def get_response(message: str) -> str:
    msg = message.lower()

    if any(w in msg for w in ['hello', 'hi', 'hey', 'namaste', 'start', 'begin']):
        return random.choice(GREETINGS)
    elif any(w in msg for w in ['skip', 'missed', 'miss', 'chhod', 'lazy']):
        return random.choice(WORKOUT_SKIP_RESPONSES)
    elif any(w in msg for w in ['workout', 'gym', 'exercise', 'training', 'dungeon', 'push', 'pull', 'leg']):
        return random.choice(FITNESS_RESPONSES)
    elif any(w in msg for w in ['eat', 'food', 'meal', 'diet', 'calories', 'protein', 'khana', 'kha', 'nutrition']):
        return random.choice(NUTRITION_RESPONSES)
    elif any(w in msg for w in ['weight', 'kg', 'fat', 'scale', 'heavy', 'slim', 'lean']):
        return random.choice(WEIGHT_RESPONSES)
    elif any(w in msg for w in ['water', 'hydrat', 'paani', 'drink']):
        return random.choice(WATER_RESPONSES)
    elif any(w in msg for w in ['sleep', 'rest', 'recover', 'neend', 'so ']):
        return random.choice(SLEEP_RESPONSES)
    elif any(w in msg for w in ['motivat', 'inspire', 'sad', 'demotivat', 'give up', 'quit', 'tired', 'thak']):
        return random.choice(MOTIVATION_RESPONSES)
    else:
        # Context-aware default
        try:
            player = Player.query.first()
            today_workout = Workout.query.filter_by(date=date.today(), completed=True).first()
            today_weight = WeightLog.query.filter_by(date=date.today()).first()

            if not today_workout and not today_weight:
                return "Bro, tune aaj na workout log kiya, na weight. Chalo shuru karte hain — ek kaam karo abhi."
            elif not today_workout:
                return "Weight log ho gayi — acha! Ab workout? Dungeon wait kar raha hai."
            elif not today_weight:
                return "Workout done — respect! Weight log karna baaki hai. 10 seconds ka kaam."
        except:
            pass
        return random.choice(DEFAULT_RESPONSES)


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

    # Generate response
    response_text = get_response(user_message)

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
