import sounddevice as sd
import numpy as np
import logging
import queue

logger = logging.getLogger("satellite.meet.audio")

class AudioMonitor:
    def __init__(self, rate=16000, chunk=1024, channels=1):
        self.rate = rate
        self.chunk = chunk
        self.channels = channels
        self.is_recording = False
        self.stream = None
        self.queue = queue.Queue()

    def _callback(self, indata, frames, time, status):
        """Called by sounddevice for each audio chunk."""
        if status:
            logger.warning(f"Audio status: {status}")
        
        # indata is a numpy array of floats (-1.0 to 1.0)
        # Convert to 16-bit PCM integers
        pcm_data = (indata * 32767).astype(np.int16)
        self.queue.put(pcm_data.tobytes())

    def start(self):
        """Starts the audio stream."""
        if self.is_recording:
            return

        try:
            # Create an InputStream that runs in a background thread by default (via PortAudio)
            self.stream = sd.InputStream(
                samplerate=self.rate,
                channels=self.channels,
                dtype='float32',
                blocksize=self.chunk,
                callback=self._callback
            )
            self.stream.start()
            self.is_recording = True
            logger.info("Microphone started successfully (SoundDevice).")
        except Exception as e:
            logger.error(f"Failed to start microphone: {e}")
            raise

    def stop(self):
        """Stops the audio stream."""
        if not self.is_recording:
            return
            
        self.is_recording = False
        if self.stream:
            self.stream.stop()
            self.stream.close()
            self.stream = None
        logger.info("Microphone stopped.")

    def read_chunk(self):
        """Reads a single chunk of audio data from the queue."""
        if self.is_recording:
            try:
                # Non-blocking get with a small timeout or return None
                return self.queue.get(block=True, timeout=0.1)
            except queue.Empty:
                return None
        return None

    def terminate(self):
        """Clean up."""
        self.stop()
