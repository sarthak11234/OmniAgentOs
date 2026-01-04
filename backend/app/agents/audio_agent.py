from app.services.hf_client import hf_client

async def transcribe_audio(file) -> str:
    """
    Transcribe audio file using HuggingFace Whisper model
    
    Args:
        file: UploadFile object containing audio data
    
    Returns:
        Transcribed text from audio
    """
    return await hf_client.transcribe_audio(file)
