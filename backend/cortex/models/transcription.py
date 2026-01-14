import whisper
import os
import torch
import logging
from cortex.core.config import config
import numpy as np
import base64

logger = logging.getLogger("cortex.models.transcription")

class TranscriptionEngine:
    def __init__(self):
        self.model_name = config.WHISPER_MODEL
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model = None
        self.initialized = False
        
        try:
            logger.info(f"Loading Whisper model '{self.model_name}' on {self.device}...")
            self.model = whisper.load_model(self.model_name, device=self.device)
            self.initialized = True
            logger.info("Whisper model loaded successfully.")
        except Exception as e:
            logger.error(f"Failed to load Whisper model: {e}")

    def transcribe(self, audio_data: bytes) -> str:
        """
        Transcribes raw audio bytes.
        Expects 16kHz mono PCM audio.
        """
        if not self.initialized:
            return ""

        try:
            # Convert bytes to numpy array
            audio_np = np.frombuffer(audio_data, dtype=np.int16).astype(np.float32) / 32768.0
            
            # Whisper expects 16k sample rate
            result = self.model.transcribe(audio_np, fp16=(self.device == "cuda"))
            return result.get("text", "").strip()
        except Exception as e:
            logger.error(f"Transcription error: {e}")
            return ""

# Global Instance
transcription_engine = TranscriptionEngine()
