from flask import Blueprint, jsonify, request
from models import db, Player, get_ist_date
from datetime import timedelta

player_bp = Blueprint('player', __name__)

RANK_THRESHOLDS = {'E': 0, 'D': 10, 'C': 25, 'B': 50, 'A': 100, 'S': 200}

def get_rank(level):
    rank = 'E'
    for r, threshold in RANK_THRESHOLDS.items():
        if level >= threshold:
            rank = r
    return rank

def award_xp(amount, user_id):
    player = Player.query.filter_by(user_id=user_id).first()
    if not player:
        return None
    player.xp += amount
    player.total_xp += amount
    new_level = 1 + (player.total_xp // 100)
    leveled_up = new_level > player.level
    player.level = new_level
    player.rank = get_rank(player.level)
    db.session.commit()
    return {'player': player.to_dict(), 'leveled_up': leveled_up, 'xp_gained': amount}

@player_bp.route('/player', methods=['GET'])
def get_player():
    player = Player.query.filter_by(user_id=request.user.id).first()
    if not player:
        return jsonify({'error': 'Player not found'}), 404
    return jsonify(player.to_dict())

@player_bp.route('/player', methods=['PUT'])
def update_player():
    player = Player.query.filter_by(user_id=request.user.id).first()
    data = request.json
    if 'name' in data:
        player.name = data['name']
    if 'goal_weight' in data:
        player.goal_weight = data['goal_weight']
    db.session.commit()
    return jsonify(player.to_dict())

@player_bp.route('/player/streak', methods=['POST'])
def update_streak():
    player = Player.query.filter_by(user_id=request.user.id).first()
    today = get_ist_date()
    if player.last_active != today:
        if player.last_active == today - timedelta(days=1):
            player.streak += 1
        else:
            player.streak = 1
        player.last_active = today
        db.session.commit()
    return jsonify(player.to_dict())

@player_bp.route('/player/stats', methods=['GET'])
def get_stats():
    from models import Workout, MealLog
    player = Player.query.filter_by(user_id=request.user.id).first()
    str_stat = Workout.query.filter_by(user_id=request.user.id, completed=True).count()
    vit_stat = db.session.query(MealLog.date).filter_by(user_id=request.user.id).distinct().count()
    end_stat = player.streak
    int_stat = player.total_xp // 10
    return jsonify({
        'STR': min(str_stat, 999),
        'VIT': min(vit_stat, 999),
        'END': min(end_stat, 999),
        'INT': min(int_stat, 999),
    })
