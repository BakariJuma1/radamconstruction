from flask import request
from flask_restful import Resource,Api
from flask_jwt_extended import jwt_required
from server.extension import db
from server.models import Service, Booking, User
from server.service.notification_service import send_new_booking_notification
from . import booking_bp

api = Api(booking_bp)
class BookingListResource(Resource):
    @jwt_required()
    def get(self):
        bookings = Booking.query.all()
        return [b.to_dict(rules=("-service.bookings",)) for b in bookings], 200

    def post(self):
        data = request.get_json()
        service_id = data.get("service_id")
        service = Service.query.get(service_id) if service_id else None

        booking = Booking(
            name=data.get("name"),
            phone=data.get("phone"),
            email=data.get("email"),
            message=data.get("message"),
            service_id=service.id if service else None
        )
        db.session.add(booking)
        db.session.commit()

        try:
            send_new_booking_notification(booking)
        except RuntimeError as error:
            print(f"Booking notification skipped: {error}")
        except Exception as error:
            print(f"Booking notification failed: {error}")

        return booking.to_dict(rules=("-service.bookings",)), 201


class BookingResource(Resource):
    @jwt_required()
    def get(self, booking_id):
        booking = Booking.query.get_or_404(booking_id)
        return booking.to_dict(rules=("-service.bookings",)), 200

    @jwt_required()
    def put(self, booking_id):
        booking = Booking.query.get_or_404(booking_id)
        data = request.get_json() or {}

        if "status" in data:
            booking.status = data["status"]
        if "is_read" in data:
            booking.is_read = bool(data["is_read"])
        if "assigned_user_id" in data:
            assigned_user_id = data["assigned_user_id"]
            booking.assigned_user = (
                User.query.get_or_404(assigned_user_id)
                if assigned_user_id not in (None, "", 0)
                else None
            )

        db.session.commit()
        return booking.to_dict(rules=("-service.bookings",)), 200

    @jwt_required()
    def delete(self, booking_id):
        booking = Booking.query.get_or_404(booking_id)
        db.session.delete(booking)
        db.session.commit()
        return {"message": "Booking deleted"}, 200

api.add_resource(BookingListResource,'/bookings')
api.add_resource(BookingResource,'/bookings/<int:booking_id>')
