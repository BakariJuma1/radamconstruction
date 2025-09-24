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
        tittle = request.form.get("title")
        description = request.form.get("description")
        files = request.files.getlist("images") 

        if not files:
            return {"error": "At least one image is required"}, 400

        # Upload all images
        uploaded = upload_files_to_cloudinary(files, folder="radam-construction/portfolio")

        # First image becomes the cover 
        portfolio = PortfolioItem(
            tittle=tittle,
            description=description,
            image_url=uploaded[0]["secure_url"]  
        )
        db.session.add(portfolio)
        db.session.flush()

        # Add all images to PortfolioImage
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
        tittle = request.form.get("title")
        description = request.form.get("description")
        files = request.files.getlist("images")

        if tittle:
            item.tittle = tittle
        if description:
            item.description = description

        if files:
            
            PortfolioImage.query.filter_by(portfolio_id=item.id).delete()

            
            uploaded = upload_files_to_cloudinary(files, folder="radam-construction/portfolio")

            # Update cover image
            item.image_url = uploaded[0]["secure_url"]

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
