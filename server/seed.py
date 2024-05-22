#!/usr/bin/env python3

# Standard library imports
from random import randint, choice as rc

# Remote library imports
from faker import Faker

# Local imports
from app import app, db
from models import Project

if __name__ == '__main__':
    fake = Faker()
    with app.app_context():
        print("Starting seed...")
        try:
            # Seed code goes here!
            for _ in range(10):  # Seed 10 projects
                project = Project(
                    name=fake.word()  # Generate a random word for project name
                )
                db.session.add(project)
            # Commit changes to the database
            db.session.commit()
            print("Seed complete!")
        except Exception as e:
            print("Error:", e)
            db.session.rollback()  # Rollback changes if an error occurs
