from sqlalchemy import Table, Column, Integer, ForeignKey
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import relationship
from sqlalchemy_serializer import SerializerMixin
from datetime import datetime
from config import db, bcrypt

user_subtask_association = Table('user_subtask_association', db.Model.metadata,
    Column('user_id', Integer, ForeignKey('users.id')),
    Column('subtask_id', Integer, ForeignKey('subtasks.id'))
)

class User(db.Model, SerializerMixin):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String, unique=True)
    _password_hash = db.Column(db.String, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    position = db.Column(db.String)
    projects = db.relationship("Project", backref="user", lazy=True)  # One-to-many relationship with projects
    subtasks_created = db.relationship("Subtask", backref="creator", lazy=True)  # One-to-many relationship with subtasks

    subtasks = db.relationship("Subtask", secondary=user_subtask_association, back_populates="users")

    def __repr__(self):
        return f"User(id={self.id}, username={self.username}, created_at={self.created_at}, position={self.position})"
    
    @hybrid_property
    def password_hash(self):
        return self._password_hash

    @password_hash.setter
    def password_hash(self, password):
        """Set the user's password."""
        password_hash = bcrypt.generate_password_hash(
            password.encode('utf-8'))
        self._password_hash = password_hash.decode('utf-8')

    def authenticate(self, password):
        """Check if the provided password matches the user's password."""
        return bcrypt.check_password_hash(self._password_hash, password.encode('utf-8'))

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'created_at': self.created_at.isoformat(),  # Convert to ISO format for JSON serialization
            'position': self.position
        }

class Project(db.Model):
    __tablename__ = 'projects'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    due_date = db.Column(db.DateTime, nullable=True)
    completion_status = db.Column(db.Boolean, default=False, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    subtasks = db.relationship('Subtask', backref='project', lazy=True)

    def __repr__(self):
        return f"Project(id={self.id}, name={self.name}, created_at={self.created_at}, due_date={self.due_date}, user_id={self.user_id}, completion_status={self.completion_status})"
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'subtasks': [subtask.to_dict() for subtask in self.subtasks],
            'created_at': self.created_at,
            'due-date': self.due_date,
            'completion_status': self.completion_status,
            'user_id': self.user_id
        }
    
    def update_completion_status(self):
        """Update the completion status of the project based on subtasks completion."""
        self.completion_status = all(subtask.completion_status for subtask in self.subtasks)


class Subtask(db.Model):
    __tablename__ = 'subtasks'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    completion_status = db.Column(db.Boolean, default=False, nullable=False)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'), nullable=False)
    creator_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    users = db.relationship("User", secondary=user_subtask_association, back_populates="subtasks", cascade="all, delete")

    def __repr__(self):
        return f"Subtask(id={self.id}, name={self.name}, created_at={self.created_at}, completion_status={self.completion_status}, project_id={self.project_id}, creator_id={self.creator_id})"
    
    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "created_at": self.created_at,
            "completion_status": self.completion_status,
            "project_id": self.project_id,
            "creator_id": self.creator_id,
            "users_attached": [user.to_dict() for user in self.users]
        }
