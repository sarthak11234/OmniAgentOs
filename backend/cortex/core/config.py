from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field
import os
from pathlib import Path

class Settings(BaseSettings):
    # API Keys
    GOOGLE_API_KEY: str = Field(default="", env="GOOGLE_API_KEY")
    
    # Paths
    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent
    DATA_DIR: Path = BASE_DIR / "data"
    CHROMA_PATH: str = str(DATA_DIR / "chroma")
    
    # Model Configs
    LLM_MODEL: str = "gemini-flash-latest"
    WHISPER_MODEL: str = "base"
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

# Ensure data directories exist
os.makedirs(Path(__file__).resolve().parent.parent.parent / "data" / "chroma", exist_ok=True)
os.makedirs(Path(__file__).resolve().parent.parent.parent / "data" / "uploads", exist_ok=True)

config = Settings()
