from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import pytz

db = SQLAlchemy()

def get_ist_now():
    return datetime.now(pytz.timezone('Asia/Kolkata'))

def get_ist_date():
    return get_ist_now().date()

class User(db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=get_ist_now)
    player = db.relationship('Player', backref='user', uselist=False, cascade='all, delete-orphan')

class Player(db.Model):
    __tablename__ = 'player'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False, default='Player')
    level = db.Column(db.Integer, default=1)
    xp = db.Column(db.Integer, default=0)
    total_xp = db.Column(db.Integer, default=0)
    rank = db.Column(db.String(10), default='E')
    streak = db.Column(db.Integer, default=0)
    last_active = db.Column(db.Date, default=get_ist_date)
    goal_weight = db.Column(db.Float, default=70.0)
    created_at = db.Column(db.DateTime, default=get_ist_now)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'level': self.level,
            'xp': self.xp,
            'total_xp': self.total_xp,
            'rank': self.rank,
            'streak': self.streak,
            'last_active': self.last_active.isoformat() if self.last_active else None,
            'goal_weight': self.goal_weight,
            'xp_to_next_level': 100 - (self.xp % 100),
            'xp_progress': self.xp % 100,
        }

class WeightLog(db.Model):
    __tablename__ = 'weight_log'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    weight = db.Column(db.Float, nullable=False)
    date = db.Column(db.Date, default=get_ist_date, nullable=False)
    note = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=get_ist_now)

    def to_dict(self):
        return {
            'id': self.id,
            'weight': self.weight,
            'date': self.date.isoformat(),
            'note': self.note,
        }

class Workout(db.Model):
    __tablename__ = 'workout'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    name = db.Column(db.String(200), nullable=False)
    date = db.Column(db.Date, default=get_ist_date, nullable=False)
    duration_minutes = db.Column(db.Integer, default=0)
    xp_earned = db.Column(db.Integer, default=50)
    completed = db.Column(db.Boolean, default=False)
    notes = db.Column(db.String(500))
    created_at = db.Column(db.DateTime, default=get_ist_now)
    exercises = db.relationship('Exercise', backref='workout', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'date': self.date.isoformat(),
            'duration_minutes': self.duration_minutes,
            'xp_earned': self.xp_earned,
            'completed': self.completed,
            'notes': self.notes,
            'exercises': [e.to_dict() for e in self.exercises],
        }

class Exercise(db.Model):
    __tablename__ = 'exercise'
    id = db.Column(db.Integer, primary_key=True)
    workout_id = db.Column(db.Integer, db.ForeignKey('workout.id'), nullable=False)
    name = db.Column(db.String(200), nullable=False)
    sets = db.Column(db.Integer, default=3)
    reps = db.Column(db.Integer, default=10)
    weight_kg = db.Column(db.Float, default=0)
    created_at = db.Column(db.DateTime, default=get_ist_now)

    def to_dict(self):
        return {
            'id': self.id,
            'workout_id': self.workout_id,
            'name': self.name,
            'sets': self.sets,
            'reps': self.reps,
            'weight_kg': self.weight_kg,
        }

class MealLog(db.Model):
    __tablename__ = 'meal_log'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    food_name = db.Column(db.String(200), nullable=False)
    calories = db.Column(db.Integer, default=0)
    protein = db.Column(db.Float, default=0)
    carbs = db.Column(db.Float, default=0)
    fat = db.Column(db.Float, default=0)
    quantity = db.Column(db.Float, default=1.0)
    unit = db.Column(db.String(50), default='serving')
    meal_type = db.Column(db.String(50), default='lunch')
    date = db.Column(db.Date, default=get_ist_date, nullable=False)
    created_at = db.Column(db.DateTime, default=get_ist_now)

    def to_dict(self):
        return {
            'id': self.id,
            'food_name': self.food_name,
            'calories': self.calories,
            'protein': self.protein,
            'carbs': self.carbs,
            'fat': self.fat,
            'quantity': self.quantity,
            'unit': self.unit,
            'meal_type': self.meal_type,
            'date': self.date.isoformat(),
        }

class Quest(db.Model):
    __tablename__ = 'quest'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.String(500))
    xp_reward = db.Column(db.Integer, default=25)
    quest_type = db.Column(db.String(20), default='daily')
    completed = db.Column(db.Boolean, default=False)
    date = db.Column(db.Date, default=get_ist_date, nullable=False)
    icon = db.Column(db.String(50), default='⚔️')
    created_at = db.Column(db.DateTime, default=get_ist_now)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'xp_reward': self.xp_reward,
            'quest_type': self.quest_type,
            'completed': self.completed,
            'date': self.date.isoformat(),
            'icon': self.icon,
        }

class ChatMessage(db.Model):
    __tablename__ = 'chat_message'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    role = db.Column(db.String(20), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=get_ist_now)

    def to_dict(self):
        return {
            'id': self.id,
            'role': self.role,
            'content': self.content,
            'created_at': self.created_at.isoformat(),
        }
