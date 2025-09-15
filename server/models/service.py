from server.extension import db
from sqlalchemy_serializer import SerializerMixin
from datetime import datetime

class Service(db.Model,SerializerMixin):

    __tablename__ = 'service'

    id = db.Column(db.Integer,primary_key=True)
    name = db.Column(db.String,nullable=False)
    description = db.Column(db.String,nullable=False)
    price =db.Column(db.Float,nullable=True)
    image_url = db.Column(db.String,nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    serialize_rules = ("-bookings.service",)

   
    bookings = db.relationship("Booking", back_populates="service", cascade="all, delete-orphan")