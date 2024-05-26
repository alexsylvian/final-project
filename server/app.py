#!/usr/bin/env python3

# Standard library imports

# Remote library imports
from flask import request, jsonify, session, make_response
from flask_restful import Resource
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

# Local imports
from config import app, db, api
from crud import add_project, get_projects, add_user
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
        print(([project.to_dict() for project in Project.query.all()]))
        return make_response(jsonify([project.to_dict() for project in Project.query.all()]))
    elif request.method == 'POST':
        data = request.get_json()
        name = data.get('name')
        # created_at = data.get('created_at')
        due_date = data.get('dueDate')
        due_date = datetime.strptime(due_date, '%Y-%m-%d').date()
        if name:
            project = Project(name=name, due_date=due_date)
            db.session.add(project)
            db.session.commit()
            project_data = {
            'id': project.id,
            'name': project.name,
            'subtasks': [subtask.name for subtask in project.subtasks],
            'created_at': project.created_at,
            'due_date': project.due_date
        }
            print(project.name)
            return jsonify(project_data)
        else:
            return jsonify({"error": "Name field is required"}), 400
        
@app.route('/projects/<id>', methods=['GET'])
def get_project(id):
    print("Received project ID:", id)
    project = Project.query.get(id)

    if project:
        project_data = {
            'id': project.id,
            'name': project.name,
            'subtasks': [subtask.name for subtask in project.subtasks],
            'created_at': project.created_at,
            'due-date': project.due_date,
            'completion_status': project.completion_status,
            'user_id': project.user_id
        }
        print(project.name)
        return jsonify(project_data)
    else:
        return jsonify({'error': 'Project not found'}), 404
    
@app.route('/projects/<id>/subtasks', methods=['GET', 'POST'])
def get_project_subtasks(id):
    if request.method == 'GET':
        print("Received project ID:", id)
        project = Project.query.get(id)

        if project:
            subtasks_data = []
            for subtask in project.subtasks:
                subtask_info = {
                    'id': subtask.id,
                    'name': subtask.name,
                    'created_at': subtask.created_at,
                    'completion_status': subtask.completion_status,
                    'project_id': subtask.project_id,
                    'creator_id': subtask.creator_id
                }
                subtasks_data.append(subtask_info)
            print("Subtasks:", subtasks_data)
            return jsonify(subtasks_data)
        else:
            return jsonify({'error': 'Project not found'}), 404
    elif request.method == 'POST':
        print('HI')
        data = request.get_json()
        name = data.get('name')
        project_id = data.get('project_id')
        print(data)
        if name:
            subtask = Subtask(name=name, project_id = project_id)
            db.session.add(subtask)
            db.session.commit()
            subtask_data = {
            'id': subtask.id,
            'name': subtask.name,
            'project_id': subtask.project_id
        }
            print(subtask_data)
            return jsonify(subtask_data)
        else:
            return jsonify({"error": "Name field is required"}), 400 
        
@app.route('/users', methods=['GET'])
def get_users():
    users = User.query.all()
    user_data = []
    for user in users:
        user_info = {
            'id': user.id,
            'username': user.username,
            'created_at': user.created_at.isoformat(),  # Format datetime as ISO string
            'position': user.position,
            # Add more fields as needed
        }
        user_data.append(user_info)
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

