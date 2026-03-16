import json
from server.extension import db


class SiteSetting(db.Model):
    __tablename__ = "site_settings"

    id = db.Column(db.Integer, primary_key=True, default=1)
    whatsapp_number = db.Column(db.String(32), nullable=True)
    google_business_name = db.Column(db.String(255), nullable=True)
    google_reviews_json = db.Column(db.Text, nullable=True)

    @classmethod
    def get_singleton(cls):
        settings = cls.query.get(1)
        if not settings:
            settings = cls(id=1)
            db.session.add(settings)
            db.session.commit()
        return settings

    def get_google_reviews(self):
        if not self.google_reviews_json:
            return []
        try:
            parsed = json.loads(self.google_reviews_json)
            return parsed if isinstance(parsed, list) else []
        except (TypeError, ValueError):
            return []

    def to_public_dict(self):
        return {
            "whatsapp_number": self.whatsapp_number,
            "google_business_name": self.google_business_name,
            "google_reviews": self.get_google_reviews(),
        }

    def to_admin_dict(self):
        data = self.to_public_dict()
        data["google_reviews_json"] = self.google_reviews_json or ""
        return data
