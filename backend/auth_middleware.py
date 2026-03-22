from flask import request, jsonify
import jwt
import os
from models import User

SECRET_KEY = os.environ.get('SECRET_KEY', 'solo-leveling-secret-key')

def check_jwt():
    # Only protect /api routes, exclude /api/auth
    if request.path.startswith('/api') and not request.path.startswith('/api/auth'):
        # Allow preflight CORS
        if request.method == 'OPTIONS':
            return
            
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Missing or invalid token'}), 401
            
        token = auth_header.split(" ")[1]
        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            user = User.query.get(data['user_id'])
            if not user:
                return jsonify({'error': 'User not found'}), 401
            # Optionally attach user to request object
            request.user = user
        except Exception as e:
            return jsonify({'error': 'Invalid token', 'message': str(e)}), 401
