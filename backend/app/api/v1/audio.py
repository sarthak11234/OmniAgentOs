from fastapi import APIRouter, UploadFile, File
from pydantic import BaseModel
from app.agents.audio_agent import transcribe_audio

router = APIRouter()


class TranscriptionResponse(BaseModel):
    filename: str
    transcript: str


@router.post("/transcribe", response_model=TranscriptionResponse)
async def transcribe_endpoint(file: UploadFile = File(...)):
    """
    Transcribe audio file using Whisper model
    
    Args:
        file: Audio file upload
    
    Returns:
        TranscriptionResponse with filename and transcript
    """
    try:
        transcript = await transcribe_audio(file)
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
