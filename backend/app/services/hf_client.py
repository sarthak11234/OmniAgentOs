import os
from typing import Optional
import io

# Import transformers pipelines for local model execution
from transformers import pipeline
import torch

# Check if GPU is available
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"


class HFClient:
    """Local HuggingFace Model Client using Transformers Library"""
    
    def __init__(self):
        self.device = DEVICE
        print(f"Using device: {self.device}")
        
        # Initialize pipelines lazily (on first use)
        self._transcriber = None
        self._text_generator = None
        self._summarizer = None
    
    @property
    def transcriber(self):
        """Lazy load speech recognition pipeline"""
        if self._transcriber is None:
            print("Loading Whisper model...")
            self._transcriber = pipeline(
                "automatic-speech-recognition",
                model="openai/whisper-small",
                device=0 if self.device == "cuda" else -1
            )
        return self._transcriber
    
    @property
    def text_generator(self):
        """Lazy load text generation pipeline"""
        if self._text_generator is None:
            print("Loading GPT-2 model...")
            self._text_generator = pipeline(
                "text-generation",
                model="gpt2",
                device=0 if self.device == "cuda" else -1,
                max_length=256
            )
        return self._text_generator
    
    @property
    def summarizer(self):
        """Lazy load summarization pipeline"""
        if self._summarizer is None:
            print("Loading BART model...")
            self._summarizer = pipeline(
                "summarization",
                model="facebook/bart-large-cnn",
                device=0 if self.device == "cuda" else -1
            )
        return self._summarizer
    
    async def transcribe_audio(self, file) -> str:
        """Transcribe audio using local Whisper model"""
        temp_path = None
        try:
            print(f"Transcribing {file.filename}...")
            file_content = await file.read()
            
            # Save to temp file for processing
            temp_path = f"/tmp/{file.filename}"
            with open(temp_path, 'wb') as f:
                f.write(file_content)
            
            print(f"Saved file to {temp_path}, size: {len(file_content)} bytes")
            
            # Transcribe using Whisper with return_timestamps=True for long audio
            try:
                print(f"Starting transcription with timestamps...")
                result = self.transcriber(
                    temp_path,
                    return_timestamps=True,
                    chunk_length_s=30  # Process in 30-second chunks
                )
            except Exception as long_audio_error:
                # Fallback: try without timestamps for compatibility
                print(f"Retrying without timestamps: {str(long_audio_error)}")
                try:
                    result = self.transcriber(temp_path)
                except Exception as retry_error:
                    print(f"Transcription retry failed: {str(retry_error)}")
                    return f"Transcription failed: {str(retry_error)}"
            
            transcript = result.get("text", "").strip()
            print(f"Transcription successful: {len(transcript)} characters")
            
            return transcript if transcript else "[No speech detected]"
        except Exception as e:
            print(f"Transcription error: {str(e)}")
            import traceback
            traceback.print_exc()
            return f"Transcription error: {str(e)}"
        finally:
            # Clean up
            if temp_path and os.path.exists(temp_path):
                try:
                    os.remove(temp_path)
                except Exception as cleanup_error:
                    print(f"Cleanup error: {cleanup_error}")

    
    async def generate_text(self, prompt: str, max_length: int = 256) -> str:
        """Generate text using local GPT-2 model"""
        try:
            print(f"Generating text for prompt: {prompt[:50]}...")
            
            # Generate text
            results = self.text_generator(
                prompt,
                max_length=min(max_length, 256),
                num_return_sequences=1,
                temperature=0.7,
                top_p=0.95
            )
            
            generated = results[0].get("generated_text", "")
            return generated.strip()
        except Exception as e:
            return f"Text generation error: {str(e)}"
    
    async def summarize_text(self, text: str, max_length: int = 150) -> str:
        """Summarize text using local BART model"""
        try:
            print(f"Summarizing text ({len(text)} chars)...")
            
            # BART requires min 50 tokens, so check text length
            words = text.split()
            if len(words) < 50:
                return text  # Too short to summarize
            
            # Calculate valid min and max lengths
            min_length = min(30, len(words) // 4)
            max_summary_length = min(max_length, len(words) // 2)
            
            results = self.summarizer(
                text,
                min_length=min_length,
                max_length=max_summary_length,
                do_sample=False
            )
            
            summary = results[0].get("summary_text", "")
            return summary.strip() if summary else text[:max_length]
        except Exception as e:
            return f"Summarization error: {str(e)}"


# Create global client instance
hf_client = HFClient()


# Legacy function names for backward compatibility
async def hf_transcribe_audio(file) -> str:
    """Transcribe audio file using local Whisper model"""
    return await hf_client.transcribe_audio(file)


async def hf_generate_text(prompt: str) -> str:
    """Generate text using local GPT-2 model"""
    return await hf_client.generate_text(prompt)


async def hf_summarize_text(text: str) -> str:
    """Summarize text using local BART model"""
    return await hf_client.summarize_text(text)
