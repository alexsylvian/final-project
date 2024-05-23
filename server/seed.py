#!/usr/bin/env python3

# Standard library imports
from random import randint, choice as rc

# Remote library imports
from faker import Faker

# Local imports
from app import app, db
from models import Project, Subtask, User

if __name__ == '__main__':
    fake = Faker()
    with app.app_context():
        print("Starting seed...")
        try:
            # Seed code goes here!
            # Seed users
            for _ in range(5):  # Seed 5 users
                user = User(
                    username=fake.user_name()  # Generate a random username
                )
                db.session.add(user)

            # Seed projects and subtasks
            for _ in range(10):  # Seed 10 projects
                project = Project(
                    name=fake.word()  # Generate a random word for project name
                )
                db.session.add(project)
                for _ in range(3):  # Seed 3 subtasks for each project
                    subtask = Subtask(name=fake.sentence(), project=project)
                    db.session.add(subtask)

            # Commit changes to the database
            db.session.commit()
            print("Seed complete!")
        except Exception as e:
            print("Error:", e)
            db.session.rollback()  # Rollback changes if an error occurs
