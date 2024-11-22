# from flask import session
# from config import db
# from models import Project, User, Subtask

# def add_project(name):
#     project = Project(name=name)
#     db.session.add(project)
#     db.session.commit()
#     return project

# def get_projects():
#     return Project.query.all()

# def add_user(username):
#     user = User(username = username)
#     db.session.add(user)
#     db.session.commit()
#     session['user_id'] = user.id

# def get_users():
#     return User.query.all()

# def add_subtask(name):
#     subtask = Subtask(name = name)
#     db.session.add(subtask)
#     db.session.commit()
#     session['subtask_id'] = subtask.id

# def get_subtasks():
#     return Subtask.query.all()

# class ProjectsWithMinSubtasks(Resource):
#     def get(self, min_subtasks):
#         projects = (
#             db.session.query(Project)
#             .join(Subtask, Project.id == Subtask.project_id)
#             .group_by(Project.id)
#             .having(func.count(Subtask.id) >= min_subtasks)
#             .all()
#         )

#         project_list = [project.to_dict() for project in projects]
#         return jsonify(project_list)

# api.add_resource(ProjectsWithMinSubtasks, '/projects_with_min_subtasks/<int:min_subtasks>')

# class SubtasksWithUser(Resource):
#     def get(self, user_id):
#         subtasks = Subtask.query.join(Subtask.users).filter(User.id == user_id).all()

#         subtask_list = [subtask.to_dict() for subtask in subtasks]
#         return jsonify(subtask_list), 200

# api.add_resource(SubtasksWithUser, '/subtasks/user/<int:user_id>')

# class ProjectsWithUser(Resource):
#     def get(self, user_id):
#         projects = (
#             db.session.query(Project)
#             .join(Subtask, Project.id == Subtask.project_id)
#             .join(User, Subtask.users)
#             .filter(User.id == user_id)
#             .group_by(Project.id)
#             .all()
#         )

#         project_list = [project.to_dict() for project in projects]
#         return jsonify(project_list)

# api.add_resource(ProjectsWithUser, '/projects/with_user/<int:user_id>')

# class ProjectsWithIncompleteSubtasks(Resource):
#     def get(self):
#         projects = (
#             db.session.query(Project)
#             .join(Subtask, Project.id == Subtask.project_id)
#             .filter(Subtask.completion_status == False)
#             .group_by(Project.id)
#             .all()
#         )

#         project_list = [project.to_dict() for project in projects]
#         return jsonify(project_list)

# api.add_resource(ProjectsWithIncompleteSubtasks, '/projects/with_incomplete_subtasks')