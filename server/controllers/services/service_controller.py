from flask import request
from flask_restful import Resource, Api
from flask_jwt_extended import jwt_required
from server.extension import db
from server.models import Service
from server.service.cloudinary_service import upload_files_to_cloudinary
from . import services_bp

api = Api(services_bp)


class ServiceListResource(Resource):
    def get(self):
        services = Service.query.all()
        return [s.to_dict() for s in services], 200

    @jwt_required()
    def post(self):
        title = request.form.get("title")
        description = request.form.get("description")
        price = request.form.get("price")
        files = request.files.getlist("images")

        uploaded_urls = []
        if files:
            uploaded = upload_files_to_cloudinary(files, folder="radam-construction/services")
            uploaded_urls = [img["secure_url"] for img in uploaded]

        service = Service(
            title=title,
            description=description,
            price=price,
            images=uploaded_urls  
        )
        db.session.add(service)
        db.session.commit()

        return service.to_dict(), 201


class ServiceResource(Resource):
    def get(self, service_id):
        service = Service.query.get_or_404(service_id)
        return service.to_dict(), 200

    @jwt_required()
    def put(self, service_id):
        service = Service.query.get_or_404(service_id)
        title = request.form.get("title")
        description = request.form.get("description")
        price = request.form.get("price")
        files = request.files.getlist("images")

        if title: service.title = title
        if description: service.description = description
        if price: service.price = price

        if files:
            uploaded = upload_files_to_cloudinary(files, folder="radam-construction/services")
            service.images = [img["secure_url"] for img in uploaded]

        db.session.commit()
        return service.to_dict(), 200

    @jwt_required()
    def delete(self, service_id):
        service = Service.query.get_or_404(service_id)
        db.session.delete(service)
        db.session.commit()
        return {"message": "Service deleted"}, 200


api.add_resource(ServiceListResource, '/services')
api.add_resource(ServiceResource, '/services/<int:service_id>')
