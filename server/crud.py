from config import db
from models import Project

def add_project(name):
    project = Project(name=name)
    db.session.add(project)
    db.session.commit()

def get_projects():
    return Project.query.all()