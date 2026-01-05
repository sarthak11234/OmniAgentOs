from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool
from app.core.config import settings

# Create engine with connection pooling
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,  # Verify connections before using
    pool_recycle=300,   # Recycle connections after 5 minutes
    echo=False
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
