import os

class Settings:
    HF_API_KEY: str = os.getenv("HF_API_KEY", "")
    # Default to localhost for local dev, db for Docker
    _db_host = os.getenv("DB_HOST", "localhost")
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        f"postgresql://omni:omni@{_db_host}:5432/omniagentos"
    )

settings = Settings()
