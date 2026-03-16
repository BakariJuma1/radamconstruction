from flask_restful import Resource,Api
from flask import request
from server.models.user import User
from server.extension import db 
from flask_jwt_extended import create_access_token
from server.service.password_reset_service import (
    generate_reset_token,
    verify_reset_token,
    send_password_reset_email,
)
import os
from .import auth_bp

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
            return {
                "access_token": token,
                "user":user.id,
                "email":user.email,
                "name":user.username
                
                }, 200
        else:
            return {"error": "Invalid email or password"}, 401


class ForgotPassword(Resource):
    def post(self):
        data = request.get_json() or {}
        email = (data.get("email") or "").strip().lower()

        if not email:
            return {"error": "Email is required"}, 400

        user = User.query.filter_by(email=email).first()
        if user:
            frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173").rstrip("/")
            token = generate_reset_token(user.email)
            reset_url = f"{frontend_url}/reset-password?token={token}"
            try:
                send_password_reset_email(user.email, reset_url)
            except RuntimeError as error:
                return {"error": str(error)}, 500

        return {
            "message": "If an account exists for that email, a reset link has been sent."
        }, 200


class ResetPassword(Resource):
    def post(self):
        data = request.get_json() or {}
        token = data.get("token")
        password = data.get("password")
        confirm_password = data.get("confirm_password")

        if not token or not password or not confirm_password:
            return {"error": "Token, password, and confirmation are required"}, 400

        if password != confirm_password:
            return {"error": "Passwords do not match"}, 400

        if len(password) < 8:
            return {"error": "Password must be at least 8 characters"}, 400

        try:
            email = verify_reset_token(token)
        except ValueError as error:
            return {"error": str(error)}, 400

        user = User.query.filter_by(email=email).first()
        if not user:
            return {"error": "No account found for this reset link"}, 404

        user.set_password(password)
        db.session.commit()

        return {"message": "Password reset successfully"}, 200
        
api.add_resource(Login,'/login')
api.add_resource(ForgotPassword, '/forgot-password')
api.add_resource(ResetPassword, '/reset-password')
