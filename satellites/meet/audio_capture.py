import sounddevice as sd
import numpy as np
import logging
import queue

logger = logging.getLogger("satellite.meet.audio")


class EnergyVAD:
    """
    Simple energy-based Voice Activity Detection.
    Detects speech based on audio energy (RMS) threshold.
    No external dependencies required.
    """
    def __init__(self, threshold=500, min_speech_frames=3, min_silence_frames=15):
        """
        Args:
            threshold: RMS energy threshold for speech detection (0-32767 for 16-bit)
            min_speech_frames: Minimum consecutive frames above threshold to trigger speech
            min_silence_frames: Minimum consecutive frames below threshold to end speech
        """
        self.threshold = threshold
        self.min_speech_frames = min_speech_frames
        self.min_silence_frames = min_silence_frames
        self.speech_frames = 0
        self.silence_frames = 0
        self.is_speaking = False
    
    def process(self, pcm_data: np.ndarray) -> bool:
        """
        Process audio frame and return speech state.
        
        Args:
            pcm_data: 16-bit PCM audio as numpy array
            
        Returns:
            True if speech is detected, False otherwise
        """
        # Calculate RMS energy
        rms = np.sqrt(np.mean(pcm_data.astype(np.float32) ** 2))
        
        is_above_threshold = rms > self.threshold
        
        if is_above_threshold:
            self.speech_frames += 1
            self.silence_frames = 0
        else:
            self.silence_frames += 1
            self.speech_frames = 0
        
        # State machine with hysteresis
        if not self.is_speaking and self.speech_frames >= self.min_speech_frames:
            self.is_speaking = True
            logger.debug(f"Speech started (RMS: {rms:.0f})")
        elif self.is_speaking and self.silence_frames >= self.min_silence_frames:
            self.is_speaking = False
            logger.debug(f"Speech ended (RMS: {rms:.0f})")
        
        return self.is_speaking


class AudioMonitor:
    """
    Audio capture with Voice Activity Detection (VAD).
    Uses energy-based detection - no external dependencies needed.
    """
    def __init__(self, rate=16000, chunk=480, channels=1, vad_threshold=500):
        """
        Args:
            rate: Sample rate (16kHz recommended)
            chunk: Frame size (480 samples = 30ms at 16kHz)
            channels: Number of channels (1 for mono)
            vad_threshold: Energy threshold for speech detection
        """
        self.rate = rate
        self.chunk = chunk
        self.channels = channels
        self.is_recording = False
        self.is_speaking = False  # Exposed for UI feedback
        self.is_paused = False    # Pause flag
        self.stream = None
        self.queue = queue.Queue()
        
        # Initialize VAD
        self.vad = EnergyVAD(threshold=vad_threshold)
        logger.info(f"Energy-based VAD initialized (threshold: {vad_threshold})")

    def _callback(self, indata, frames, time, status):
        """Called by sounddevice for each audio chunk."""
        if status:
            logger.warning(f"Audio status: {status}")
        
        if self.is_paused:
            return
        
        # indata is a numpy array of floats (-1.0 to 1.0)
        # Convert to 16-bit PCM integers
        pcm_data = (indata * 32767).astype(np.int16)
        pcm_bytes = pcm_data.tobytes()
        
        # Voice Activity Detection
        self.is_speaking = self.vad.process(pcm_data)
        
        # Only queue if speaking
        if self.is_speaking:
            self.queue.put(pcm_bytes)

    def start(self):
        """Starts the audio stream."""
        if self.is_recording:
            return

        try:
            self.stream = sd.InputStream(
                samplerate=self.rate,
                channels=self.channels,
                dtype='float32',
                blocksize=self.chunk,
                callback=self._callback
            )
            self.stream.start()
            self.is_recording = True
            self.is_paused = False
            logger.info("Microphone started with energy-based VAD.")
        except Exception as e:
            logger.error(f"Failed to start microphone: {e}")
            raise

    def stop(self):
        """Stops the audio stream."""
        if not self.is_recording:
            return
            
        self.is_recording = False
        self.is_speaking = False
        if self.stream:
            self.stream.stop()
            self.stream.close()
            self.stream = None
        logger.info("Microphone stopped.")

    def pause(self):
        """Pause audio capture without stopping the stream."""
        self.is_paused = True
        self.is_speaking = False
        logger.info("Audio capture paused.")

    def resume(self):
        """Resume audio capture."""
        self.is_paused = False
        logger.info("Audio capture resumed.")

    def read_chunk(self):
        """Reads a single chunk of audio data from the queue."""
        if self.is_recording and not self.is_paused:
            try:
                return self.queue.get(block=True, timeout=0.1)
            except queue.Empty:
                return None
        return None

    def terminate(self):
        """Clean up."""
        self.stop()
