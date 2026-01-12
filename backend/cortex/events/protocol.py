from pydantic import BaseModel, Field
from typing import Literal, Union, Optional
import time

class BaseEvent(BaseModel):
    type: str
    source: str
    timestamp: float = Field(default_factory=time.time)

# --- Payload Definitions ---

class AudioChunkPayload(BaseModel):
    format: str = "pcm_16bit"
    sample_rate: int = 16000
    channels: int = 1
    data: str  # Base64 encoded audio bytes

class CodeContextPayload(BaseModel):
    filename: str
    cursor_line: int
    content_snippet: str
    language: str = "text"

class WebPagePayload(BaseModel):
    url: str
    title: str
    content_summary: str

# --- Event Definitions ---

class AudioEvent(BaseEvent):
    type: Literal["audio_chunk"]
    payload: AudioChunkPayload

class CodeEvent(BaseEvent):
    type: Literal["code_context"]
    payload: CodeContextPayload

class WebEvent(BaseEvent):
    type: Literal["web_context"]
    payload: WebPagePayload

# Union for strict typing
CortexEvent = Union[AudioEvent, CodeEvent, WebEvent]
