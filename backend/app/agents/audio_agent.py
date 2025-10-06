from app.services.hf_client import hf_transcribe_audio

async def transcribe_audio(file):
    transcript = await hf_transcribe_audio(file)
    return transcript
