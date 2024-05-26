#!/usr/bin/env python3

# Standard library imports
from random import randint, choice as rc

# Remote library imports
from faker import Faker

# Local imports
from app import app, db
from models import Project, Subtask, User
from datetime import datetime, timedelta

if __name__ == '__main__':
    fake = Faker()
    with app.app_context():
        print("Starting seed...")
        try:
            # Seed code goes here!
            # Seed users
            for _ in range(5):  # Seed 5 users
                user = User(
                    username=fake.user_name(),  # Generate a random username
                    created_at=fake.date_time_this_year()  # Generate a random creation date within the current year
                )
                db.session.add(user)

            # Seed projects and subtasks
            for _ in range(10):  # Seed 10 projects
                project = Project(
                    name=fake.sentence().upper(),  # Generate a random sentence and convert it to all caps
                    created_at=fake.date_time_this_year(),  # Generate a random creation date within the current year
                    due_date=datetime.utcnow() + timedelta(days=randint(1, 30))  # Generate a random due date within 30 days
                )
                db.session.add(project)
                for _ in range(3):  # Seed 3 subtasks for each project
                    subtask = Subtask(
                        name=fake.sentence(),  # Generate a random sentence for subtask name
                        project=project,
                        created_at=fake.date_time_this_year()  # Generate a random creation date within the current year
                    )
                    db.session.add(subtask)

            # Commit changes to the database
            db.session.commit()
            print("Seed complete!")
        except Exception as e:
            print("Error:", e)
            db.session.rollback()  # Rollback changes if an error occurs