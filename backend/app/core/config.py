import os

class Settings:
    HF_API_KEY: str = os.getenv("HF_API_KEY", "")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://omni:omni@db:5432/omniagentos")

settings = Settings()
