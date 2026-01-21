import logging
import json
import base64
from cortex.memory.vector_store import memory
from cortex.events.protocol import CortexEvent

logger = logging.getLogger("cortex.processing")

class StreamManager:
    """
    The Orchestrator.
    Takes validated events from the Bus and decides what to do with them.
    - Audio -> Transcribe -> VectorDB
    - Code -> VectorDB
    """
    
    async def process(self, event_dict: dict):
        event_type = event_dict.get("type")
        source = event_dict.get("source")
        
        print(f"DEBUG: Backend received {event_type} from {source}", flush=True) # DEBUG LOG
        logger.info(f"Processing event: {event_type} from {source}")

        if event_type == "code_context":
            await self._handle_code(event_dict)
        elif event_type == "audio_chunk":
            await self._handle_audio(event_dict)
        elif event_type == "web_context":
            await self._handle_web(event_dict)
        elif event_type == "handshake":
            logger.info(f"Handshake successful from {source}")
        else:
            logger.warning(f"Unknown event type: {event_type}")

    async def _handle_code(self, event: dict):
        """
        Ingest code context into memory.
        """
        payload = event.get("payload", {})
        content = f"File: {payload.get('filename')}\nCode:\n{payload.get('content_snippet')}"
        
        # Save to ChromaDB
        memory.add_event(
            content=content,
            metadata={
                "source": event.get("source"),
                "type": "code",
                "filename": payload.get("filename"),
                "timestamp": event.get("timestamp")
            }
        )
        logger.info(f"Indexed code context from {payload.get('filename')}")

    async def _handle_audio(self, event: dict):
        """
        Pipe to Whisper Model for transcription and store in memory.
        """
        payload = event.get("payload", {})
        b64_data = payload.get("data")
        
        if not b64_data:
            return

        try:
            from cortex.models.transcription import transcription_engine
            
            # Decode base64 audio
            audio_bytes = base64.b64decode(b64_data)
            
            # Transcribe
            transcript = transcription_engine.transcribe(audio_bytes)
            
            if transcript:
                logger.info(f"Transcribed Audio: {transcript}")
                
                # Save to Memory
                memory.add_event(
                    content=transcript,
                    metadata={
                        "source": event.get("source"),
                        "type": "audio",
                        "device": payload.get("device"),
                        "timestamp": event.get("timestamp")
                    }
                )
            else:
                logger.debug("Transcription resulted in empty text.")
                
        except Exception as e:
            logger.error(f"Error processing audio chunk: {e}")

    async def _handle_web(self, event: dict):
        """
        Ingest web page summary.
        """
        payload = event.get("payload", {})
        content = f"Page: {payload.get('title')}\nURL: {payload.get('url')}\nSummary:\n{payload.get('content_summary')}"
        
        memory.add_event(
            content=content,
            metadata={
                "source": event.get("source"),
                "type": "web",
                "url": payload.get("url"),
                "timestamp": event.get("timestamp")
            }
        )

stream_manager = StreamManager()
