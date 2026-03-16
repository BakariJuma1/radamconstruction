from flask import request
from flask_restful import Api, Resource
from flask_jwt_extended import jwt_required
from server.extension import db
from server.models import HardwareCategory, HardwareItem
from server.service.cloudinary_service import upload_files_to_cloudinary
from . import hardware_bp

api = Api(hardware_bp)


class HardwareCategoryListResource(Resource):
    def get(self):
        categories = HardwareCategory.query.order_by(HardwareCategory.name.asc()).all()
        return [category.to_dict() for category in categories], 200

    @jwt_required()
    def post(self):
        data = request.get_json() or {}
        name = (data.get("name") or "").strip()
        description = (data.get("description") or "").strip()

        if not name:
            return {"error": "Category name is required"}, 400

        existing = HardwareCategory.query.filter_by(name=name).first()
        if existing:
            return {"error": "Category already exists"}, 400

        category = HardwareCategory(name=name, description=description or None)
        db.session.add(category)
        db.session.commit()

        return category.to_dict(), 201


class HardwareCategoryResource(Resource):
    def get(self, category_id):
        category = HardwareCategory.query.get_or_404(category_id)
        return category.to_dict(), 200

    @jwt_required()
    def put(self, category_id):
        category = HardwareCategory.query.get_or_404(category_id)
        data = request.get_json() or {}

        name = (data.get("name") or "").strip()
        description = (data.get("description") or "").strip()

        if name:
            existing = HardwareCategory.query.filter_by(name=name).first()
            if existing and existing.id != category.id:
                return {"error": "Category name already exists"}, 400
            category.name = name

        category.description = description or None
        db.session.commit()

        return category.to_dict(), 200

    @jwt_required()
    def delete(self, category_id):
        category = HardwareCategory.query.get_or_404(category_id)
        db.session.delete(category)
        db.session.commit()
        return {"message": "Hardware category deleted"}, 200


class HardwareItemListResource(Resource):
    @jwt_required()
    def post(self):
        if request.content_type and "multipart/form-data" in request.content_type:
            data = request.form
            image = request.files.get("image")
        else:
            data = request.get_json() or {}
            image = None

        name = (data.get("name") or "").strip()
        description = (data.get("description") or "").strip()
        unit = (data.get("unit") or "").strip()
        category_id = data.get("category_id")
        price = data.get("price")

        if not name:
            return {"error": "Item name is required"}, 400
        if not category_id:
            return {"error": "Category is required"}, 400

        category = HardwareCategory.query.get_or_404(category_id)
        image_url = None

        if image:
            uploaded = upload_files_to_cloudinary(
                image, folder="radam-construction/hardware"
            )
            image_url = uploaded[0]["secure_url"]

        item = HardwareItem(
            name=name,
            description=description or None,
            unit=unit or None,
            price=float(price) if price not in (None, "") else None,
            image_url=image_url,
            category=category,
        )
        db.session.add(item)
        db.session.commit()

        return item.to_dict(), 201


class HardwareItemResource(Resource):
    @jwt_required()
    def put(self, item_id):
        item = HardwareItem.query.get_or_404(item_id)
        if request.content_type and "multipart/form-data" in request.content_type:
            data = request.form
            image = request.files.get("image")
        else:
            data = request.get_json() or {}
            image = None

        name = (data.get("name") or "").strip()
        description = (data.get("description") or "").strip()
        unit = (data.get("unit") or "").strip()
        category_id = data.get("category_id")
        price = data.get("price")

        if name:
            item.name = name
        item.description = description or None
        item.unit = unit or None
        item.price = float(price) if price not in (None, "") else None

        if category_id:
            item.category = HardwareCategory.query.get_or_404(category_id)
        if image:
            uploaded = upload_files_to_cloudinary(
                image, folder="radam-construction/hardware"
            )
            item.image_url = uploaded[0]["secure_url"]

        db.session.commit()
        return item.to_dict(), 200

    @jwt_required()
    def delete(self, item_id):
        item = HardwareItem.query.get_or_404(item_id)
        db.session.delete(item)
        db.session.commit()
        return {"message": "Hardware item deleted"}, 200


api.add_resource(HardwareCategoryListResource, "/hardware-categories")
api.add_resource(HardwareCategoryResource, "/hardware-categories/<int:category_id>")
api.add_resource(HardwareItemListResource, "/hardware-items")
api.add_resource(HardwareItemResource, "/hardware-items/<int:item_id>")
