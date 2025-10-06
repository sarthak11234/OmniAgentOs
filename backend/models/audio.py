# TODO: Optimize model loading for production (singleton or cache as needed)
from transformers import pipeline
import tempfile
import io

# Load Whisper model once at module level
_whisper_pipeline = pipeline("automatic-speech-recognition", model="openai/whisper-base")

def get_whisper_transcript(audio_bytes: bytes) -> str:
    """
    Transcribe audio bytes using Hugging Face Whisper.
    """
    # Write bytes to a temporary file for the pipeline
    with tempfile.NamedTemporaryFile(suffix=".wav") as tmp:
        tmp.write(audio_bytes)
        tmp.flush()
        result = _whisper_pipeline(tmp.name)
    return result["text"]
