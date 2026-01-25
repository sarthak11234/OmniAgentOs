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
        self.icon = None
        self._last_speaking_state = False
        
    def create_icon(self, speaking=False, connected=False):
        """Create tray icon with status indication."""
        width = 64
        height = 64
        
        # Background color based on connection
        if not connected:
            bg_color = "#555555"  # Gray = disconnected
        elif speaking:
            bg_color = "#e74c3c"  # Red = speaking/recording
        else:
            bg_color = "#2ecc71"  # Green = connected, idle
        
        image = Image.new('RGB', (width, height), bg_color)
        dc = ImageDraw.Draw(image)
        
        # Draw a microphone-like shape
        dc.ellipse((20, 10, 44, 40), fill="white")  # Mic head
        dc.rectangle((28, 35, 36, 50), fill="white")  # Mic stem
        dc.arc((20, 42, 44, 58), 0, 180, fill="white", width=3)  # Mic stand
        
        return image

    def update_icon(self):
        """Update tray icon based on current state."""
        if self.icon:
            self.icon.icon = self.create_icon(
                speaking=self.audio.is_speaking,
                connected=self.ws_connected
            )
            # Update tooltip
            status = "Speaking" if self.audio.is_speaking else "Listening"
            conn = "Connected" if self.ws_connected else "Disconnected"
            paused = " (Paused)" if self.audio.is_paused else ""
            self.icon.title = f"OmniContext Meet - {conn} | {status}{paused}"

    def on_quit(self, icon, item):
        logger.info("Quitting...")
        self.running = False
        self.audio.terminate()
        icon.stop()

    def on_pause_resume(self, icon, item):
        """Toggle pause state."""
        if self.audio.is_paused:
            self.audio.resume()
        else:
            self.audio.pause()
        self.update_icon()

    def get_pause_text(self, item):
        """Dynamic menu text for pause/resume."""
        return "Resume Recording" if self.audio.is_paused else "Pause Recording"

    async def stream_audio(self):
        """Main loop to stream audio chunks to backend."""
        logger.info(f"Connecting to Cortex at {SERVER_URI}...")
        
        while self.running:
            try:
                async with websockets.connect(SERVER_URI) as websocket:
                    logger.info("✅ Connected to Cortex!")
                    self.ws_connected = True
                    self.update_icon()
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
                            
                            # Update icon if speaking state changed
                            if self.audio.is_speaking != self._last_speaking_state:
                                self._last_speaking_state = self.audio.is_speaking
                                self.update_icon()
                                if self.audio.is_speaking:
                                    logger.info("🎤 Speech detected - streaming...")
                            
                            await asyncio.sleep(0.01)
                        else:
                            # Update icon when not speaking
                            if self._last_speaking_state:
                                self._last_speaking_state = False
                                self.update_icon()
                            await asyncio.sleep(0.05)
                            
            except Exception as e:
                self.ws_connected = False
                self.update_icon()
                logger.error(f"Connection lost: {e}. Retrying in 3s...")
                self.audio.stop()
                await asyncio.sleep(3)

    def start_tray_icon(self):
        """Start the system tray icon."""
        menu = pystray.Menu(
            pystray.MenuItem(self.get_pause_text, self.on_pause_resume),
            pystray.Menu.SEPARATOR,
            pystray.MenuItem("Quit", self.on_quit)
        )
        
        self.icon = pystray.Icon(
            "OmniMeet",
            self.create_icon(speaking=False, connected=False),
            "OmniContext Meet - Connecting...",
            menu=menu
        )
        self.icon.run()

    def start(self):
        self.running = True
        
        # Start WebSocket loop in a separate thread
        loop_thread = threading.Thread(target=self.run_async_loop, daemon=True)
        loop_thread.start()
        
        # Start icon update thread
        update_thread = threading.Thread(target=self.icon_update_loop, daemon=True)
        update_thread.start()
        
        # Start Tray Icon (Blocking)
        logger.info("Starting System Tray Icon...")
        self.start_tray_icon()

    def icon_update_loop(self):
        """Periodically update icon to reflect current state."""
        while self.running:
            time.sleep(0.5)
            if self.icon:
                self.update_icon()

    def run_async_loop(self):
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        loop.run_until_complete(self.stream_audio())


def main():
    satellite = MeetSatellite()
    satellite.start()


if __name__ == "__main__":
    main()
