from flask import Blueprint, jsonify, request
from models import db, MealLog, get_ist_date
import json
import os

diet_bp = Blueprint('diet', __name__)

@diet_bp.route('/diet', methods=['GET'])
def get_meals():
    date_str = request.args.get('date')
    if date_str:
        from datetime import datetime
        target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
    else:
        target_date = get_ist_date()

    meals = MealLog.query.filter_by(user_id=request.user.id, date=target_date).all()
    
    totals = {
        'calories': sum(m.calories for m in meals),
        'protein': sum(m.protein for m in meals),
        'carbs': sum(m.carbs for m in meals),
        'fat': sum(m.fat for m in meals)
    }
    
    return jsonify({
        'meals': [m.to_dict() for m in meals],
        'totals': totals,
        'goal_calories': 1800
    })

@diet_bp.route('/diet', methods=['POST'])
def log_meal():
    data = request.json
    meal = MealLog(
        user_id=request.user.id,
        food_name=data['food_name'],
        calories=data.get('calories', 0),
        protein=data.get('protein', 0),
        carbs=data.get('carbs', 0),
        fat=data.get('fat', 0),
        quantity=data.get('quantity', 1),
        unit=data.get('unit', 'serving'),
        meal_type=data.get('meal_type', 'lunch'),
        date=get_ist_date()
    )
    db.session.add(meal)
    db.session.commit()
    
    from routes.player import award_xp
    xp_result = award_xp(5, request.user.id)
    
    return jsonify({**meal.to_dict(), 'xp_result': xp_result}), 201

@diet_bp.route('/diet/<int:meal_id>', methods=['DELETE'])
def delete_meal(meal_id):
    meal = MealLog.query.filter_by(id=meal_id, user_id=request.user.id).first_or_404()
    db.session.delete(meal)
    db.session.commit()
    return jsonify({'message': 'Deleted'})

@diet_bp.route('/diet/foods', methods=['GET'])
def search_foods():
    query = request.args.get('q', '').lower()
    base_dir = os.path.abspath(os.path.dirname(__file__))
    json_path = os.path.join(base_dir, '..', 'data', 'foods.json')
    try:
        with open(json_path, 'r') as f:
            foods = json.load(f)
            if query:
                foods = [food for food in foods if query in food['name'].lower()]
            return jsonify(foods[:10])
    except:
        return jsonify([])
