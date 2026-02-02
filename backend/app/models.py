from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from .db import Base

def gen_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = 'users'
    id = Column(String, primary_key=True, default=gen_uuid)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    age = Column(Integer)
    gender = Column(String)
    height_cm = Column(Float)
    weight_kg = Column(Float)
    goal = Column(String)
    activity_level = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

class BMILog(Base):
    __tablename__ = 'bmi_logs'
    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey('users.id'))
    weight = Column(Float)
    bmi = Column(Float)
    date = Column(DateTime, default=datetime.utcnow)

class Exercise(Base):
    __tablename__ = 'exercises'
    id = Column(String, primary_key=True, default=gen_uuid)
    name = Column(String, nullable=False)
    muscle_group = Column(String)
    equipment = Column(String)
    difficulty = Column(String)
    instructions = Column(Text)
    media_type = Column(String)
    media_url = Column(String)

class WorkoutLog(Base):
    __tablename__ = 'workout_logs'
    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey('users.id'))
    date = Column(DateTime, default=datetime.utcnow)
    duration = Column(Float)
    calories_burned = Column(Float)

class WorkoutLogItem(Base):
    __tablename__ = 'workout_log_items'
    id = Column(String, primary_key=True, default=gen_uuid)
    workout_log_id = Column(String, ForeignKey('workout_logs.id'))
    exercise_id = Column(String, ForeignKey('exercises.id'))
    sets = Column(Integer)
    reps = Column(Integer)
    weight = Column(Float)

class Food(Base):
    __tablename__ = 'foods'
    id = Column(String, primary_key=True, default=gen_uuid)
    name = Column(String, nullable=False, unique=True)
    calories_100g = Column(Float)
    protein_100g = Column(Float)
    carbs_100g = Column(Float)
    fat_100g = Column(Float)
    fiber_100g = Column(Float)
    sugar_100g = Column(Float)
    sodium_100g = Column(Float)

class FoodPortion(Base):
    __tablename__ = 'food_portions'
    id = Column(String, primary_key=True, default=gen_uuid)
    food_id = Column(String, ForeignKey('foods.id'))
    portion_name = Column(String)
    grams = Column(Float)

class FoodScanLog(Base):
    __tablename__ = 'food_scan_logs'
    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey('users.id'))
    image_url = Column(String)
    detected_foods_json = Column(Text)
    portion_json = Column(Text)
    total_calories = Column(Float)
    protein = Column(Float)
    carbs = Column(Float)
    fat = Column(Float)
    timestamp = Column(DateTime, default=datetime.utcnow)

class AIChat(Base):
    __tablename__ = 'ai_chats'
    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey('users.id'))
    role = Column(String)
    message = Column(Text)
    timestamp = Column(DateTime, default=datetime.utcnow)
