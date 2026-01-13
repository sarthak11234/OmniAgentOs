from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.deps import get_db
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
async def summarize_endpoint(request: SummarizationRequest, db: Session = Depends(get_db)):
    """
    Summarize text using BART model
    
    Args:
        request: SummarizationRequest with text and optional max_length
    
    Returns:
        SummarizationResponse with original length, summary, and summary length
    """
    import time
    start_time = time.perf_counter()
    
    summary = await summarize_text(request.text, request.max_length)
    
    # Calculate processing time
    elapsed_time = int(time.perf_counter() - start_time)
    
    # Save result to database
    from app.services.database_service import DatabaseService
    from app.db import models
    
    # TODO: Get actual user_id from auth
    user_id = 1
    
    DatabaseService.create_result(
        session=db,
        user_id=user_id,
        task_type=models.TaskType.SUMMARIZATION,
        input_text=request.text,
        output_text=summary,
        model_used="bart-large-cnn",
        processing_time_seconds=elapsed_time
    )
    
    return SummarizationResponse(
        original_length=len(request.text),
        summary=summary,
        summary_length=len(summary)
    )
