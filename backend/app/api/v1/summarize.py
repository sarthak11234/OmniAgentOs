from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user_optional, get_user_id_or_default
from pydantic import BaseModel
from app.agents.summarize_agent import summarize_text

# Disable redirect on trailing slash
router = APIRouter(redirect_slashes=False)


class SummarizationRequest(BaseModel):
    text: str
    max_length: int = 150


class SummarizationResponse(BaseModel):
    original_length: int
    summary: str
    summary_length: int


@router.post("", response_model=SummarizationResponse)
async def summarize_endpoint(
    request: SummarizationRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user_optional)
):
    """
    Summarize text using BART model
    
    Args:
        request: SummarizationRequest with text and optional max_length
        current_user: Optional authenticated user
    
    Returns:
        SummarizationResponse with original length, summary, and summary length
    """
    import time
    start_time = time.perf_counter()
    
    try:
        summary = await summarize_text(request.text, request.max_length)
        
        # Calculate processing time
        elapsed_time = int(time.perf_counter() - start_time)
        
        # Try to save result to database (optional - won't fail the request)
        try:
            from app.services.database_service import DatabaseService
            from app.db import models
            
            user_id = get_user_id_or_default(current_user)
            
            DatabaseService.create_result(
                session=db,
                user_id=user_id,
                task_type=models.TaskType.SUMMARIZATION,
                input_text=request.text,
                output_text=summary,
                model_used="distilbart-cnn-12-6",
                processing_time_seconds=elapsed_time
            )
        except Exception as db_error:
            print(f"Warning: Could not save result to database: {db_error}")
        
        return SummarizationResponse(
            original_length=len(request.text),
            summary=summary,
            summary_length=len(summary)
        )
    except Exception as e:
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail=f"Summarization failed: {str(e)}")
