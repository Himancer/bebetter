from flask import Blueprint, jsonify, request
from models import db, Workout, Exercise, get_ist_date

workout_bp = Blueprint('workout', __name__)

@workout_bp.route('/workout', methods=['GET'])
def get_workouts():
    limit = request.args.get('limit', 20, type=int)
    workouts = Workout.query.filter_by(user_id=request.user.id).order_by(Workout.date.desc(), Workout.id.desc()).limit(limit).all()
    return jsonify([w.to_dict() for w in workouts])

@workout_bp.route('/workout', methods=['POST'])
def create_workout():
    data = request.json
    workout = Workout(
        user_id=request.user.id,
        name=data['name'],
        date=get_ist_date(),
        duration_minutes=data.get('duration_minutes', 0),
        notes=data.get('notes', '')
    )
    db.session.add(workout)
    db.session.flush()

    if 'exercises' in data:
        for ex_data in data['exercises']:
            ex = Exercise(
                workout_id=workout.id,
                name=ex_data['name'],
                sets=ex_data.get('sets', 3),
                reps=ex_data.get('reps', 10),
                weight_kg=ex_data.get('weight_kg', 0)
            )
            db.session.add(ex)

    db.session.commit()
    return jsonify(workout.to_dict()), 201

@workout_bp.route('/workout/<int:workout_id>', methods=['PUT'])
def update_workout(workout_id):
    workout = Workout.query.filter_by(id=workout_id, user_id=request.user.id).first_or_404()
    data = request.json
    
    if 'completed' in data and data['completed'] and not workout.completed:
        workout.completed = True
        from routes.player import award_xp
        xp_result = award_xp(workout.xp_earned, request.user.id)
        from routes.quest import complete_quest_by_type
        complete_quest_by_type('workout', request.user.id)
    
    if 'duration_minutes' in data:
        workout.duration_minutes = data['duration_minutes']
        
    db.session.commit()
    result = workout.to_dict()
    if 'xp_result' in locals():
        result['xp_result'] = xp_result
    return jsonify(result)

@workout_bp.route('/workout/<int:workout_id>', methods=['DELETE'])
def delete_workout(workout_id):
    workout = Workout.query.filter_by(id=workout_id, user_id=request.user.id).first_or_404()
    db.session.delete(workout)
    db.session.commit()
    return jsonify({'message': 'Deleted'})

@workout_bp.route('/workout/templates', methods=['GET'])
def get_templates():
    return jsonify([
        {'name': 'Push Day', 'exercises': [{'name': 'Bench Press', 'sets': 3, 'reps': 10}, {'name': 'Overhead Press', 'sets': 3, 'reps': 10}]},
        {'name': 'Pull Day', 'exercises': [{'name': 'Pullups', 'sets': 3, 'reps': 8}, {'name': 'Barbell Row', 'sets': 3, 'reps': 10}]},
        {'name': 'Leg Day', 'exercises': [{'name': 'Squats', 'sets': 3, 'reps': 8}, {'name': 'Leg Press', 'sets': 3, 'reps': 12}]}
    ])
