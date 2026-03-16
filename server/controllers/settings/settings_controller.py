import json
from flask import request
from flask_restful import Api, Resource
from flask_jwt_extended import jwt_required
from server.extension import db
from server.models import SiteSetting
from . import settings_bp

api = Api(settings_bp)


class PublicSettingsResource(Resource):
    def get(self):
        settings = SiteSetting.get_singleton()
        return settings.to_public_dict(), 200


class SiteSettingsResource(Resource):
    @jwt_required()
    def get(self):
        settings = SiteSetting.get_singleton()
        return settings.to_admin_dict(), 200

    @jwt_required()
    def put(self):
        settings = SiteSetting.get_singleton()
        data = request.get_json() or {}

        whatsapp_number = (data.get("whatsapp_number") or "").strip()
        google_business_name = (data.get("google_business_name") or "").strip()
        google_reviews_json = data.get("google_reviews_json") or ""

        if google_reviews_json:
            try:
                parsed_reviews = json.loads(google_reviews_json)
            except ValueError:
                return {"error": "Google reviews must be valid JSON"}, 400

            if not isinstance(parsed_reviews, list):
                return {"error": "Google reviews JSON must be an array"}, 400
        else:
            google_reviews_json = ""

        settings.whatsapp_number = whatsapp_number or None
        settings.google_business_name = google_business_name or None
        settings.google_reviews_json = google_reviews_json

        db.session.add(settings)
        db.session.commit()

        return settings.to_admin_dict(), 200


api.add_resource(PublicSettingsResource, "/settings/public")
api.add_resource(SiteSettingsResource, "/settings")
