from flask import Flask
from  server.extension import db,migrate,jwt
from dotenv import load_dotenv


load_dotenv()

def create_app():
    app=Flask(__name__)
    app.config.from_prefixed_env()

    db.init_app(app)
    migrate.init_app(app,db)
    jwt.init_app(app)

    @app.route('/')
    def home():
        return {"message":"Welcome to Radam construction Api"}
    
    return app

app=create_app()     