from server.extension import db
from sqlalchemy_serializer import SerializerMixin
from datetime import datetime

class PortfolioItem(db.Model,SerializerMixin):

    __tablename__ = 'portfolio_items'

    id = db.Column(db.Integer,primary_key=True)
    tittle = db.Column(db.String,nullable=False)
    description = db.Column(db.String,nullable=False)
    image_url= db.Column(db.String,nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    serialize_rules = ("-images.portfolio",)

    #  One portfolio item  many images
    images = db.relationship("PortfolioImage", back_populates="portfolio", cascade="all, delete-orphan")

