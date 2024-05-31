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
#     open_access_list = [
#         'signup',
#         'login',
#         'check_session'
#     ]

#     if (request.endpoint) not in open_access_list and (not session.get('user_id')):
#         return {'error': '401 Unauthorized'}, 401

class Login(Resource):

    def post(self):
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')

        if not username or not password:
            return {'message': 'Missing username or password'}, 400

        user = User.query.filter_by(username=username).first()

        if not user or not user.authenticate(password):
            return {'message': 'Invalid username or password'}, 401

        session['user_id'] = user.id
        app.logger.debug(f"Session after setting user ID: {session}")
        
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
        return make_response(jsonify([project.to_dict() for project in Project.query.all()]))
    
    def post(self):
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


class ProjectID(Resource):
    def get(self, id):
        print("Received project ID:", id)
        project = Project.query.get(id)

        if project:
            project_data = {
                'id': project.id,
                'name': project.name,
                'subtasks': [subtask.to_dict() for subtask in project.subtasks],
                'created_at': project.created_at,
                'due-date': project.due_date,
                'completion_status': project.completion_status,
                'user_id': project.user_id
            }
            print(project.name)
            return jsonify(project_data)
        else:
            return jsonify({'error': 'Project not found'}), 404
        
api.add_resource(ProjectID, '/projects/<id>')

class Subtasks(Resource):
    def get(self, id):
        print("Received project ID:", id)
        project = Project.query.get(id)

        if project:
            subtasks_data = []
            for subtask in project.subtasks:
                subtasks_data.append(subtask.to_dict())
            return jsonify(subtasks_data)
        else:
            return jsonify({'error': 'Project not found'}), 404
        
    def post(self, id):
        print('HI')
        data = request.get_json()
        name = data.get('name')
        project_id = data.get('project_id')
        creator_id = data.get('creator_id')
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
        
api.add_resource(Subtasks, '/projects/<id>/subtasks')

class SubtaskId(Resource):
    def get(self, project_id, subtask_id):
        project = Project.query.get(project_id)

        if project:
            subtask = Subtask.query.get(subtask_id)

            if subtask:
                subtask_data = subtask.to_dict()
                subtask_data['created_at'] = subtask.created_at.strftime('%Y-%m-%dT%H:%M:%S')
                return subtask_data, 200
            else:
                return {"message": "Subtask not found"}, 404
        else:
            return {"message": "Project not found"}, 404
        
    def patch(self, project_id, subtask_id):
        data = request.get_json()

        project = Project.query.get(project_id)
        subtask = Subtask.query.get(subtask_id)

        if not project:
            return {"message": "Project not found"}, 404
        if not subtask:
            return {"message": "Subtask not found"}, 404

        if 'completion_status' in data:
            subtask.completion_status = data['completion_status']
            db.session.commit()
            return {"message": "Subtask completion status updated successfully"}, 200
        else:
            return {"error": "Missing 'completion_status' in request body"}, 400
        
    def delete(self, project_id, subtask_id):
        # Retrieve the project and subtask from the database
        project = Project.query.get(project_id)
        subtask = Subtask.query.get(subtask_id)

        # Check if both project and subtask exist
        if not project:
            return {"message": "Project not found"}, 404
        if not subtask:
            return {"message": "Subtask not found"}, 404

        # Delete the subtask
        db.session.delete(subtask)
        db.session.commit()

        return {"message": "Subtask deleted successfully"}, 200

api.add_resource(SubtaskId, '/projects/<int:project_id>/subtasks/<int:subtask_id>')

class Users(Resource):
    def get(self):
        return make_response(jsonify([user.to_dict() for user in User.query.all()]))
    
api.add_resource(Users, '/users')

# class Register(Resource):
#     def post(self):
#         data = request.get_json()
#         username = data.get('username')
#         position = data.get('position')

#         if User.query.filter_by(username=username).first() is not None:
#             return jsonify({'message': 'Username already exists'}), 400
    
#         user = User(username=username, position=position)
#         print(user)
#         db.session.add(user)
#         db.session.commit()
#         session['user_id'] = user.id

#         return jsonify(user.to_dict()), 201
    
# api.add_resource(Register, '/register')

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    position = data.get('position')

    if User.query.filter_by(username=username).first() is not None:
        return jsonify({'message': 'Username already exists'}), 400
    
    user = User(username=username, position=position)
    print(user)
    db.session.add(user)
    db.session.commit()
    session['user_id'] = user.id

    return jsonify(user.to_dict()), 201

if __name__ == '__main__':
    app.run(port=5555, debug=True)

