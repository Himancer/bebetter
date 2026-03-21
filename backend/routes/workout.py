from flask import Blueprint, jsonify, request
from models import db, Workout, Exercise
from datetime import date

workout_bp = Blueprint('workout', __name__)

WORKOUT_TEMPLATES = [
    {
        'name': 'Push Day — Chest & Triceps',
        'exercises': [
            {'name': 'Bench Press', 'sets': 4, 'reps': 8, 'weight_kg': 60},
            {'name': 'Incline Dumbbell Press', 'sets': 3, 'reps': 10, 'weight_kg': 20},
            {'name': 'Cable Flyes', 'sets': 3, 'reps': 12, 'weight_kg': 15},
            {'name': 'Tricep Pushdown', 'sets': 3, 'reps': 12, 'weight_kg': 20},
            {'name': 'Overhead Tricep Extension', 'sets': 3, 'reps': 10, 'weight_kg': 15},
        ]
    },
    {
        'name': 'Pull Day — Back & Biceps',
        'exercises': [
            {'name': 'Pull-ups', 'sets': 4, 'reps': 8, 'weight_kg': 0},
            {'name': 'Barbell Row', 'sets': 4, 'reps': 8, 'weight_kg': 60},
            {'name': 'Lat Pulldown', 'sets': 3, 'reps': 10, 'weight_kg': 50},
            {'name': 'Dumbbell Curl', 'sets': 3, 'reps': 12, 'weight_kg': 15},
            {'name': 'Hammer Curl', 'sets': 3, 'reps': 10, 'weight_kg': 12},
        ]
    },
    {
        'name': 'Leg Day — Quads & Hamstrings',
        'exercises': [
            {'name': 'Squat', 'sets': 4, 'reps': 8, 'weight_kg': 80},
            {'name': 'Romanian Deadlift', 'sets': 3, 'reps': 10, 'weight_kg': 70},
            {'name': 'Leg Press', 'sets': 3, 'reps': 12, 'weight_kg': 100},
            {'name': 'Leg Curl', 'sets': 3, 'reps': 12, 'weight_kg': 40},
            {'name': 'Calf Raises', 'sets': 4, 'reps': 15, 'weight_kg': 60},
        ]
    },
    {
        'name': 'Full Body HIIT',
        'exercises': [
            {'name': 'Burpees', 'sets': 3, 'reps': 15, 'weight_kg': 0},
            {'name': 'Mountain Climbers', 'sets': 3, 'reps': 20, 'weight_kg': 0},
            {'name': 'Jump Squats', 'sets': 3, 'reps': 15, 'weight_kg': 0},
            {'name': 'Push-ups', 'sets': 3, 'reps': 20, 'weight_kg': 0},
            {'name': 'Plank', 'sets': 3, 'reps': 60, 'weight_kg': 0},
        ]
    },
    {
        'name': 'Shoulder & Core',
        'exercises': [
            {'name': 'Overhead Press', 'sets': 4, 'reps': 8, 'weight_kg': 40},
            {'name': 'Lateral Raises', 'sets': 3, 'reps': 15, 'weight_kg': 10},
            {'name': 'Face Pulls', 'sets': 3, 'reps': 15, 'weight_kg': 20},
            {'name': 'Ab Wheel Rollout', 'sets': 3, 'reps': 10, 'weight_kg': 0},
            {'name': 'Russian Twists', 'sets': 3, 'reps': 20, 'weight_kg': 5},
        ]
    },
]


@workout_bp.route('/workout/templates', methods=['GET'])
def get_templates():
    return jsonify(WORKOUT_TEMPLATES)


@workout_bp.route('/workout', methods=['GET'])
def get_workouts():
    limit = request.args.get('limit', 20, type=int)
    date_filter = request.args.get('date')
    query = Workout.query
    if date_filter:
        query = query.filter_by(date=date_filter)
    workouts = query.order_by(Workout.date.desc()).limit(limit).all()
    return jsonify([w.to_dict() for w in workouts])


@workout_bp.route('/workout/today', methods=['GET'])
def get_today_workouts():
    today = date.today()
    workouts = Workout.query.filter_by(date=today).all()
    return jsonify([w.to_dict() for w in workouts])


@workout_bp.route('/workout', methods=['POST'])
def create_workout():
    data = request.json
    workout = Workout(
        name=data['name'],
        date=date.fromisoformat(data.get('date', date.today().isoformat())),
        duration_minutes=data.get('duration_minutes', 0),
        notes=data.get('notes', ''),
        completed=data.get('completed', False),
    )
    db.session.add(workout)
    db.session.flush()

    exercises_data = data.get('exercises', [])
    for ex_data in exercises_data:
        exercise = Exercise(
            workout_id=workout.id,
            name=ex_data['name'],
            sets=ex_data.get('sets', 3),
            reps=ex_data.get('reps', 10),
            weight_kg=ex_data.get('weight_kg', 0),
        )
        db.session.add(exercise)

    db.session.commit()
    return jsonify(workout.to_dict()), 201


@workout_bp.route('/workout/<int:workout_id>', methods=['PUT'])
def update_workout(workout_id):
    workout = Workout.query.get_or_404(workout_id)
    data = request.json
    xp_result = None

    if 'completed' in data and data['completed'] and not workout.completed:
        workout.completed = True
        # Calculate XP based on exercises and duration
        base_xp = 50
        exercise_bonus = len(workout.exercises) * 5
        duration_bonus = (workout.duration_minutes or 0) // 10 * 5
        total_xp = base_xp + exercise_bonus + duration_bonus
        workout.xp_earned = total_xp

        from routes.player import award_xp
        xp_result = award_xp(total_xp)

        from routes.quest import complete_quest_by_type
        complete_quest_by_type('complete_workout')

    if 'name' in data:
        workout.name = data['name']
    if 'duration_minutes' in data:
        workout.duration_minutes = data['duration_minutes']
    if 'notes' in data:
        workout.notes = data['notes']

    db.session.commit()
    result = workout.to_dict()
    if xp_result:
        result['xp_result'] = xp_result
    return jsonify(result)


@workout_bp.route('/workout/<int:workout_id>', methods=['DELETE'])
def delete_workout(workout_id):
    workout = Workout.query.get_or_404(workout_id)
    db.session.delete(workout)
    db.session.commit()
    return jsonify({'message': 'Dungeon abandoned'})


@workout_bp.route('/workout/<int:workout_id>/exercise', methods=['POST'])
def add_exercise(workout_id):
    workout = Workout.query.get_or_404(workout_id)
    data = request.json
    exercise = Exercise(
        workout_id=workout_id,
        name=data['name'],
        sets=data.get('sets', 3),
        reps=data.get('reps', 10),
        weight_kg=data.get('weight_kg', 0),
    )
    db.session.add(exercise)
    db.session.commit()
    return jsonify(exercise.to_dict()), 201


@workout_bp.route('/workout/exercise/<int:exercise_id>', methods=['DELETE'])
def delete_exercise(exercise_id):
    exercise = Exercise.query.get_or_404(exercise_id)
    db.session.delete(exercise)
    db.session.commit()
    return jsonify({'message': 'Exercise removed'})
