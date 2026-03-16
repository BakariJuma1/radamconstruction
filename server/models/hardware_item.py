from datetime import datetime
from server.extension import db


class HardwareItem(db.Model):
    __tablename__ = "hardware_items"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text, nullable=True)
    price = db.Column(db.Float, nullable=True)
    unit = db.Column(db.String(50), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    category_id = db.Column(
        db.Integer, db.ForeignKey("hardware_categories.id"), nullable=False
    )
    category = db.relationship("HardwareCategory", back_populates="items")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "price": self.price,
            "unit": self.unit,
            "category_id": self.category_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
