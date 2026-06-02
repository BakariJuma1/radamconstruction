import sys
from flask_migrate import upgrade
from server.app import create_app

app = create_app()

with app.app_context():
    try:
        upgrade()
        print("Database migrations applied successfully.")
    except Exception as e:
        print(f"ERROR: Database migration failed: {e}", file=sys.stderr)
        sys.exit(1)
