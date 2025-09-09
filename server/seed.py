from server.extension import db
from server.models.user import User
from server.models.service import Service
from server.models.booking import Booking
from server.models.portfolio_item import PortfolioItem
from server.models.portfolio_image import PortfolioImage
from datetime import datetime
from faker import Faker

fake = Faker()

def run_seeds(app):
    with app.app_context():
        print("Dropping all tables...")
        db.drop_all()
        print("Creating all tables...")
        db.create_all()

        # ---- Seed Users ----
        admin = User(username="admin", email="admin@radam.com")
        admin.set_password("admin123")

        user1 = User(username="john_doe", email="john@example.com")
        user1.set_password("password")

        db.session.add_all([admin, user1])
        db.session.commit()

        # ---- Seed Services ----
        service1 = Service(
            name="House Construction",
            description="Complete house construction from foundation to finishing.",
            price=500000.0,
            image_url="https://via.placeholder.com/300x200"
        )
        service2 = Service(
            name="Plumbing",
            description="Professional plumbing services.",
            price=20000.0,
            image_url="https://via.placeholder.com/300x200"
        )
        service3 = Service(
            name="Electrical Installation",
            description="Certified electrical wiring and installation.",
            price=30000.0,
            image_url="https://via.placeholder.com/300x200"
        )
        db.session.add_all([service1, service2, service3])
        db.session.commit()

        # ---- Seed Portfolio Items with Images ----
        portfolio1 = PortfolioItem(
            tittle="Modern Villa",
            description="A modern villa built with premium materials.",
            image_url="https://via.placeholder.com/400x300"
        )
        portfolio1.images = [
            PortfolioImage(image_url="https://via.placeholder.com/400x300?1"),
            PortfolioImage(image_url="https://via.placeholder.com/400x300?2"),
        ]

        portfolio2 = PortfolioItem(
            tittle="Office Complex",
            description="High-rise office building.",
            image_url="https://via.placeholder.com/400x300"
        )
        portfolio2.images = [
            PortfolioImage(image_url="https://via.placeholder.com/400x300?3"),
            PortfolioImage(image_url="https://via.placeholder.com/400x300?4"),
        ]

        db.session.add_all([portfolio1, portfolio2])
        db.session.commit()

        # ---- Seed Bookings ----
        booking1 = Booking(
            name="Jane Doe",
            phone="0712345678",
            email="jane@example.com",
            message="I’d like a quotation for a new home.",
            status="pending",
            service=service1,
            created_at=datetime.utcnow()
        )
        booking2 = Booking(
            name="Peter Parker",
            phone="0798765432",
            email="peter@example.com",
            message="Need help with plumbing.",
            status="confirmed",
            service=service2,
            created_at=datetime.utcnow()
        )

        db.session.add_all([booking1, booking2])
        db.session.commit()

        print("✅ Database successfully seeded!")
