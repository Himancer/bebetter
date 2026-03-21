from flask import Flask
from flask_cors import CORS
from models import db
from routes.player import player_bp
from routes.weight import weight_bp
from routes.workout import workout_bp
from routes.diet import diet_bp
from routes.quest import quest_bp
from routes.chat import chat_bp
import os

def create_app():
    app = Flask(__name__)
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    base_dir = os.path.abspath(os.path.dirname(__file__))
    db_path = os.path.join(base_dir, 'bebetter.db')
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.init_app(app)

    # Register blueprints with /api prefix
    app.register_blueprint(player_bp, url_prefix='/api')
    app.register_blueprint(weight_bp, url_prefix='/api')
    app.register_blueprint(workout_bp, url_prefix='/api')
    app.register_blueprint(diet_bp, url_prefix='/api')
    app.register_blueprint(quest_bp, url_prefix='/api')
    app.register_blueprint(chat_bp, url_prefix='/api')

    with app.app_context():
        db.create_all()
        _seed_data()

    return app


def _seed_data():
    from models import Player, WeightLog, Quest
    from datetime import date, timedelta
    import random

    # Create player if not exists
    if not Player.query.first():
        player = Player(name='Himanshu', level=1, xp=0, total_xp=0, rank='E', streak=3, goal_weight=70.0)
        db.session.add(player)
        db.session.commit()

    # Seed weight history (last 30 days)
    if WeightLog.query.count() == 0:
        start_weight = 89.0
        current_weight = start_weight
        for i in range(29, -1, -1):
            log_date = date.today() - timedelta(days=i)
            # Gradual decline with noise
            if i > 0:
                change = random.uniform(-0.3, 0.1)
                current_weight = max(70.0, current_weight + change)
                # General downward trend
                current_weight -= 0.05
            else:
                current_weight = 87.2  # current weight
            
            log = WeightLog(
                weight=round(current_weight, 1),
                date=log_date,
                note=''
            )
            db.session.add(log)
        db.session.commit()

    print("✅ Database seeded successfully")


if __name__ == '__main__':
    app = create_app()
    print("🎮 beBetter Backend starting on http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)
