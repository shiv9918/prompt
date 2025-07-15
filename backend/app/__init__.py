from flask import Flask
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from .config import Config
from .db import db
from .auth import bp as auth_bp
from .routes import routes
from .payment import payment_bp


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    db.init_app(app)
    JWTManager(app)
    CORS(app, origins=["http://localhost:8080"], supports_credentials=True)
    app.register_blueprint(auth_bp)
    app.register_blueprint(routes)
    app.register_blueprint(payment_bp)
    return app 