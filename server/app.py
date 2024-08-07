#!/usr/bin/env python3

# Standard library imports

# Remote library imports
from flask import request, jsonify, session, make_response
from flask_restful import Resource
from flask_sqlalchemy import SQLAlchemy
from flask_mail import Message
from datetime import datetime
from sqlalchemy.sql import func

# Local imports
from config import app, db, api, bcrypt, mail

# Add your model imports
from models import User, Project, Subtask, Comment, user_subtask_association

# Views go here!

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

class CheckSession(Resource):
    def get(self):
        user_id = session.get('user_id')
        
        user = User.query.filter(User.id == user_id).first()
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

class Projects(Resource):
    def get(self):
        return make_response(jsonify([project.to_dict() for project in Project.query.all()]))
    
    def post(self):
        data = request.get_json()
        name = data.get('name')
        due_date = data.get('dueDate')
        due_date = datetime.strptime(due_date, '%Y-%m-%d').date()
        user_id = data.get('userId')
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
            return jsonify(project_data)
        else:
            return jsonify({"error": "Name field is required"}), 400
        
api.add_resource(Projects, '/projects')


class ProjectID(Resource):
    def get(self, id):
        project = Project.query.get(id)

        if project:
            project_data = {
                'id': project.id,
                'name': project.name,
                'subtasks': [subtask.to_dict() for subtask in project.subtasks],
                'created_at': project.created_at,
                'due_date': project.due_date,
                'user_id': project.user_id
            }
            return jsonify(project_data)
        else:
            return jsonify({'error': 'Project not found'}), 404
        
api.add_resource(ProjectID, '/projects/<id>')

class Subtasks(Resource):
    def get(self, id):
        project = Project.query.get(id)

        if project:
            subtasks_data = []
            for subtask in project.subtasks:
                subtask_dict = subtask.to_dict()
                subtask_dict["comments"] = [comment.to_dict() for comment in subtask.comments]
                subtasks_data.append(subtask_dict)
            return jsonify(subtasks_data)
        else:
            return jsonify({'error': 'Project not found'}), 404
        
    def post(self, id):
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
        project = Project.query.get(project_id)
        subtask = Subtask.query.get(subtask_id)

        if not project:
            return {"message": "Project not found"}, 404
        if not subtask:
            return {"message": "Subtask not found"}, 404

        subtask.users.clear()
        db.session.commit()
        db.session.delete(subtask)
        db.session.commit()

        return {"message": "Subtask deleted successfully"}, 200

api.add_resource(SubtaskId, '/projects/<int:project_id>/subtasks/<int:subtask_id>')

class Users(Resource):
    def get(self):
        return make_response(jsonify([user.to_dict() for user in User.query.all()]))
    
api.add_resource(Users, '/users')

class AddUserToSubtask(Resource):
    def post(self, subtask_id):
        data = request.json
        user_id = data.get('user_id')
        priority = data.get('priority')

        # Validate priority
        if priority not in ('low', 'medium', 'high', 'severe'):
            return {'error': 'Invalid priority level'}, 400

        # Check if user_id is provided
        if not user_id:
            return {'error': 'User ID is required'}, 400

        # Fetch subtask and user from database
        subtask = Subtask.query.get(subtask_id)
        user = User.query.get(user_id)

        # Check if subtask exists
        if not subtask:
            return {'error': 'Subtask not found'}, 404

        # Check if user exists
        if not user:
            return {'error': 'User not found'}, 404

        # Check if user is already associated with the subtask
        if any(sub_user.username == user.username for sub_user in subtask.users):
            return {'message': 'User is already associated with the subtask'}, 200

        try:
            # Associate user with subtask
            db.session.execute(user_subtask_association.insert().values(user_id=user.id, subtask_id=subtask.id, priority=priority))
            db.session.commit()

            # Send an email to the user
            self.send_email(user.email, subtask.name, priority)
        except Exception as e:
            db.session.rollback()
            return {'error': f'Failed to add user to subtask: {str(e)}'}, 500

        return {'message': 'User added to subtask successfully'}, 200

    def send_email(self, email, subtask_name, priority):
        try:
            msg = Message(
                subject="You've been added to a new subtask",
                recipients=[email],
                body=f"Hello, you have been added to the subtask: {subtask_name} with {priority} priority."
            )
            mail.send(msg)
            print(f"Email sent to {email} about subtask: {subtask_name} with {priority} priority.")
        except Exception as e:
            print(f"Failed to send email to {email}: {str(e)}")

api.add_resource(AddUserToSubtask, '/subtasks/<int:subtask_id>/add_user')

class Register(Resource):
    def post(self):
        data = request.get_json()
        username = data['username']
        position = data['position']
        password = data['password']
        email = data['email']

        if User.query.filter_by(username=username).first() is not None:
            return jsonify({'message': 'Username already exists'}), 400

        user = User(username=username, position=position, email=email)
        user.password_hash = password
    
        db.session.add(user)
        db.session.commit()

        session['user_id'] = user.id
       
        return user.to_dict()
    
api.add_resource(Register, '/register')

class ProjectsWithMinSubtasks(Resource):
    def get(self, min_subtasks):
        projects = (
            db.session.query(Project)
            .join(Subtask, Project.id == Subtask.project_id)
            .group_by(Project.id)
            .having(func.count(Subtask.id) >= min_subtasks)
            .all()
        )

        project_list = [project.to_dict() for project in projects]
        return jsonify(project_list)

