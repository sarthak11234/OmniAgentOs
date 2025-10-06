from fastapi import APIRouter, UploadFile, File
from backend.models.audio import get_whisper_transcript

router = APIRouter()

@router.post("/ingest")
async def ingest_audio(file: UploadFile = File(...)):
    # TODO: Forward audio to event pipeline (Kafka/Redis)
    return {"status": "received", "filename": file.filename}

@router.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    # Use Whisper model to transcribe audio
    audio_bytes = await file.read()
    transcript = get_whisper_transcript(audio_bytes)
    return {"transcript": transcript}
