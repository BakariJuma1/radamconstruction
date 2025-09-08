from server.extension import db
from sqlalchemy_serializer import SerializerMixin
from datetime import datetime



class PortfolioImage(db.Model,SerializerMixin):
    __tablename__ = "portfolio_item"

    id = db.Column(db.Integer, primary_key=True)
    image_url = db.Column(db.String(255), nullable=False) 

    portfolio_id = db.Column(db.Integer, db.ForeignKey("portfolio_item.id"), nullable=False)
    portfolio = db.relationship("PortfolioItem", back_populates="images")
    

    serialize_rules = ("-portfolio.images",)