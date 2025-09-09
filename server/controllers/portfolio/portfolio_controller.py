from flask import request
from flask_restful import Resource, Api
from flask_jwt_extended import jwt_required
from server.extension import db
from server.models import PortfolioItem, PortfolioImage
from server.service.cloudinary_service import upload_files_to_cloudinary
from . import portfolio_bp

api = Api(portfolio_bp)


class PortfolioListResource(Resource):
    def get(self):
        items = PortfolioItem.query.all()
        return [i.to_dict(rules=("-images.portfolio",)) for i in items], 200

    @jwt_required()
    def post(self):
        title = request.form.get("title")
        description = request.form.get("description")
        files = request.files.getlist("images") 

        portfolio = PortfolioItem(title=title, description=description)
        db.session.add(portfolio)
        db.session.flush()

        if files:
            uploaded = upload_files_to_cloudinary(files, folder="radam-construction/portfolio")
            for img in uploaded:
                db.session.add(PortfolioImage(image_url=img["secure_url"], portfolio=portfolio))

        db.session.commit()
        return portfolio.to_dict(rules=("-images.portfolio",)), 201


class PortfolioResource(Resource):
    def get(self, portfolio_id):
        item = PortfolioItem.query.get_or_404(portfolio_id)
        return item.to_dict(rules=("-images.portfolio",)), 200

    @jwt_required()
    def put(self, portfolio_id):
        item = PortfolioItem.query.get_or_404(portfolio_id)
        title = request.form.get("title")
        description = request.form.get("description")
        files = request.files.getlist("images")

        if title: item.title = title
        if description: item.description = description

        if files:
            PortfolioImage.query.filter_by(portfolio_id=item.id).delete()
            uploaded = upload_files_to_cloudinary(files, folder="radam-construction/portfolio")
            for img in uploaded:
                db.session.add(PortfolioImage(image_url=img["secure_url"], portfolio=item))

        db.session.commit()
        return item.to_dict(rules=("-images.portfolio",)), 200

    @jwt_required()
    def delete(self, portfolio_id):
        item = PortfolioItem.query.get_or_404(portfolio_id)
        db.session.delete(item)
        db.session.commit()
        return {"message": "Portfolio item deleted"}, 200


api.add_resource(PortfolioListResource, '/portfolio')
api.add_resource(PortfolioResource, '/portfolio/<int:portfolio_id>')
