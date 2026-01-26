from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user_optional, get_user_id_or_default
from pydantic import BaseModel
from app.agents.text_agent import generate_text

router = APIRouter()


class TextGenerationRequest(BaseModel):
    prompt: str
    max_length: int = 256


class TextGenerationResponse(BaseModel):
    prompt: str
    generated_text: str


@router.post("/generate", response_model=TextGenerationResponse)
async def generate_text_endpoint(
    request: TextGenerationRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user_optional)
):
    """
    Generate text using Llama model
    
    Args:
        request: TextGenerationRequest with prompt and optional max_length
        current_user: Optional authenticated user
    
    Returns:
        TextGenerationResponse with original prompt and generated text
    """
    import time
    start_time = time.perf_counter()
    
    result = await generate_text(request.prompt, request.max_length)
    
    # Calculate processing time
    elapsed_time = int(time.perf_counter() - start_time)
    
    # Save result to database
    from app.services.database_service import DatabaseService
    from app.db import models
    
    user_id = get_user_id_or_default(current_user)
    
    DatabaseService.create_result(
        session=db,
        user_id=user_id,
        task_type=models.TaskType.GENERATION,
        input_text=request.prompt,
        output_text=result,
        model_used="llama-2-7b-chat",
        processing_time_seconds=elapsed_time
    )
    
    return TextGenerationResponse(
        prompt=request.prompt,
        generated_text=result
    )
