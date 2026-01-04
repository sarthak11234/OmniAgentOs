from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import declarative_base, relationship
from datetime import datetime
import enum

Base = declarative_base()


class TaskType(str, enum.Enum):
    TRANSCRIPTION = "transcription"
    GENERATION = "generation"
    SUMMARIZATION = "summarization"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    results = relationship("Result", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User(id={self.id}, username={self.username})>"


class Result(Base):
    """Stores results from all ML operations"""
    __tablename__ = "results"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    task_type = Column(SQLEnum(TaskType), nullable=False)
    
    # Input data (varies by task type)
    input_text = Column(Text, nullable=True)  # For generation and summarization
    input_filename = Column(String, nullable=True)  # For transcription
    
    # Output data
    output_text = Column(Text, nullable=True)
    
    # Metadata
    processing_time_seconds = Column(Integer, nullable=True)
    model_used = Column(String, nullable=True)  # e.g., "gpt-2", "whisper-small", "bart-large-cnn"
    status = Column(String, default="completed")  # completed, failed, pending
    error_message = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="results")

    def __repr__(self):
        return f"<Result(id={self.id}, user_id={self.user_id}, task_type={self.task_type})>"
