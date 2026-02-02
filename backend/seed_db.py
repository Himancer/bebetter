#!/usr/bin/env python
"""
Seed database with foods and portions.
Run from backend/ directory: python seed_db.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from app.db import SessionLocal, engine
from app import models
from app.seed_data import FOODS_DATA, PORTIONS_DATA

def seed_db():
    # Create all tables first
    models.Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    # Clear existing (optional for dev)
    try:
        db.query(models.Food).delete()
        db.query(models.FoodPortion).delete()
    except Exception:
        pass  # Tables might not exist yet
    
    # Add foods
    for food_dict in FOODS_DATA:
        f = models.Food(**food_dict)
        db.add(f)
    
    db.commit()
    print(f"✓ Inserted {len(FOODS_DATA)} foods")
    
    # Add portions
    for portion_dict in PORTIONS_DATA:
        food_name = portion_dict.pop('food_name')
        food = db.query(models.Food).filter(models.Food.name == food_name).first()
        if food:
            p = models.FoodPortion(food_id=food.id, **portion_dict)
            db.add(p)
    
    db.commit()
    print(f"✓ Inserted {len(PORTIONS_DATA)} portions")
    db.close()
    print("✓ Database seeded successfully")

if __name__ == '__main__':
    seed_db()
