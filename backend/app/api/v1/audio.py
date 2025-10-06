from fastapi import APIRouter, UploadFile, File
from app.agents.audio_agent import transcribe_audio

router = APIRouter()

@router.post("/transcribe")
async def transcribe(file: UploadFile = File(...)):
    transcript = await transcribe_audio(file)
    return {"transcript": transcript}
