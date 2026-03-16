from flask import request
from flask_restful import Resource, Api
from flask_jwt_extended import jwt_required
from server.extension import db
from server.models import Contact
from server.service.notification_service import send_new_contact_notification
from . import contact_bp

api = Api(contact_bp)

class ContactListResource(Resource):
    @jwt_required()
    def get(self):
        contacts = Contact.query.order_by(Contact.created_at.desc()).all()
        return [c.to_dict() for c in contacts], 200

    def post(self):
        data = request.get_json()
        if not data.get("name") or not data.get("email") or not data.get("subject") or not data.get("message"):
            return {"error": "Missing required fields"}, 400

        contact = Contact(
            name=data.get("name"),
            email=data.get("email"),
            phone=data.get("phone"),
            subject=data.get("subject"),
            message=data.get("message")
        )
        db.session.add(contact)
        db.session.commit()

        try:
            send_new_contact_notification(contact)
        except RuntimeError as error:
            print(f"Contact notification skipped: {error}")
        except Exception as error:
            print(f"Contact notification failed: {error}")

        return contact.to_dict(), 201


class ContactResource(Resource):
    @jwt_required()
    def get(self, contact_id):
        contact = Contact.query.get_or_404(contact_id)
        return contact.to_dict(), 200

    @jwt_required()
    def put(self, contact_id):
        contact = Contact.query.get_or_404(contact_id)
        data = request.get_json() or {}

        if "is_read" in data:
            contact.is_read = bool(data["is_read"])

        db.session.commit()
        return contact.to_dict(), 200

    @jwt_required()
    def delete(self, contact_id):
        contact = Contact.query.get_or_404(contact_id)
        db.session.delete(contact)
        db.session.commit()
        return {"message": "Contact deleted"}, 200


# Register routes
api.add_resource(ContactListResource, "/contacts")
api.add_resource(ContactResource, "/contacts/<int:contact_id>")
