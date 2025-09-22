from flask import Flask
from  server.extension import db,migrate,jwt
from dotenv import load_dotenv
from server.route import register_routes
from server.seed import run_seeds
from flask_cors import CORS
import os

load_dotenv()

def create_app():
    app=Flask(__name__)
    app.config.from_prefixed_env()
    app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY')

    db.init_app(app)
    migrate.init_app(app,db)
    jwt.init_app(app)
    CORS(app)

    @app.route('/')
    def home():
        return {"message":"Welcome to Radam construction Api"}
    
    register_routes(app)
    run_seeds(app)
    
    return app

app=create_app()     