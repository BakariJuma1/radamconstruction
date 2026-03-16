from server.controllers.auth import auth_bp
from server.controllers.booking import booking_bp
from server.controllers.portfolio import portfolio_bp
from server.controllers.services import services_bp
from server.controllers.contact import contact_bp
from server.controllers.settings import settings_bp
from server.controllers.hardware import hardware_bp
from server.controllers.users import users_bp


def register_routes(app):
    app.register_blueprint(auth_bp)
    app.register_blueprint(services_bp)
    app.register_blueprint(booking_bp)
    app.register_blueprint(portfolio_bp)
    app.register_blueprint(contact_bp)
    app.register_blueprint(settings_bp)
    app.register_blueprint(hardware_bp)
    app.register_blueprint(users_bp)
