#!/usr/bin/env python3

# Standard library imports

# Remote library imports
from flask import request, jsonify, session
from flask_restful import Resource
from flask_sqlalchemy import SQLAlchemy
from crud import add_project, get_projects

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


if __name__ == '__main__':
    app.run(port=5555, debug=True)

