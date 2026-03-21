from flask import Blueprint, jsonify, request
from models import db, WeightLog, Player
from datetime import date

weight_bp = Blueprint('weight', __name__)


@weight_bp.route('/weight', methods=['GET'])
def get_weight_logs():
    limit = request.args.get('limit', 30, type=int)
    logs = WeightLog.query.order_by(WeightLog.date.desc()).limit(limit).all()
    return jsonify([log.to_dict() for log in reversed(logs)])


@weight_bp.route('/weight/today', methods=['GET'])
def get_today_weight():
    today = date.today()
    log = WeightLog.query.filter_by(date=today).first()
    if not log:
        return jsonify(None)
    return jsonify(log.to_dict())


@weight_bp.route('/weight', methods=['POST'])
def log_weight():
    data = request.json
    today = date.today()

    existing = WeightLog.query.filter_by(date=today).first()
    if existing:
        existing.weight = data['weight']
        existing.note = data.get('note', '')
        db.session.commit()
        # Award XP for logging weight
        from routes.player import award_xp
        award_xp(10)
        return jsonify(existing.to_dict())

    log = WeightLog(
        weight=data['weight'],
        date=today,
        note=data.get('note', '')
    )
    db.session.add(log)
    db.session.commit()

    # Award XP for logging weight
    from routes.player import award_xp
    xp_result = award_xp(10)

    # Complete the weight quest
    from routes.quest import complete_quest_by_type
    complete_quest_by_type('log_weight')

    return jsonify({**log.to_dict(), 'xp_result': xp_result}), 201


@weight_bp.route('/weight/<int:log_id>', methods=['DELETE'])
def delete_weight_log(log_id):
    log = WeightLog.query.get_or_404(log_id)
    db.session.delete(log)
    db.session.commit()
    return jsonify({'message': 'Deleted'})


@weight_bp.route('/weight/milestones', methods=['GET'])
def get_milestones():
    player = Player.query.first()
    goal = player.goal_weight if player else 70.0

    logs = WeightLog.query.order_by(WeightLog.date.asc()).all()
    if not logs:
        return jsonify([])

    start_weight = logs[0].weight
    current_weight = logs[-1].weight
    total_to_lose = start_weight - goal

    milestones = []
    milestone_percentages = [10, 25, 50, 75, 90, 100]
    for pct in milestone_percentages:
        target = start_weight - (total_to_lose * pct / 100)
        achieved = current_weight <= target
        milestones.append({
            'percentage': pct,
            'target_weight': round(target, 1),
            'kg_lost': round(start_weight - target, 1),
            'achieved': achieved,
            'label': f'{pct}% of the way there'
        })

    return jsonify({
        'start_weight': start_weight,
        'current_weight': current_weight,
        'goal_weight': goal,
        'total_lost': round(start_weight - current_weight, 1),
        'remaining': round(current_weight - goal, 1),
        'milestones': milestones,
    })
