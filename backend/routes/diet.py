from flask import Blueprint, jsonify, request
from models import db, MealLog
from datetime import date
import json
import os

diet_bp = Blueprint('diet', __name__)

DAILY_CALORIE_GOAL = 1800


@diet_bp.route('/diet', methods=['GET'])
def get_meals():
    date_str = request.args.get('date', date.today().isoformat())
    meals = MealLog.query.filter_by(date=date_str).order_by(MealLog.created_at).all()
    
    total_calories = sum(m.calories for m in meals)
    total_protein = sum(m.protein for m in meals)
    total_carbs = sum(m.carbs for m in meals)
    total_fat = sum(m.fat for m in meals)

    return jsonify({
        'meals': [m.to_dict() for m in meals],
        'totals': {
            'calories': total_calories,
            'protein': round(total_protein, 1),
            'carbs': round(total_carbs, 1),
            'fat': round(total_fat, 1),
        },
        'goal_calories': DAILY_CALORIE_GOAL,
        'remaining_calories': DAILY_CALORIE_GOAL - total_calories,
    })


@diet_bp.route('/diet', methods=['POST'])
def log_meal():
    data = request.json
    meal = MealLog(
        food_name=data['food_name'],
        calories=data.get('calories', 0),
        protein=data.get('protein', 0),
        carbs=data.get('carbs', 0),
        fat=data.get('fat', 0),
        quantity=data.get('quantity', 1.0),
        unit=data.get('unit', 'serving'),
        meal_type=data.get('meal_type', 'lunch'),
        date=date.fromisoformat(data.get('date', date.today().isoformat())),
    )
    db.session.add(meal)
    db.session.commit()

    from routes.player import award_xp
    xp_result = award_xp(5)

    from routes.quest import complete_quest_by_type
    complete_quest_by_type('log_meal')

    # Check if under calorie limit
    today_meals = MealLog.query.filter_by(date=date.today()).all()
    total_cals = sum(m.calories for m in today_meals)
    if total_cals <= DAILY_CALORIE_GOAL:
        complete_quest_by_type('calorie_goal')

    return jsonify({**meal.to_dict(), 'xp_result': xp_result}), 201


@diet_bp.route('/diet/<int:meal_id>', methods=['DELETE'])
def delete_meal(meal_id):
    meal = MealLog.query.get_or_404(meal_id)
    db.session.delete(meal)
    db.session.commit()
    return jsonify({'message': 'Meal removed'})


@diet_bp.route('/diet/foods', methods=['GET'])
def get_foods():
    search = request.args.get('q', '').lower()
    data_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'foods.json')
    with open(data_path, 'r') as f:
        foods = json.load(f)
    
    if search:
        foods = [f for f in foods if search in f['name'].lower() or search in f.get('category', '').lower()]
    
    return jsonify(foods[:50])


@diet_bp.route('/diet/goal', methods=['PUT'])
def update_goal():
    global DAILY_CALORIE_GOAL
    data = request.json
    DAILY_CALORIE_GOAL = data.get('goal_calories', 1800)
    return jsonify({'goal_calories': DAILY_CALORIE_GOAL})


@diet_bp.route('/diet/history', methods=['GET'])
def get_diet_history():
    limit = request.args.get('limit', 7, type=int)
    from sqlalchemy import func
    results = db.session.query(
        MealLog.date,
        func.sum(MealLog.calories).label('total_calories'),
        func.sum(MealLog.protein).label('total_protein'),
        func.sum(MealLog.carbs).label('total_carbs'),
        func.sum(MealLog.fat).label('total_fat'),
    ).group_by(MealLog.date).order_by(MealLog.date.desc()).limit(limit).all()

    return jsonify([{
        'date': r.date.isoformat(),
        'calories': r.total_calories or 0,
        'protein': round(r.total_protein or 0, 1),
        'carbs': round(r.total_carbs or 0, 1),
        'fat': round(r.total_fat or 0, 1),
        'under_goal': (r.total_calories or 0) <= DAILY_CALORIE_GOAL,
    } for r in reversed(results)])
