"""Pydantic models for API requests/responses"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from enum import Enum


class TaskType(str, Enum):
    TRANSCRIPTION = "transcription"
    GENERATION = "generation"
    SUMMARIZATION = "summarization"


# Result schemas
class ResultBase(BaseModel):
    task_type: TaskType
    input_text: Optional[str] = None
    input_filename: Optional[str] = None
    output_text: Optional[str] = None
    processing_time_seconds: Optional[int] = None
    model_used: Optional[str] = None
    status: str = "completed"
    error_message: Optional[str] = None


class ResultCreate(ResultBase):
    pass


class ResultResponse(ResultBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ResultListResponse(BaseModel):
    total: int
    results: list[ResultResponse]


# User schemas
class UserBase(BaseModel):
    username: str
    email: str


class UserCreate(UserBase):
    pass


class UserResponse(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class UserDetailResponse(UserResponse):
    results_count: int
    recent_results: list[ResultResponse]
