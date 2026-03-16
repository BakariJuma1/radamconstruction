from server.extension import db
from sqlalchemy_serializer import SerializerMixin
from datetime import datetime

class Booking(db.Model, SerializerMixin):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    message = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(20), default="pending")  
    is_read = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    serialize_rules = ("-service.bookings", "-assigned_user.assigned_bookings")

    # Booking tied to a service
    service_id = db.Column(db.Integer, db.ForeignKey("service.id"), nullable=True)
    service = db.relationship("Service", back_populates="bookings")
    assigned_user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    assigned_user = db.relationship(
        "User",
        back_populates="assigned_bookings",
        foreign_keys=[assigned_user_id],
    )
