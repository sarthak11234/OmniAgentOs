"""Simple script to initialize the database"""
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.db.migrate import run_migrations_and_seed

if __name__ == "__main__":
    print("Initializing database...")
    run_migrations_and_seed()
    print("Database initialization complete!")
