"""Test database connection"""
import os
from dotenv import load_dotenv

# Load .env file
load_dotenv()

print("=" * 60)
print("Environment Variables:")
print("=" * 60)
print(f"DATABASE_URL: {os.getenv('DATABASE_URL', 'NOT SET')}")
print(f"HF_API_KEY: {os.getenv('HF_API_KEY', 'NOT SET')}")
print()

# Try to create database engine
try:
    from sqlalchemy import create_engine, text
    
    # Use SQLite directly
    db_url = "sqlite:///omniagentos.db"
    print(f"Attempting to connect to: {db_url}")
    
    engine = create_engine(
        db_url,
        connect_args={"check_same_thread": False},
        echo=True  # Show SQL queries
    )
    
    # Test connection
    with engine.connect() as conn:
        result = conn.execute(text("SELECT 1"))
        print("✅ Database connection successful!")
        
    # Create tables
    print("\nCreating tables...")
    from app.db import models
    models.Base.metadata.create_all(engine)
    print("✅ Tables created successfully!")
    
    # List tables
    from sqlalchemy import inspect
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    print(f"\nTables in database: {tables}")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
