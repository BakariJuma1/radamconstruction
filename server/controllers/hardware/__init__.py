from flask import Blueprint

hardware_bp = Blueprint("hardware_bp", __name__)

from . import hardware_controller
