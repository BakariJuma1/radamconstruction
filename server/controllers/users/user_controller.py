from flask import request
from flask_jwt_extended import get_jwt_identity, jwt_required
from flask_restful import Api, Resource

from server.extension import db
from server.models import User

from . import users_bp

api = Api(users_bp)


def _normalize_email(email):
    return (email or "").strip().lower()


class UserListResource(Resource):
    @jwt_required()
    def get(self):
        users = User.query.order_by(User.username.asc()).all()
        return [user.to_dict() for user in users], 200

    @jwt_required()
    def post(self):
        data = request.get_json() or {}
        username = (data.get("username") or "").strip()
        email = _normalize_email(data.get("email"))
        password = data.get("password") or ""

        if not username:
            return {"error": "Name is required"}, 400
        if not email:
            return {"error": "Email is required"}, 400
        if len(password) < 8:
            return {"error": "Password must be at least 8 characters"}, 400
        if User.query.filter_by(email=email).first():
            return {"error": "A team member with that email already exists"}, 400

        user = User(username=username, email=email)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()

        return user.to_dict(), 201


class UserResource(Resource):
    @jwt_required()
    def put(self, user_id):
        current_user_id = get_jwt_identity()
        user = User.query.get_or_404(user_id)
        data = request.get_json() or {}

        username = (data.get("username") or "").strip()
        email = _normalize_email(data.get("email"))
        password = data.get("password") or ""

        if not username:
            return {"error": "Name is required"}, 400
        if not email:
            return {"error": "Email is required"}, 400

        existing_user = User.query.filter(User.email == email, User.id != user_id).first()
        if existing_user:
            return {"error": "A team member with that email already exists"}, 400

        user.username = username
        user.email = email

        if password:
            if current_user_id != user_id:
                return {"error": "You can only change your own password"}, 403
            if len(password) < 8:
                return {"error": "Password must be at least 8 characters"}, 400
            user.set_password(password)

        db.session.commit()
        return user.to_dict(), 200

    @jwt_required()
    def delete(self, user_id):
        current_user_id = get_jwt_identity()
        user = User.query.get_or_404(user_id)

        if user.id == current_user_id:
            return {"error": "You cannot delete the account you are currently using"}, 400

        if User.query.count() <= 1:
            return {"error": "At least one team member must remain in the system"}, 400

        db.session.delete(user)
        db.session.commit()
        return {"message": "Team member removed"}, 200


api.add_resource(UserListResource, "/users")
api.add_resource(UserResource, "/users/<int:user_id>")
