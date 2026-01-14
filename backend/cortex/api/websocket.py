from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from cortex.events.bus import bus

router = APIRouter()

@router.websocket("/ws/stream")
async def websocket_endpoint(websocket: WebSocket):
    """
    Main entry point for all Satellites.
    Accepts WebSocket connections and keeps them open for streaming events.
    """
    await bus.connect(websocket)
    try:
        while True:
            # Receive raw text (assuming JSON)
            data = await websocket.receive_text()
            # Pass to Event Bus for processing
            await bus.handle_message(websocket, data)
    except WebSocketDisconnect:
        bus.disconnect(websocket)
    except Exception as e:
        # Fallback for unexpected socket errors
        bus.disconnect(websocket)
