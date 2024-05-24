#!/usr/bin/env python3

# Standard library imports

# Remote library imports
from flask import request, jsonify, session
from flask_restful import Resource
from flask_sqlalchemy import SQLAlchemy
from crud import add_project, get_projects, add_user

# Local imports
from config import app, db, api
# Add your model imports
from models import User, Project, Subtask

# Views go here!
class Login(Resource):

    def post(self):
        user = User.query.filter(
            User.username == request.get_json()['username']
        ).first()
        print(user.username)

        session['user_id'] = user.id
        return user.to_dict()
    
api.add_resource(Login, '/login')

class CheckSession(Resource):

    def get(self):
        user = User.query.filter(User.id == session.get('user_id')).first()
        if user:
            return user.to_dict()
        else:
            return {'message': '401: Not Authorized'}, 401

api.add_resource(CheckSession, '/check_session')

class Logout(Resource):

    def delete(self):
        session['user_id'] = None
        return {'message': '204: No Content'}, 204

api.add_resource(Logout, '/logout')

@app.route('/')
def index():
    return '<h1>Project Server</h1>'

@app.route('/projects', methods=['GET', 'POST'])
def projects():
    if request.method == 'GET':
        projects = get_projects()
        project_data = []
        for project in projects:
            project_info = {
                'id': project.id,
                'name': project.name,
                'subtasks': [subtask.name for subtask in project.subtasks],  # Retrieve subtask names
                'created_at': project.created_at
            }
            project_data.append(project_info)
        return jsonify(project_data)
    elif request.method == 'POST':
        data = request.get_json()
        name = data.get('name')
        if name:
            project = Project(name=name)
            db.session.add(project)
            db.session.commit()
            project_data = {
            'id': project.id,
            'name': project.name,
            'subtasks': [subtask.name for subtask in project.subtasks]
        }
            print(project.name)
            return jsonify(project_data)
        else:
            return jsonify({"error": "Name field is required"}), 400
        
@app.route('/project/<id>', methods=['GET'])
def get_project(id):
    print("Received project ID:", id)
    project = Project.query.get(id)

    if project:
        project_data = {
            'id': project.id,
            'name': project.name,
            'subtasks': [subtask.name for subtask in project.subtasks],
            'created-at': project.name
        }
        print(project.name)
        return jsonify(project_data)
    else:
        return jsonify({'error': 'Project not found'}), 404
    
@app.route('/project/<id>/subtasks', methods=['GET'])
def get_project_subtasks(id):
    print("Received project ID:", id)
    project = Project.query.get(id)

    if project:
        subtasks_data = [subtask.name for subtask in project.subtasks]
        print("Subtasks:", subtasks_data)
        return jsonify(subtasks_data)
    else:
        return jsonify({'error': 'Project not found'}), 404
        
@app.route('/users', methods=['GET'])
def get_users():
    users = User.query.all()
    user_data = [{'id': user.id, 'username': user.username} for user in users]
    return jsonify(user_data)

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')

    if User.query.filter_by(username=username).first() is not None:
        return jsonify({'message': 'Username already exists'}), 400
    
    user = User(username = username)
    db.session.add(user)
    db.session.commit()
    session['user_id'] = user.id

    return jsonify(user.to_dict()), 201


if __name__ == '__main__':
    app.run(port=5555, debug=True)

