#!/usr/bin/env python3

# Standard library imports

# Remote library imports
from flask import request, jsonify
from flask_restful import Resource
from flask_sqlalchemy import SQLAlchemy
from crud import add_project, get_projects

# Local imports
from config import app, db, api
# Add your model imports


# Views go here!

@app.route('/')
def index():
    return '<h1>Project Server</h1>'

@app.route('/projects', methods=['GET', 'POST'])
def projects():
    if request.method == 'GET':
        projects = get_projects()
        return jsonify([project.__dict__ for project in projects])
    elif request.method == 'POST':
        data = request.get_json()
        name = data.get('name')
        if name:
            add_project(name)
            return jsonify({"message": "Project added successfully"})
        else:
            return jsonify({"error": "Name field is required"}), 400


if __name__ == '__main__':
    app.run(port=5555, debug=True)

