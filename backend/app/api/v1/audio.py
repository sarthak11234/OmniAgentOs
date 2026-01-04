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
    transcript = await transcribe_audio(file)
    return TranscriptionResponse(
        filename=file.filename,
        transcript=transcript
    )
