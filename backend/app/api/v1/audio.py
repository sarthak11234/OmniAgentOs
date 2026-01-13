from fastapi import APIRouter, UploadFile, File, Depends
from sqlalchemy.orm import Session
from app.api.deps import get_db
from pydantic import BaseModel
from app.agents.audio_agent import transcribe_audio

router = APIRouter()


class TranscriptionResponse(BaseModel):
    filename: str
    transcript: str


@router.post("/transcribe", response_model=TranscriptionResponse)
async def transcribe_endpoint(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """
    Transcribe audio file using Whisper model
    
    Args:
        file: Audio file upload
        db: Database session
    
    Returns:
        TranscriptionResponse with filename and transcript
    """
    import time
    start_time = time.perf_counter()
    
    try:
        transcript = await transcribe_audio(file)
        
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
            task_type=models.TaskType.TRANSCRIPTION,
            input_filename=file.filename,
            output_text=transcript,
            model_used="whisper-large-v3",
            processing_time_seconds=elapsed_time
        )
        
        return TranscriptionResponse(
            filename=file.filename,
            transcript=transcript
        )
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"Transcription Endpoint Error: {e}")
        print(f"Traceback: {error_trace}")
        
        # Return the actual error to the client for debugging
        from fastapi import HTTPException
        raise HTTPException(
            status_code=500,
            detail=f"Transcription failed: {str(e)} | Type: {type(e).__name__}"
        )