api.add_resource(ProjectsWithMinSubtasks, '/projects_with_min_subtasks/<int:min_subtasks>')

class SubtasksWithUser(Resource):
    def get(self, user_id):
        # Query subtasks associated with the given user
        subtasks = Subtask.query.join(Subtask.users).filter(User.id == user_id).all()

        # Convert subtasks to dictionary format
        subtask_list = [subtask.to_dict() for subtask in subtasks]
        return jsonify(subtask_list), 200

# Register the resource with the API
api.add_resource(SubtasksWithUser, '/subtasks/user/<int:user_id>')

class ProjectsWithUser(Resource):
    def get(self, user_id):
        # Query projects that have subtasks with the specified user attached
        projects = (
            db.session.query(Project)
            .join(Subtask, Project.id == Subtask.project_id)
            .join(User, Subtask.users)
            .filter(User.id == user_id)
            .group_by(Project.id)
            .all()
        )

        # Convert projects to dictionary format
        project_list = [project.to_dict() for project in projects]
        return jsonify(project_list)

# Register the resource with the API
api.add_resource(ProjectsWithUser, '/projects/with_user/<int:user_id>')

class ProjectsWithIncompleteSubtasks(Resource):
    def get(self):
        # Query projects that have at least one incomplete subtask
        projects = (
            db.session.query(Project)
            .join(Subtask, Project.id == Subtask.project_id)
            .filter(Subtask.completion_status == False)  # Assuming False represents incomplete
            .group_by(Project.id)
            .all()
        )

        # Convert projects to dictionary format
        project_list = [project.to_dict() for project in projects]
        return jsonify(project_list)

# Register the resource with the API
api.add_resource(ProjectsWithIncompleteSubtasks, '/projects/with_incomplete_subtasks')

class UpdateUsername(Resource):
    def post(self):
        user_id = session.get('user_id')
        if not user_id:
            return {'message': '401: Not Authorized'}, 401

        data = request.get_json()
        new_username = data.get('username')

        if not new_username:
            return {'message': 'Missing username'}, 400

        user = User.query.get(user_id)
        if not user:
            return {'message': 'User not found'}, 404

        user.username = new_username
        db.session.commit()

        return user.to_dict(), 200

api.add_resource(UpdateUsername, '/update_username')

class UpdateEmail(Resource):
    def post(self):
        user_id = session.get('user_id')
        if not user_id:
            return {'message': '401: Not Authorized'}, 401

        data = request.get_json()
        new_email = data.get('email')

        if not new_email:
            return {'message': 'Missing email'}, 400

        user = User.query.get(user_id)
        if not user:
            return {'message': 'User not found'}, 404

        user.email = new_email
        db.session.commit()

        return user.to_dict(), 200

api.add_resource(UpdateEmail, '/update_email')

class UpdatePassword(Resource):
    def post(self):
        user_id = session.get('user_id')
        if not user_id:
            return {'message': '401: Not Authorized'}, 401

        data = request.get_json()
        old_password = data.get('old_password')
        new_password = data.get('new_password')

        if not old_password or not new_password:
            return {'message': 'Missing old_password or new_password'}, 400

        user = User.query.get(user_id)
        if not user:
            return {'message': 'User not found'}, 404

        if not user.authenticate(old_password):
            return {'message': 'Invalid current password'}, 400

        user.password_hash = new_password
        db.session.commit()

        return {'message': 'Password updated successfully'}, 200

# Register the UpdatePassword resource with Flask-Restful
api.add_resource(UpdatePassword, '/update_password')

class ProjectsByDueDate(Resource):
    def get(self, year, month, day):
        try:
            due_date = datetime(year, month, day)
        except ValueError:
            return jsonify({"error": "Invalid date format"}), 400

        projects = Project.query.filter(Project.due_date == due_date).all()

        if not projects:
            return jsonify({"message": "No projects found for the given due date"}), 404

        project_list = [project.to_dict() for project in projects]
        return jsonify(project_list)

# Register the resource with the API
api.add_resource(ProjectsByDueDate, '/projects/due_date/<int:year>/<int:month>/<int:day>')

class CommentResource(Resource):
    def post(self, subtask_id):
        data = request.get_json()

        if 'text' not in data or 'username' not in data:
            return {'error': 'Missing text or username'}, 400

        text = data['text']
        username = data['username']

        subtask = Subtask.query.get(subtask_id)
        if not subtask:
            return {'error': 'Subtask not found'}, 404

        comment = Comment(
            text=text,
            username=username,
            subtask_id=subtask_id
        )

        db.session.add(comment)
        db.session.commit()

        return comment.to_dict(), 201
    
api.add_resource(CommentResource, '/subtasks/<int:subtask_id>/comments')

@app.route('/comments', methods=['GET'])
def get_comments():
    comments = Comment.query.all()
    return jsonify([comment.to_dict() for comment in comments])

class GetComments(Resource):
    def get_comments(self, subtask_id):
        subtask = Subtask.query.get(subtask_id)
        if not subtask:
            return jsonify({'error': 'Subtask not found'}), 404
        comments = Comment.query.filter_by(subtask_id=subtask_id).all()
        return jsonify([comment.to_dict() for comment in comments])
    
api.add_resource(GetComments, '/subtasks/<int:subtask_id>/comments')

if __name__ == '__main__':
    app.run(port=5555)