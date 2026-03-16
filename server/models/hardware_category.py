from datetime import datetime
from server.extension import db


class HardwareCategory(db.Model):
    __tablename__ = "hardware_categories"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False, unique=True)
    description = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    items = db.relationship(
        "HardwareItem",
        back_populates="category",
        cascade="all, delete-orphan",
        order_by="HardwareItem.name.asc()",
    )

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "items": [item.to_dict() for item in self.items],
        }
