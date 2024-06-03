from flask import session
from config import db
from models import Project, User, Subtask

def add_project(name):
    project = Project(name=name)
    db.session.add(project)
    db.session.commit()
    return project

def get_projects():
    return Project.query.all()

def add_user(username):
    user = User(username = username)
    db.session.add(user)
    db.session.commit()
    session['user_id'] = user.id

def get_users():
    return User.query.all()

def add_subtask(name):
    subtask = Subtask(name = name)
    db.session.add(subtask)
    db.session.commit()
    session['subtask_id'] = subtask.id

def get_subtasks():
    return Subtask.query.all()








# user_subtask_association = Table('user_subtask_association', db.Model.metadata,
#     Column('id', Integer, primary_key=True),
#     Column('user_id', Integer, ForeignKey('users.id')),
#     Column('subtask_id', Integer, ForeignKey('subtasks.id')),
#     Column('priority', Integer, default=0)  # Priority attribute
# )

# class AddUserToSubtask(Resource):
#     def post(self, subtask_id):
#         data = request.json
#         user_id = data.get('user_id')
#         priority = data.get('priority')  # Add priority attribute
        
#         if not user_id:
#             return {'error': 'User ID is required'}, 400

#         subtask = Subtask.query.get(subtask_id)
#         user = User.query.get(user_id)

#         if not subtask:
#             return {'error': 'Subtask not found'}, 404
        
#         if not user:
#             return {'error': 'User not found'}, 404
        
#         if any(sub_user.username == user.username for sub_user in subtask.users):
#             return {'message': 'User is already associated with the subtask'}, 200

#         # Associate user with subtask and set priority
#         db.session.execute(user_subtask_association.insert().values(user_id=user_id, subtask_id=subtask_id, priority=priority))
#         db.session.commit()

#         return {'message': 'User added to subtask successfully'}, 200

# function addUserToSubtask(subtaskId) {
#     const subtask = project.subtasks.find(subtask => subtask.id === subtaskId);
#     const isUserAlreadyAttached = subtask.users_attached.some(user => user.id === parseInt(userToBeAdded));

#     if (isUserAlreadyAttached) {
#         alert("This user is already associated with the subtask");
#         return;
#     }

#     // Add priority to the payload
    # const payload = {
    #     user_id: userToBeAdded,
    #     priority: priority // Pass selected priority
    # };

#     fetch(`/subtasks/${subtaskId}/add_user`, {
#         method: 'POST',
#         headers: {
#             'Content-Type': 'application/json',
#         },
#         body: JSON.stringify(payload), // Include priority in the request body
#     })
#     .then(response => {
#         if (!response.ok) {
#             throw new Error('Failed to add user to subtask');
#         }
#         fetch(`/projects/${id}`)
#             .then(response => {
#                 if (!response.ok) {
#                     throw new Error('Failed to fetch project');
#                 }
#                 return response.json();
#             })
#             .then(data => {
#                 setProject(data);
#             })
#             .catch(error => {
#                 console.error('Error fetching project:', error);
#             });
#     })
#     .catch(error => {
#         console.error('Error adding user to subtask:', error);
#     });
# }