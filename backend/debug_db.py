from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.db import models
import sys
import os

# Add current dir to path to import app modules
sys.path.append(os.getcwd())

engine = create_engine("sqlite:///./app.db")
SessionLocal = sessionmaker(bind=engine)
session = SessionLocal()

print("--- Recent Results ---")
results = session.query(models.Result).order_by(models.Result.id.desc()).limit(5).all()

for r in results:
    print(f"ID: {r.id}, Type: {r.task_type}, Status: {r.status}")
    print(f"Input: {r.input_text[:50]}...")
    print(f"Output: {r.output_text}")
    print(f"Error: {r.error_message}")
    print("-" * 20)

session.close()
