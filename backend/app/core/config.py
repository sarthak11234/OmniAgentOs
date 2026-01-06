import os

class Settings:
    HF_API_KEY: str = os.getenv("HF_API_KEY", "")
    # Default to SQLite for local dev, can override with DATABASE_URL env var
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "sqlite:///omniagentos.db"
    )

settings = Settings()
