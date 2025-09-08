from flask import request
from flask_restful import Resource,Api
from flask_jwt_extended import jwt_required
from server.extension import db
from server.models import Service, PortfolioItem, PortfolioImage, Booking
from . import portfolio_bp

api = Api(portfolio_bp)
class PortfolioListResource(Resource):
    def get(self):
        items = PortfolioItem.query.all()
        return [i.to_dict(rules=("-images.portfolio",)) for i in items], 200

    @jwt_required()
    def post(self):
        data = request.get_json()
        portfolio = PortfolioItem(
            title=data.get("title"),
            description=data.get("description")
        )
        db.session.add(portfolio)
        db.session.flush()  # Get ID before commit

        if data.get("images"):
            for url in data["images"]:  # array of Cloudinary URLs
                db.session.add(PortfolioImage(image_url=url, portfolio=portfolio))

        db.session.commit()
        return portfolio.to_dict(rules=("-images.portfolio",)), 201

class PortfolioResource(Resource):
    def get(self, portfolio_id):
        item = PortfolioItem.query.get_or_404(portfolio_id)
        return item.to_dict(rules=("-images.portfolio",)), 200

    @jwt_required()
    def put(self, portfolio_id):
        item = PortfolioItem.query.get_or_404(portfolio_id)
        data = request.get_json()

        if "title" in data: item.title = data["title"]
        if "description" in data: item.description = data["description"]

        if "images" in data:
            # Clear old images and add new ones
            PortfolioImage.query.filter_by(portfolio_id=item.id).delete()
            for url in data["images"]:
                db.session.add(PortfolioImage(image_url=url, portfolio=item))

        db.session.commit()
        return item.to_dict(rules=("-images.portfolio",)), 200

    @jwt_required()
    def delete(self, portfolio_id):
        item = PortfolioItem.query.get_or_404(portfolio_id)
        db.session.delete(item)
        db.session.commit()
        return {"message": "Portfolio item deleted"}, 200

api.add_resource(PortfolioListResource,'/portfolio')
api.add_resource(PortfolioResource,'/portfolio/<int:portfolio_id>')
