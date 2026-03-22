from flask import Blueprint, jsonify, request
from models import db, Quest, get_ist_date

quest_bp = Blueprint('quest', __name__)

def generate_daily_quests(user_id):
    today = get_ist_date()
    existing = Quest.query.filter_by(user_id=user_id, date=today).first()
    if not existing:
        quests = [
            Quest(user_id=user_id, title='Log Weight', description='Step on the scale', xp_reward=10, quest_type='log_weight', icon='⚖️'),
            Quest(user_id=user_id, title='Clear a Dungeon', description='Complete 1 workout', xp_reward=50, quest_type='workout', icon='⚔️'),
            Quest(user_id=user_id, title='Hydration', description='Drink 3L of water', xp_reward=15, quest_type='water', icon='💧')
        ]
        db.session.add_all(quests)
        db.session.commit()

def complete_quest_by_type(quest_type, user_id):
    today = get_ist_date()
    quest = Quest.query.filter_by(user_id=user_id, quest_type=quest_type, date=today, completed=False).first()
    if quest:
        quest.completed = True
        db.session.commit()
        from routes.player import award_xp
        return award_xp(quest.xp_reward, user_id)
    return None

@quest_bp.route('/quest', methods=['GET'])
def get_quests():
    generate_daily_quests(request.user.id)
    today = get_ist_date()
    quests = Quest.query.filter_by(user_id=request.user.id, date=today).all()
    return jsonify([q.to_dict() for q in quests])

@quest_bp.route('/quest/<int:quest_id>/complete', methods=['POST'])
def complete_quest(quest_id):
    quest = Quest.query.filter_by(id=quest_id, user_id=request.user.id).first_or_404()
    if not quest.completed:
        quest.completed = True
        db.session.commit()
        from routes.player import award_xp
        xp_result = award_xp(quest.xp_reward, request.user.id)
        return jsonify({'message': 'Quest completed', 'xp_result': xp_result})
    return jsonify({'message': 'Already completed'})
