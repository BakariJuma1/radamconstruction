from server.extension import db
from werkzeug.security import generate_password_hash,check_password_hash
from sqlalchemy_serializer import SerializerMixin 

class User(db.Model,SerializerMixin):

    __tablename__='users'

    id = db.Column(db.Integer,primary_key=True)
    username = db.Column(db.String,nullable=False)
    email = db.Column(db.String,nullable=False)
    password_hash = db.Column(db.String,nullable=False)

    serialize_rules = ("-password_hash",)


    def set_password(self,password):
        self.password_hash=generate_password_hash(password)

    def check_password(self,password):
        self.check_password_hash(self.password_hash,password)    