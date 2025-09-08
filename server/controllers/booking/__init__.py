from flask import Blueprint

booking_bp=Blueprint('booking_bp',__name__)

from .booking_controller import *