from flask import Flask, request
from flask_cors import CORS
from models import db
from routes.player import player_bp
from routes.weight import weight_bp
from routes.workout import workout_bp
from routes.diet import diet_bp
from routes.quest import quest_bp
from routes.chat import chat_bp
from routes.auth import auth_bp
from auth_middleware import check_jwt
import os

def create_app():
    app = Flask(__name__, static_folder='../frontend/dist', static_url_path='/')
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    db_url = os.environ.get('DATABASE_URL')
    if db_url:
        if db_url.startswith("postgres://"):
            db_url = db_url.replace("postgres://", "postgresql://", 1)
        app.config['SQLALCHEMY_DATABASE_URI'] = db_url
    else:
        base_dir = os.path.abspath(os.path.dirname(__file__))
        db_path = os.path.join(base_dir, 'bebetter.db')
        app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
        
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.init_app(app)

    app.register_blueprint(player_bp, url_prefix='/api')
    app.register_blueprint(weight_bp, url_prefix='/api')
    app.register_blueprint(workout_bp, url_prefix='/api')
    app.register_blueprint(diet_bp, url_prefix='/api')
    app.register_blueprint(quest_bp, url_prefix='/api')
    app.register_blueprint(chat_bp, url_prefix='/api')
    app.register_blueprint(auth_bp, url_prefix='/api')

    app.before_request(check_jwt)

    with app.app_context():
        db.create_all()

    @app.route('/')
    def serve_index():
        return app.send_static_file('index.html')

    @app.errorhandler(404)
    def not_found(e):
        if not request.path.startswith('/api'):
            return app.send_static_file('index.html')
        return {'error': 'Not found'}, 404

    return app

app = create_app()

if __name__ == '__main__':
    print("🎮 beBetter Backend starting on http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)
