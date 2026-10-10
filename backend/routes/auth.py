from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime
from models import db, User, Player
from config import SECRET_KEY

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/auth/register', methods=['POST'])
def register():
    data = request.json
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'message': 'Missing username or password'}), 400
    
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'message': 'User already exists'}), 400
        
    hashed_password = generate_password_hash(data['password'])
    new_user = User(username=data['username'], password_hash=hashed_password)
    db.session.add(new_user)
    db.session.flush()
    
    player_name = (data.get('player_name') or data['username']).strip()[:100]
    new_player = Player(user_id=new_user.id, name=player_name or data['username'], streak=0, level=1, xp=0, total_xp=0, rank='E')
    db.session.add(new_player)
    db.session.commit()
    
    return jsonify({'message': 'Registered successfully', 'username': new_user.username, 'player_name': new_player.name}), 201

@auth_bp.route('/auth/login', methods=['POST'])
def login():
    data = request.json
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'message': 'Missing credentials'}), 400
        
    user = User.query.filter_by(username=data['username']).first()
    if not user or not check_password_hash(user.password_hash, data['password']):
        return jsonify({'message': 'Invalid credentials'}), 401
        
    token = jwt.encode({
        'user_id': user.id,
        'exp': datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=7)
    }, SECRET_KEY, algorithm='HS256')
    return jsonify({'token': token, 'username': user.username, 'player_name': user.player.name if user.player else user.username})
