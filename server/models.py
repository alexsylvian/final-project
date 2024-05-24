from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.ext.associationproxy import association_proxy
from datetime import datetime

from config import db

class User(db.Model, SerializerMixin):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String, unique=True)

def __repr__(self):
    return f"Useer(id={self.id}, name={self.name})"

class Project(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.now, nullable=False)
    subtasks = db.relationship('Subtask', backref='project', lazy=True)

    def __repr__(self):
        return f"Project(id={self.id}, name={self.name}, created_at={self.created_at})"

class Subtask(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    # created_at = db.Column(db.DateTime, default=datetime.now(), nullable=False)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)

    def __repr__(self):
        return f"Subtask(id={self.id}, name={self.name}, project_id={self.project_id}, created_at={self.created_at})"