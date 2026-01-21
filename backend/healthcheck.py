import asyncio
import websockets
import json
import time
import sys
import urllib.request

def check_server_http():
    print("[1/3] Checking HTTP Health Endpoint...", end=" ")
    print("[1/3] Checking HTTP Health Endpoint...", end=" ")
    try:
        # Check the updated Unified API endpoint
        with urllib.request.urlopen("http://localhost:8000/health") as response:
            if response.getcode() == 200:
                print("✅ Online")
                return True
    except Exception:
        print("❌ Offline (Connect failed)")
        return False

async def check_websocket_stream():
    uri = "ws://localhost:8000/ws/stream"
    print(f"[2/3] Checking WebSocket Stream ({uri})...", end=" ")
    
    try:
        async with websockets.connect(uri) as websocket:
            print("✅ Connected")
            
            # 3. Protocol Check
            print("[3/3] Verifying Event Protocol...", end=" ")
            payload = {
                "type": "code_context",
                "source": "healthcheck_script",
                "timestamp": time.time(),
                "payload": {
                    "filename": "healthcheck.py",
                    "cursor_line": 0,
                    "content_snippet": "ping",
                    "language": "python"
                }
            }
            
            await websocket.send(json.dumps(payload))
            response = await websocket.recv()
            data = json.loads(response)
            
            if data.get("status") == "received":
                print(f"✅ Protocol Verified (Ack Received)")
                return True
            else:
                print(f"❌ Protocol Failed (Invalid Ack: {data})")
                return False
                
    except Exception as e:
        print(f"❌ WebSocket Failed: {e}")
        return False

async def main():
    print("=== OmniContext E2E Healthcheck ===\n")
    
    if not check_server_http():
        print("\n[CRITICAL] Backend is DEAD. Please run: cd backend && uvicorn app.main:app --reload")
        sys.exit(1)
        
    ws_success = await check_websocket_stream()
    
    if ws_success:
        print("\n✅✅✅ SYSTEM HEALTHY ✅✅✅")
        # Clean up old file if exists
        sys.exit(0)
    else:
        print("\n[CRITICAL] Cortex Brain is UNSTABLE.")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
