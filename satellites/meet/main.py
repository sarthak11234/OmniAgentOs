import asyncio
import websockets
import json
import base64
import logging
import time
import sys
import threading
from PIL import Image, ImageDraw
import pystray

from audio_capture import AudioMonitor

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("satellite.meet")

# Configuration
SERVER_URI = "ws://localhost:8000/ws/stream"
DEVICE_NAME = "MyPC"

class MeetSatellite:
    def __init__(self):
        self.audio = AudioMonitor()
        self.running = False
        self.ws_connected = False
        
    def create_icon(self):
        # Create a simple icon image
        width = 64
        height = 64
        color1 = "black"
        color2 = "white"
        
        image = Image.new('RGB', (width, height), color1)
        dc = ImageDraw.Draw(image)
        dc.rectangle((width // 2, 0, width, height // 2), fill=color2)
        dc.rectangle((0, height // 2, width // 2, height), fill=color2)
        return image

    def on_quit(self, icon, item):
        logger.info("Quitting...")
        self.running = False
        self.audio.terminate()
        icon.stop()
        sys.exit(0)

    async def stream_audio(self):
        """Main loop to stream audio chunks to backend."""
        logger.info(f"Connecting to Cortex at {SERVER_URI}...")
        
        while self.running:
            try:
                async with websockets.connect(SERVER_URI) as websocket:
                    logger.info("✅ Connected to Cortex!")
                    self.ws_connected = True
                    self.audio.start()
                    
                    while self.running:
                        chunk = self.audio.read_chunk()
                        if chunk:
                            # Encode raw PCM to base64
                            b64_data = base64.b64encode(chunk).decode('utf-8')
                            
                            payload = {
                                "type": "audio_chunk",
                                "source": "satellite-meet",
                                "timestamp": time.time(),
                                "payload": {
                                    "device": DEVICE_NAME,
                                    "format": "pcm_16_16000_mono",
                                    "data": b64_data
                                }
                            }
                            
                            await websocket.send(json.dumps(payload))
                            # Small sleep to prevent tight loop if audio is buffering
                            await asyncio.sleep(0.01) 
                        else:
                            await asyncio.sleep(0.1)
                            
            except Exception as e:
                self.ws_connected = False
                logger.error(f"Connection lost: {e}. Retrying in 3s...")
                self.audio.stop()
                await asyncio.sleep(3)

    def start_tray_icon(self):
        icon = pystray.Icon("OmniMeet", self.create_icon(), "OmniContext Meet", menu=pystray.Menu(
            pystray.MenuItem("Quit", self.on_quit)
        ))
        icon.run()

    def start(self):
        self.running = True
        
        # Start WebSocket loop in a separate thread/event loop structure
        # Since pystray needs the main thread, we run asyncio in a thread
        loop_thread = threading.Thread(target=self.run_async_loop, daemon=True)
        loop_thread.start()
        
        # Start Tray Icon (Blocking)
        logger.info("Starting System Tray Icon...")
        self.start_tray_icon()

    def run_async_loop(self):
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        loop.run_until_complete(self.stream_audio())

if __name__ == "__main__":
    satellite = MeetSatellite()
    satellite.start()
