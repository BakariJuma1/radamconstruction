from server.controllers.auth import auth_bp
from server.controllers.booking import booking_bp
from server.controllers.portfolio import portfolio_bp
from server.controllers.services import services_bp
from server.controllers.contact import contact_bp


def register_routes(app):
    app.register_blueprint(auth_bp)
    app.register_blueprint(services_bp)
    app.register_blueprint(booking_bp)
    app.register_blueprint(portfolio_bp)
    app.register_blueprint(contact_bp)