#!/usr/bin/env python3

# Standard library imports
from random import randint, choice as rc

# Remote library imports
from faker import Faker

# Local imports
from app import app, db
from models import Project, Subtask, User
from datetime import datetime, timedelta
# from flask_bcrypt import Bcrypt, bcrypt
from config import bcrypt

if __name__ == '__main__':
    fake = Faker()
    with app.app_context():
        print("Starting seed...")
        try:
            # Seed code goes here!
            positions = ["Manager", "Developer", "Designer", "Tester", "Administrator"]
            
            # Seed users
            for _ in range(5):
                password = fake.password()  # Generate a random password
                print(password)
                hashed_password = bcrypt.generate_password_hash(
                password.encode('utf-8'))
                user = User(
                    username=fake.user_name(),
                    created_at=fake.date_time_this_year(),
                    position=rc(positions),  # Set the hashed password
                )
                user.password_hash = password
                db.session.add(user)

            # Seed projects and subtasks
            for _ in range(10):
                project = Project(
                    name=fake.sentence().upper(),
                    created_at=fake.date_time_this_year(),
                    due_date=fake.date_time_between(start_date='now', end_date='+30d'),
                    user_id=randint(1, 5)  # Randomly assign a user_id
                )
                db.session.add(project)
                for _ in range(3):
                    subtask = Subtask(
                        name=fake.sentence(),
                        created_at=fake.date_this_year(),
                        completion_status=fake.boolean(),  # Randomly assign a completion status
                        project=project,
                        creator_id=randint(1, 5)  # Randomly assign a creator_id
                    )
                    db.session.add(subtask)

            # Commit changes to the database
            db.session.commit()
            print("here?")
            print("Seed complete!")
        except Exception as e:
            print("Error:", e)
            db.session.rollback()
