from flask import request
from flask_restful import Resource,Api
from flask_jwt_extended import jwt_required
from server.extension import db
from server.models import Service, PortfolioItem, PortfolioImage, Booking
from .import services_bp

api=Api(services_bp)
class ServiceListResource(Resource):
    def get(self):
        services = Service.query.all()
        return [s.to_dict() for s in services], 200

    @jwt_required()
    def post(self):
        data = request.get_json()
        service = Service(
            title=data.get("title"),
            description=data.get("description"),
            price=data.get("price"),
            image_url=data.get("image_url")  # Cloudinary URL
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
        data = request.get_json()

        if "title" in data: service.title = data["title"]
        if "description" in data: service.description = data["description"]
        if "price" in data: service.price = data["price"]
        if "image_url" in data: service.image_url = data["image_url"]

        db.session.commit()
        return service.to_dict(), 200

    @jwt_required()
    def delete(self, service_id):
        service = Service.query.get_or_404(service_id)
        db.session.delete(service)
        db.session.commit()
        return {"message": "Service deleted"}, 200
    
api.add_resource(ServiceListResource,'/services')
api.add_resource(ServiceResource,'/services/<int:service_id>')    