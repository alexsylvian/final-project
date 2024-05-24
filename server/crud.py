from flask import session
from config import db
from models import Project, User, Subtask

def add_project(name):
    project = Project(name=name)
    db.session.add(project)
    db.session.commit()
    return project

def get_projects():
    return Project.query.all()

def add_user(username):
    user = User(username = username)
    db.session.add(user)
    db.session.commit()
    session['user_id'] = user.id

def get_users():
    return User.query.all()

def add_subtask(name):
    subtask = Subtask(name = name)
    db.session.add(subtask)
    db.session.commit()
    session['subtask_id'] = subtask.id

def get_subtasks():
    return Subtask.query.all()