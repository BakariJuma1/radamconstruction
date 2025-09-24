from flask import request
from flask_restful import Resource, Api
from flask_jwt_extended import jwt_required, jwt_optional, get_jwt_identity
from server.extension import db
from server.models import Service
from server.service.cloudinary_service import upload_files_to_cloudinary
from server.helpers.filter import filter_bookings
from . import services_bp

api = Api(services_bp)





class ServiceListResource(Resource):
    @jwt_optional()
    def get(self):
        current_user_email = get_jwt_identity()
        services = Service.query.all()
        services_list = [filter_bookings(s.to_dict(), current_user_email) for s in services]
        return services_list, 200

    @jwt_required()
    def post(self):
        name = request.form.get("name")
        description = request.form.get("description")
        price = request.form.get("price")
        files = request.files.getlist("images")

        if not name:
            return {"error": "Service name is required"}, 400
        if not files:
            return {"error": "At least one image is required"}, 400

        # Upload the first image
        uploaded = upload_files_to_cloudinary(files, folder="radam-construction/services")
        image_url = uploaded[0]["secure_url"]

        service = Service(
            name=name.strip(),
            description=description,
            price=price,
            image_url=image_url
        )
        db.session.add(service)
        db.session.commit()

        return service.to_dict(), 201


class ServiceResource(Resource):
    @jwt_optional()
    def get(self, service_id):
        service = Service.query.get_or_404(service_id)
        current_user_email = get_jwt_identity()
        return filter_bookings(service.to_dict(), current_user_email), 200

    @jwt_required()
    def put(self, service_id):
        service = Service.query.get_or_404(service_id)

        name = request.form.get("name")
        description = request.form.get("description")
        price = request.form.get("price")
        files = request.files.getlist("images")

        if name:
            service.name = name.strip()
        if description:
            service.description = description
        if price:
            service.price = price

        if files:
            uploaded = upload_files_to_cloudinary(files, folder="radam-construction/services")
            service.image_url = uploaded[0]["secure_url"]

        db.session.commit()
        return service.to_dict(), 200

    @jwt_required()
    def delete(self, service_id):
        service = Service.query.get_or_404(service_id)
        db.session.delete(service)
        db.session.commit()
        return {"message": "Service deleted"}, 200


api.add_resource(ServiceListResource, "/services")
api.add_resource(ServiceResource, "/services/<int:service_id>")
