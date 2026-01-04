"""Database service for managing users and results"""
from sqlalchemy.orm import Session
from app.db import models
from typing import Optional, List
from datetime import datetime


class DatabaseService:
    """Service for database operations"""
    
    @staticmethod
    def get_or_create_user(session: Session, username: str, email: str) -> models.User:
        """Get existing user or create new one"""
        user = session.query(models.User).filter(models.User.username == username).first()
        if not user:
            user = models.User(username=username, email=email)
            session.add(user)
            session.commit()
            session.refresh(user)
        return user
    
    @staticmethod
    def create_result(
        session: Session,
        user_id: int,
        task_type: models.TaskType,
        input_text: Optional[str] = None,
        input_filename: Optional[str] = None,
        output_text: Optional[str] = None,
        processing_time_seconds: Optional[int] = None,
        model_used: Optional[str] = None,
        status: str = "completed",
        error_message: Optional[str] = None
    ) -> models.Result:
        """Create a new result record"""
        result = models.Result(
            user_id=user_id,
            task_type=task_type,
            input_text=input_text,
            input_filename=input_filename,
            output_text=output_text,
            processing_time_seconds=processing_time_seconds,
            model_used=model_used,
            status=status,
            error_message=error_message
        )
        session.add(result)
        session.commit()
        session.refresh(result)
        return result
    
    @staticmethod
    def get_user_results(
        session: Session,
        user_id: int,
        task_type: Optional[models.TaskType] = None,
        limit: int = 50,
        skip: int = 0
    ) -> List[models.Result]:
        """Get user's results, optionally filtered by task type"""
        query = session.query(models.Result).filter(models.Result.user_id == user_id)
        
        if task_type:
            query = query.filter(models.Result.task_type == task_type)
        
        return query.order_by(models.Result.created_at.desc()).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_result(session: Session, result_id: int) -> Optional[models.Result]:
        """Get a specific result"""
        return session.query(models.Result).filter(models.Result.id == result_id).first()
    
    @staticmethod
    def delete_result(session: Session, result_id: int) -> bool:
        """Delete a result"""
        result = session.query(models.Result).filter(models.Result.id == result_id).first()
        if result:
            session.delete(result)
            session.commit()
            return True
        return False
