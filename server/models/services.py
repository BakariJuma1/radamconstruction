from server.extension import db
from sqlalchemy_serializer import SerializerMixin

class Services(db.Model,SerializerMixin):

    __tablename__ = 'services'

    id = db.Column(db.Integer,primary_key=True)
    name = db.Column(db.String,nullable=False)
    description = db.Column(db.String,nullable=False)
    price =db.Column(db.Float,nullable=True)
    image_url = db.Column(db.String,nullable=True)
    created_at = db.Column(db.DateTime,server_default=db.func.now())
    updated_at = db.Column(db.DateTime,server_default=db.func.now(),onupdate=db.func.now())