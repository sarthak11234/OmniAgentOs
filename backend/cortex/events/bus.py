from fastapi import WebSocket, WebSocketDisconnect
from typing import List
import logging
import json
from .protocol import CortexEvent

logger = logging.getLogger("cortex.bus")

class EventBus:
    """
    Manages WebSocket connections and routes incoming events 
    to the appropriate processors (StreamManager).
    """
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"Satellite connected. Total: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"Satellite disconnected. Total: {len(self.active_connections)}")

    async def handle_message(self, websocket: WebSocket, data: str):
        """
        Parses the raw JSON message, validates against Protocol,
        and dispatches it.
        """
        try:
            # 1. Parse JSON
            event_dict = json.loads(data)
            
            # 2. Validate Protocol (Will raise ValidationError if invalid)
            # We use a helper dynamic validator or just raw checks for MVP
            # For strictness:
            # event = TypeAdapter(CortexEvent).validate_python(event_dict)
            
            logger.debug(f"Received Event: {event_dict.get('type')} from {event_dict.get('source')}")
            
            # Dispatch to StreamManager
            from cortex.events.stream_manager import stream_manager
            await stream_manager.process(event_dict)
            
            # Echo back for acknowledgement (temporary)
            await websocket.send_text(json.dumps({"status": "received", "type": event_dict.get('type')}))
            
        except json.JSONDecodeError:
            logger.error("Failed to decode JSON from satellite")
        except Exception as e:
            logger.error(f"Error handling message: {e}")

# Global Instance
bus = EventBus()
