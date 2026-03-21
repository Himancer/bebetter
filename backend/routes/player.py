from flask import Blueprint, jsonify, request
from models import db, Player
from datetime import date

player_bp = Blueprint('player', __name__)

RANK_THRESHOLDS = {
    'E': 0,
    'D': 10,
    'C': 25,
    'B': 50,
    'A': 100,
    'S': 200,
}

def get_rank(level):
    rank = 'E'
    for r, threshold in RANK_THRESHOLDS.items():
        if level >= threshold:
            rank = r
    return rank


def award_xp(amount):
    player = Player.query.first()
    if not player:
        return None
    player.xp += amount
    player.total_xp += amount
    # Level up every 100 XP
    new_level = 1 + (player.total_xp // 100)
    leveled_up = new_level > player.level
    player.level = new_level
    player.rank = get_rank(player.level)
    db.session.commit()
    return {'player': player.to_dict(), 'leveled_up': leveled_up, 'xp_gained': amount}


@player_bp.route('/player', methods=['GET'])
def get_player():
    player = Player.query.first()
    if not player:
        player = Player(name='Himanshu')
        db.session.add(player)
        db.session.commit()
    return jsonify(player.to_dict())


@player_bp.route('/player', methods=['PUT'])
def update_player():
    player = Player.query.first()
    if not player:
        player = Player()
        db.session.add(player)
    data = request.json
    if 'name' in data:
        player.name = data['name']
    if 'goal_weight' in data:
        player.goal_weight = data['goal_weight']
    db.session.commit()
    return jsonify(player.to_dict())


@player_bp.route('/player/streak', methods=['POST'])
def update_streak():
    player = Player.query.first()
    if not player:
        return jsonify({'error': 'Player not found'}), 404
    today = date.today()
    if player.last_active != today:
        from datetime import timedelta
        if player.last_active == today - timedelta(days=1):
            player.streak += 1
        else:
            player.streak = 1
        player.last_active = today
        db.session.commit()
    return jsonify(player.to_dict())


@player_bp.route('/player/stats', methods=['GET'])
def get_stats():
    from models import Workout, MealLog, WeightLog
    from datetime import timedelta
    player = Player.query.first()
    if not player:
        return jsonify({'error': 'Player not found'}), 404

    # STR: total workouts completed
    str_stat = Workout.query.filter_by(completed=True).count()
    # VIT: days with diet logged
    vit_stat = db.session.query(MealLog.date).distinct().count()
    # END: streak
    end_stat = player.streak
    # INT: total XP / 10
    int_stat = player.total_xp // 10

    return jsonify({
        'STR': min(str_stat, 999),
        'VIT': min(vit_stat, 999),
        'END': min(end_stat, 999),
        'INT': min(int_stat, 999),
    })
