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
            image_url="https://images.unsplash.com/photo-1612935089040-89195ef54677?q=80&w=2574&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        )
        service2 = Service(
            name="Plumbing",
            description="Professional plumbing services.",
            price=20000.0,
            image_url="https://images.unsplash.com/photo-1562159937-194305937c6a?q=80&w=1227&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        )
        service3 = Service(
            name="Electrical Installation",
            description="Certified electrical wiring and installation.",
            price=30000.0,
            image_url="https://images.unsplash.com/photo-1621905251918-48416bd8575a?q=80&w=2938&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        )
        db.session.add_all([service1, service2, service3])
        db.session.commit()

        # ---- Seed Portfolio Items with Images ----
        portfolio1 = PortfolioItem(
            tittle="Modern Villa",
            description="A modern villa built with premium materials.",
            image_url="https://images.unsplash.com/photo-1612935089040-89195ef54677?q=80&w=2574&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        )
        portfolio1.images = [
            PortfolioImage(image_url="https://images.unsplash.com/photo-1593623671668-2964bc9bde85?q=80&w=2574&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"),
            PortfolioImage(image_url="https://images.unsplash.com/photo-1667923006173-9e0d2251f608?q=80&w=1227&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"),
        ]

        portfolio2 = PortfolioItem(
            tittle="Office Complex",
            description="High-rise office building.",
            image_url="https://plus.unsplash.com/premium_photo-1661963657305-f52dcaeef418?q=80&w=2112&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        )
        portfolio2.images = [
            PortfolioImage(image_url="https://images.unsplash.com/photo-1580063665421-4c9cbe9ec11b?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"),
            PortfolioImage(image_url="https://plus.unsplash.com/premium_photo-1683140804492-ae54cf3eec81?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"),
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
