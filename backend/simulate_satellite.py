import asyncio
import websockets
import json
import time

async def test_satellite():
    uri = "ws://localhost:8000/ws/stream"
    print(f"Connecting to {uri}...")
    
    try:
        async with websockets.connect(uri) as websocket:
            print("Connected!")
            
            # 1. Send Code Context Event
            code_event = {
                "type": "code_context",
                "source": "vscode_test_script",
                "timestamp": time.time(),
                "payload": {
                    "filename": "auth.py",
                    "cursor_line": 10,
                    "content_snippet": "def login(user):\n    return True"
                }
            }
            
            print(f"Sending Event: {code_event['type']}...")
            await websocket.send(json.dumps(code_event))
            
            # 2. Wait for Ack
            response = await websocket.recv()
            print(f"Received Ack: {response}")
            
    except Exception as e:
        print(f"Connection failed: {e}")
        print("Make sure the Cortex server is running! (uvicorn backend.cortex.main:app)")

if __name__ == "__main__":
    asyncio.run(test_satellite())
