from app.core import database
from app.db import models
from sqlalchemy.exc import IntegrityError, OperationalError, SQLAlchemyError
import time


def run_migrations_and_seed():
    """Create tables and insert seed data if missing."""
    engine = database.engine
    
    # Retry logic for database connection
    max_retries = 60
    retry_delay = 0.5
    
    connection_successful = False
    
    for attempt in range(max_retries):
        try:
            models.Base.metadata.create_all(engine)
            connection_successful = True
            print("✅ Database migrations completed!")
            break
        except (OperationalError, SQLAlchemyError) as e:
            if attempt < max_retries - 1:
                print(f"🔄 Database not ready, retrying... ({attempt + 1}/{max_retries})")
                print(f"   Error: {str(e)}")
                time.sleep(retry_delay)
            else:
                print(f"⚠️ Could not connect to database after {max_retries} attempts.")
                print(f"⚠️ Error: {str(e)}")
                print(f"⚠️ Continuing anyway - core ML features will work, but DB features may be unavailable")
                return

    if connection_successful:
        from sqlalchemy.orm import Session

        try:
            with Session(engine) as session:
                # Skip seeding default user - users should register through auth endpoint
                # The User model now requires password hashing
                pass
        except Exception as e:
            print(f"⚠️ Warning: Could not seed database: {e}")


if __name__ == "__main__":
    run_migrations_and_seed()
