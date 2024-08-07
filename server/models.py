from sqlalchemy import Table, Column, Integer, ForeignKey, Enum
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import relationship
from sqlalchemy_serializer import SerializerMixin
from datetime import datetime
from config import db, bcrypt

priority_levels = Enum('low', 'medium', 'high', 'severe')

user_subtask_association = Table('user_subtask_association', db.Model.metadata,
    Column('user_id', Integer, ForeignKey('users.id')),
    Column('subtask_id', Integer, ForeignKey('subtasks.id')),
    Column('priority', priority_levels, default='low')
)

class User(db.Model, SerializerMixin):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String, unique=True)
    email = db.Column(db.String, unique=True, nullable=False)
    _password_hash = db.Column(db.String, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    position = db.Column(db.String)
    projects = db.relationship("Project", backref="user", lazy=True)
    subtasks_created = db.relationship("Subtask", backref="creator", lazy=True)

    subtasks = db.relationship("Subtask", secondary=user_subtask_association, back_populates="users")

    def __repr__(self):
        return f"User(id={self.id}, username={self.username}, email={self.email}, created_at={self.created_at}, position={self.position})"
    
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
            'email': self.email,
            'created_at': self.created_at.isoformat(),
            'position': self.position
        }

class Project(db.Model):
    __tablename__ = 'projects'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    due_date = db.Column(db.Date, nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    subtasks = db.relationship('Subtask', backref='project', lazy=True)

    def __repr__(self):
        return f"Project(id={self.id}, name={self.name}, created_at={self.created_at}, due_date={self.due_date}, user_id={self.user_id})"
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'subtasks': [subtask.to_dict() for subtask in self.subtasks],
            'created_at': self.created_at,
            'due_date': self.due_date,
            'user_id': self.user_id
        }


class Subtask(db.Model):
    __tablename__ = 'subtasks'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    completion_status = db.Column(db.Boolean, default=False, nullable=False)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'), nullable=False)
    creator_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    users = db.relationship("User", secondary=user_subtask_association, back_populates="subtasks", cascade="all, delete")
    comments = db.relationship("Comment", backref="subtask", lazy=True, cascade="all, delete")

    def __repr__(self):
        return f"Subtask(id={self.id}, name={self.name}, created_at={self.created_at}, completion_status={self.completion_status}, project_id={self.project_id}, creator_id={self.creator_id})"
    
    def to_dict(self):
        from sqlalchemy.orm import sessionmaker

        Session = sessionmaker(bind=db.engine)
        session = Session()

        associations = session.query(user_subtask_association).filter_by(subtask_id=self.id).all()
        comments = [comment.to_dict() for comment in self.comments]

        return {
            "id": self.id,
            "name": self.name,
            "created_at": self.created_at.isoformat(),
            "completion_status": self.completion_status,
            "project_id": self.project_id,
            "creator_id": self.creator_id,
            "users_attached": [
                {
                    "user": user.to_dict(),
                    "priority": next((assoc.priority for assoc in associations if assoc.user_id == user.id), None)
                } for user in self.users
            ],
            "comments": comments
        }

class Comment(db.Model, SerializerMixin):
    __tablename__ = 'comments'

    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.Text, nullable=False)
    username = db.Column(db.String, nullable=False)
    subtask_id = db.Column(db.Integer, db.ForeignKey('subtasks.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"Comment(id={self.id}, text={self.text}, username={self.username}, created_at={self.created_at}, subtask_id={self.subtask_id})"
    
    def to_dict(self):
        return {
            'id': self.id,
            'text': self.text,
            'username': self.username,
            'created_at': self.created_at.isoformat(),
            'subtask_id': self.subtask_id
        }