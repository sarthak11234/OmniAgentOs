from fastapi import FastAPI
from backend.routers import audio, video, text

app = FastAPI(
    title="OmniAgent OS Backend",
    description="Multimodal AI Orchestration API",
    version="0.1.0"
)

# Register routers
app.include_router(audio.router, prefix="/audio", tags=["audio"])
app.include_router(video.router, prefix="/video", tags=["video"])
app.include_router(text.router, prefix="/text", tags=["text"])

# TODO: Add root endpoint and health checks
