from flask import Blueprint, jsonify, request
from models import db, Quest, Player
from datetime import date, timedelta

quest_bp = Blueprint('quest', __name__)

DAILY_QUEST_TEMPLATES = [
    {'title': 'Log Your Weight', 'description': 'Track your daily weight. Every data point matters.', 'xp_reward': 10, 'icon': '⚖️', 'type_key': 'log_weight'},
    {'title': 'Complete a Workout', 'description': 'Enter the dungeon. Clear it.', 'xp_reward': 50, 'icon': '⚔️', 'type_key': 'complete_workout'},
    {'title': 'Log Your Meals', 'description': 'What you eat is what you become.', 'xp_reward': 15, 'icon': '🍱', 'type_key': 'log_meal'},
    {'title': 'Stay Under Calorie Limit', 'description': f'Stay under your daily calorie goal.', 'xp_reward': 25, 'icon': '🔥', 'type_key': 'calorie_goal'},
    {'title': 'Drink 3L Water', 'description': 'Hydration is the foundation of power.', 'xp_reward': 20, 'icon': '💧', 'type_key': 'water'},
]

WEEKLY_BOSS_QUESTS = [
    {'title': '5-Day Workout Streak', 'description': 'Clear 5 dungeons in a week. Prove your resolve.', 'xp_reward': 200, 'icon': '👑'},
    {'title': 'Lose 0.5kg This Week', 'description': 'Every boss fight starts with a small victory.', 'xp_reward': 150, 'icon': '🏆'},
    {'title': 'Log Every Meal for 7 Days', 'description': 'Consistency is power. Track all 7 days.', 'xp_reward': 175, 'icon': '📋'},
    {'title': 'Hit Protein Goal 5 Days', 'description': 'Muscle grows from the inside. Feed it.', 'xp_reward': 125, 'icon': '💪'},
]


def generate_daily_quests():
    today = date.today()
    existing = Quest.query.filter_by(date=today, quest_type='daily').count()
    if existing > 0:
        return

    for template in DAILY_QUEST_TEMPLATES:
        quest = Quest(
            title=template['title'],
            description=template['description'],
            xp_reward=template['xp_reward'],
            quest_type='daily',
            icon=template['icon'],
            date=today,
            completed=False,
        )
        db.session.add(quest)
    db.session.commit()


def generate_weekly_boss():
    today = date.today()
    # Get start of week (Monday)
    week_start = today - timedelta(days=today.weekday())
    existing = Quest.query.filter_by(date=week_start, quest_type='boss').count()
    if existing > 0:
        return

    import random
    boss = random.choice(WEEKLY_BOSS_QUESTS)
    quest = Quest(
        title=boss['title'],
        description=boss['description'],
        xp_reward=boss['xp_reward'],
        quest_type='boss',
        icon=boss['icon'],
        date=week_start,
        completed=False,
    )
    db.session.add(quest)
    db.session.commit()


def complete_quest_by_type(type_key):
    today = date.today()
    for template in DAILY_QUEST_TEMPLATES:
        if template['type_key'] == type_key:
            quest = Quest.query.filter_by(
                date=today,
                title=template['title'],
                completed=False,
            ).first()
            if quest:
                quest.completed = True
                db.session.commit()

                # Award XP
                from routes.player import award_xp
                award_xp(quest.xp_reward)
            break


@quest_bp.route('/quest', methods=['GET'])
def get_quests():
    generate_daily_quests()
    generate_weekly_boss()

    today = date.today()
    week_start = today - timedelta(days=today.weekday())

    daily_quests = Quest.query.filter_by(date=today, quest_type='daily').all()
    boss_quests = Quest.query.filter_by(date=week_start, quest_type='boss').all()

    completed_daily = sum(1 for q in daily_quests if q.completed)
    total_daily = len(daily_quests)

    return jsonify({
        'daily': [q.to_dict() for q in daily_quests],
        'boss': [q.to_dict() for q in boss_quests],
        'progress': {
            'completed': completed_daily,
            'total': total_daily,
            'percentage': (completed_daily / total_daily * 100) if total_daily > 0 else 0,
        }
    })


@quest_bp.route('/quest/<int:quest_id>/complete', methods=['POST'])
def complete_quest(quest_id):
    quest = Quest.query.get_or_404(quest_id)
    if quest.completed:
        return jsonify({'message': 'Quest already completed', 'quest': quest.to_dict()})

    quest.completed = True
    db.session.commit()

    from routes.player import award_xp
    xp_result = award_xp(quest.xp_reward)

    return jsonify({
        'quest': quest.to_dict(),
        'xp_result': xp_result,
        'message': f'Quest complete! +{quest.xp_reward} XP'
    })


@quest_bp.route('/quest/reset', methods=['POST'])
def reset_daily_quests():
    """Admin: force regenerate today's quests"""
    today = date.today()
    Quest.query.filter_by(date=today, quest_type='daily').delete()
    db.session.commit()
    generate_daily_quests()
    quests = Quest.query.filter_by(date=today, quest_type='daily').all()
    return jsonify([q.to_dict() for q in quests])
