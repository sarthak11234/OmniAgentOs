from app.core import database
from app.db import models
from sqlalchemy.exc import IntegrityError


def run_migrations_and_seed():
    """Create tables and insert seed data if missing."""
    engine = database.engine
    models.Base.metadata.create_all(engine)

    from sqlalchemy.orm import Session

    with Session(engine) as session:
        # seed a default user if none exist
        existing = session.query(models.User).first()
        if not existing:
            try:
                user = models.User(username="admin", email="admin@example.com")
                session.add(user)
                session.commit()
                print("Seeded default user: admin")
            except IntegrityError:
                session.rollback()
                print("Seed user already exists")


if __name__ == "__main__":
    run_migrations_and_seed()
