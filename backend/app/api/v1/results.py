"""Results API endpoints"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core import database
from app.db import models
from app.schemas.result import (
    ResultResponse,
    ResultListResponse,
    ResultCreate,
    TaskType
)
from app.services.database_service import DatabaseService
from typing import Optional

router = APIRouter()


def get_db():
    """Dependency to get database session"""
    db = Session(database.engine)
    try:
        yield db
    finally:
        db.close()


@router.post("/results", response_model=ResultResponse)
async def create_result(
    result: ResultCreate,
    user_id: int = Query(..., description="User ID"),
    db: Session = Depends(get_db)
):
    """
    Create a new result record
    
    Args:
        result: Result data
        user_id: User ID who owns this result
        db: Database session
    
    Returns:
        Created result
    """
    # Verify user exists
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db_result = DatabaseService.create_result(
        session=db,
        user_id=user_id,
        task_type=models.TaskType(result.task_type.value),
        input_text=result.input_text,
        input_filename=result.input_filename,
        output_text=result.output_text,
        processing_time_seconds=result.processing_time_seconds,
        model_used=result.model_used,
        status=result.status,
        error_message=result.error_message
    )
    return db_result


@router.get("/results/{result_id}", response_model=ResultResponse)
async def get_result(
    result_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific result by ID"""
    result = DatabaseService.get_result(db, result_id)
    if not result:
        raise HTTPException(status_code=404, detail="Result not found")
    return result


@router.get("/users/{user_id}/results", response_model=ResultListResponse)
async def get_user_results(
    user_id: int,
    task_type: Optional[str] = Query(None, description="Filter by task type"),
    limit: int = Query(50, description="Number of results to return"),
    skip: int = Query(0, description="Number of results to skip"),
    db: Session = Depends(get_db)
):
    """
    Get results for a specific user
    
    Args:
        user_id: User ID
        task_type: Optional filter by task type (transcription, generation, summarization)
        limit: Max results to return
        skip: Number of results to skip (for pagination)
    
    Returns:
        List of results
    """
    # Verify user exists
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Filter by task type if provided
    filter_task_type = None
    if task_type:
        try:
            filter_task_type = models.TaskType(task_type)
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid task type. Must be one of: {', '.join([t.value for t in models.TaskType])}"
            )
    
    results = DatabaseService.get_user_results(
        session=db,
        user_id=user_id,
        task_type=filter_task_type,
        limit=limit,
        skip=skip
    )
    
    return ResultListResponse(
        total=len(results),
        results=results
    )


@router.delete("/results/{result_id}")
async def delete_result(
    result_id: int,
    db: Session = Depends(get_db)
):
    """Delete a result by ID"""
    if not DatabaseService.delete_result(db, result_id):
        raise HTTPException(status_code=404, detail="Result not found")
    return {"message": "Result deleted successfully"}


@router.get("/stats")
async def get_stats(
    user_id: int = Query(..., description="User ID"),
    db: Session = Depends(get_db)
):
    """
    Get statistics for a user
    
    Args:
        user_id: User ID
    
    Returns:
        Statistics about user's results
    """
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Count results by type
    stats = {}
    for task_type in models.TaskType:
        count = db.query(models.Result).filter(
            models.Result.user_id == user_id,
            models.Result.task_type == task_type
        ).count()
        stats[task_type.value] = count
    
    total = sum(stats.values())
    
    return {
        "user_id": user_id,
        "total_results": total,
        "by_type": stats
    }
