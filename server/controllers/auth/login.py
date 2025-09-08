from flask_restful import Resource,Api
from flask import request,jsonify
from server.models.user import User
from server.extension import db 
from flask_jwt_extended import create_access_token
from . import auth_bp

api=Api(auth_bp)

class Login(Resource):
    def post(self):
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            return {"error": "Email and password are required"}, 400

        user = User.query.filter_by(email=email).first()
        if user and user.check_password(password):
            token = create_access_token(identity=user.id)
            return {"access_token": token}, 200
        else:
            return {"error": "Invalid email or password"}, 401
        
api.add_resource(Login,'/login')
        
