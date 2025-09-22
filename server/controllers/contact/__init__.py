from flask import Blueprint

contact_bp=Blueprint('contact_bp',__name__)

from .contact_controller import *