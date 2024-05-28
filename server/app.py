#!/usr/bin/env python3

# Standard library imports
import logging

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
# @app.before_request
# def check_if_logged_in():
#     if not session['user_id']:
#         return {'error': 'Unauthorized'}, 401

class Login(Resource):

    def post(self):
        user = User.query.filter(
            User.username == request.get_json()['username']
        ).first()
        print(user.username)

        app.logger.debug(f"Session before setting user ID: {session}")
        session['user_id'] = user.id
        app.logger.debug(f"Session after setting user ID: {session}")
        print(session['user_id'])
        return user.to_dict()
    
api.add_resource(Login, '/login')

logging.basicConfig(level=logging.DEBUG)  # Set the logging level to DEBUG

class CheckSession(Resource):

    def get(self):
        user_id = session.get('user_id')
        logging.debug(f"Session user_id: {user_id}")
        
        user = User.query.filter(User.id == user_id).first()
        if user:
            logging.debug(f"User found: {user.to_dict()}")
            return user.to_dict()
        else:
            logging.warning("User not found or session expired")
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

class Projects(Resource):
    def get(self):
        # user = User.query.filter(User.id == session.get('user_id')).first()
        # print(f"GET: {user.id}")
        # print(f"GET: {user.username}")
        return make_response(jsonify([project.to_dict() for project in Project.query.all()]))
    
    def post(self):
        print("POST: Pre-User")
        user_id = session.get('user_id')
        print("POST: Post-User")
        print(f"POST: {user_id}")
        print(f"POST: {user_id}")
        data = request.get_json()
        name = data.get('name')
        due_date = data.get('dueDate')
        due_date = datetime.strptime(due_date, '%Y-%m-%d').date()
        user_id = data.get('userId')
        print(user_id)
        if name:
            project = Project(
                name=name, 
                due_date=due_date, 
                user_id=user_id
            )
            db.session.add(project)
            db.session.commit()
            project_data = {
            'id': project.id,
            'name': project.name,
            'subtasks': [subtask.name for subtask in project.subtasks],
            'created_at': project.created_at,
            'due_date': project.due_date,
            'user_id': project.user_id
        }
            print(project.name)
            return jsonify(project_data)
        else:
            return jsonify({"error": "Name field is required"}), 400
        
api.add_resource(Projects, '/projects')

# @app.route('/projects', methods=['GET', 'POST'])
# def projects():
#     if request.method == 'GET':
#         user = User.query.filter(User.id == session.get('user_id')).first()
#         print(f"GET: {user.id}")
#         print(f"GET: {user.username}")
#         return make_response(jsonify([project.to_dict() for project in Project.query.all()]))
#     elif request.method == 'POST':
#         print("POST: Pre-User")
#         user = User.query.filter(User.id == session.get('user_id')).first()
#         print("POST: Post-User")
#         print(f"POST: {user.id}")
#         print(f"POST: {user.username}")
#         data = request.get_json()
#         name = data.get('name')
#         due_date = data.get('dueDate')
#         due_date = datetime.strptime(due_date, '%Y-%m-%d').date()
#         user_id = data.get('userId')
#         print(user_id)
#         if name:
#             project = Project(
#                 name=name, 
#                 due_date=due_date, 
#                 user_id=user_id
#             )
#             db.session.add(project)
#             db.session.commit()
#             project_data = {
#             'id': project.id,
#             'name': project.name,
#             'subtasks': [subtask.name for subtask in project.subtasks],
#             'created_at': project.created_at,
#             'due_date': project.due_date,
#             'user_id': project.user_id
#         }
#             print(project.name)
#             return jsonify(project_data)
#         else:
#             return jsonify({"error": "Name field is required"}), 400
        
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
        creator_id = data.get('creator_id')
        print(data)
        if name:
            subtask = Subtask(name=name, project_id = project_id, creator_id = creator_id)
            db.session.add(subtask)
            db.session.commit()
            subtask_data = {
            'id': subtask.id,
            'name': subtask.name,
            'project_id': subtask.project_id,
            'creator_id': subtask.creator_id
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
    position = data.get('position')

    if User.query.filter_by(username=username).first() is not None:
        return jsonify({'message': 'Username already exists'}), 400
    
    user = User(username=username, position=position)
    db.session.add(user)
    db.session.commit()
    session['user_id'] = user.id

    return jsonify(user.to_dict()), 201


if __name__ == '__main__':
    app.run(port=5555, debug=True)

