from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import db, models, schemas
import json
from typing import List

router = APIRouter(prefix='/food-scan', tags=['food-scan'])

# Simplified detection stub: in production integrate a proper vision model
DETECTION_CLASSES = [
    'rice', 'roti', 'paneer', 'chicken', 'egg', 'banana', 'apple', 'salad'
]

def mock_detect_foods(filename: str) -> List[str]:
    name = filename.lower()
    found = []
    for cls in DETECTION_CLASSES:
        if cls in name:
            found.append(cls)
    if not found:
        # default suggestion
        found = ['rice']
    return found

def calc_nutrition_for(food: dict, grams: float):
    factor = grams / 100.0
    return {
        'calories': (food.get('calories_100g') or 0) * factor,
        'protein': (food.get('protein_100g') or 0) * factor,
        'carbs': (food.get('carbs_100g') or 0) * factor,
        'fat': (food.get('fat_100g') or 0) * factor,
    }

@router.post('/upload')
def upload_image(file: UploadFile = File(...)):
    # For this scaffold we return a mock URL and detected items
    filename = file.filename.lower()
    image_url = f"https://storage.example.com/{filename}"
    detected = mock_detect_foods(filename)
    return {'image_url': image_url, 'detected': detected, 'note': 'AI-assisted nutritional estimation.'}

@router.post('/estimate')
def estimate(image_url: str, selections: dict = None, user_id: str = None, db: Session = Depends(db.get_db)):
    # selections: { 'rice': { 'portion': 'medium' , 'grams': 200}, ... }
    if not selections:
        raise HTTPException(400, 'Selections required: portion sizes or gram values')
    totals = {'calories': 0.0, 'protein': 0.0, 'carbs': 0.0, 'fat': 0.0}
    breakdown = []
    for name, sel in selections.items():
        grams = float(sel.get('grams', sel.get('count', 1) * 100))
        # lookup food
        f = db.query(models.Food).filter(models.Food.name.ilike(f"%{name}%")).first()
        if not f:
            # fallback to approximate mapping
            f = {
                'name': name,
                'calories_100g': 150,
                'protein_100g': 5,
                'carbs_100g': 20,
                'fat_100g': 6
            }
        else:
            f = {
                'name': f.name,
                'calories_100g': f.calories_100g,
                'protein_100g': f.protein_100g,
                'carbs_100g': f.carbs_100g,
                'fat_100g': f.fat_100g,
            }
        n = calc_nutrition_for(f, grams)
        totals['calories'] += n['calories']
        totals['protein'] += n['protein']
        totals['carbs'] += n['carbs']
        totals['fat'] += n['fat']
        breakdown.append({'name': name, 'grams': grams, **n})

    # save log
    log = models.FoodScanLog(user_id=user_id, image_url=image_url, detected_foods_json=json.dumps(list(selections.keys())), portion_json=json.dumps(selections), total_calories=totals['calories'], protein=totals['protein'], carbs=totals['carbs'], fat=totals['fat'])
    # Only save if DB session available
    try:
        db.add(log)
        db.commit()
    except Exception:
        db.rollback()

    return {'image_url': image_url, 'breakdown': breakdown, 'totals': totals, 'note': 'AI-assisted nutritional estimation.'}
