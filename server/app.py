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
from models import User

# Views go here!
class Login(Resource):

    def post(self):
        user = User.query.filter(
            User.username == request.get_json()['username']
        ).first()

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
                'subtasks': [subtask.name for subtask in project.subtasks]  # Retrieve subtask names
            }
            project_data.append(project_info)
        return jsonify(project_data)
    elif request.method == 'POST':
        data = request.get_json()
        name = data.get('name')
        if name:
            add_project(name)
            return jsonify({"message": "Project added successfully"})
        else:
            return jsonify({"error": "Name field is required"}), 400
        
@app.route('/users', methods=['GET'])
def get_users():
    users = User.query.all()
    user_data = [{'id': user.id, 'username': user.username} for user in users]
    return jsonify(user_data)

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')

    # Check if username or email already exists
    if User.query.filter_by(username=username).first() is not None:
        return jsonify({'message': 'Username already exists'}), 400
    
    add_user(username)

    return jsonify({'message': 'User registered successfully'}), 201


if __name__ == '__main__':
    app.run(port=5555, debug=True)

