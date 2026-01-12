import logging
import json
from backend.cortex.memory.vector_store import memory
from backend.cortex.events.protocol import CortexEvent

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
        
        logger.info(f"Processing event: {event_type} from {source}")

        if event_type == "code_context":
            await self._handle_code(event_dict)
        elif event_type == "audio_chunk":
            await self._handle_audio(event_dict)
        elif event_type == "web_context":
            await self._handle_web(event_dict)
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
        TODO: Pipe to Whisper Streaming Model.
        For Phase 1 MVP, we just log it.
        """
        # payload = event.get("payload")
        # audio_data = payload.get("data")
        # transcript = whisper_model.transcribe(audio_data)
        # memory.add_event(transcript, ...)
        pass

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
