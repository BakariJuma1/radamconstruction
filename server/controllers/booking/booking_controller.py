from flask import request
from flask_restful import Resource,Api
from flask_jwt_extended import jwt_required
from server.extension import db
from server.models import Service, Booking
from . import booking_bp

api = Api(booking_bp)
class BookingListResource(Resource):
    def get(self):
        # optionally protect with @jwt_required()
        bookings = Booking.query.all()
        return [b.to_dict(rules=("-service.bookings",)) for b in bookings], 200

    def post(self):
        data = request.get_json()
        booking = Booking(
            name=data.get("name"),
            phone=data.get("phone"),
            email=data.get("email"),
            message=data.get("message"),
            service_id=data.get("service_id")
        )
        db.session.add(booking)
        db.session.commit()
        return booking.to_dict(rules=("-service.bookings",)), 201


class BookingResource(Resource):
    def get(self, booking_id):
        booking = Booking.query.get_or_404(booking_id)
        return booking.to_dict(rules=("-service.bookings",)), 200

    @jwt_required()
    def put(self, booking_id):
        booking = Booking.query.get_or_404(booking_id)
        data = request.get_json()

        if "status" in data:
            booking.status = data["status"]

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