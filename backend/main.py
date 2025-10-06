import warnings
warnings.filterwarnings("ignore", category=UserWarning)

from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from backend.routers import audio, video, text

app = FastAPI(
    title="OmniAgent OS Backend",
    description="Multimodal AI Orchestration API",
    version="0.1.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to specific origins in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(audio.router, prefix="/audio", tags=["audio"])
app.include_router(video.router, prefix="/video", tags=["video"])
app.include_router(text.router, prefix="/text", tags=["text"])

@app.post("/audio")
async def receive_audio(file: UploadFile = File(...)):
    # Placeholder: process audio file
    return JSONResponse({"message": f"Received audio file: {file.filename}"})

@app.post("/video")
async def receive_video(file: UploadFile = File(...)):
    # Placeholder: process video file
    return JSONResponse({"message": f"Received video file: {file.filename}"})

@app.post("/text")
async def receive_text(text: str = Form(...)):
    # Placeholder: process text
    return JSONResponse({"message": f"Received text: {text[:30]}..."})

@app.post("/documents")
async def receive_document(file: UploadFile = File(...)):
    # Placeholder: process document file
    return JSONResponse({"message": f"Received document: {file.filename}"})


@app.get("/")
async def root():
    """Root endpoint with friendly message and links to registered routers."""
    return {
        "message": "OmniAgent OS Backend is running",
        "endpoints": {
            "audio_ingest": "/audio/ingest (POST, multipart/form-data)",
            "audio_transcribe": "/audio/transcribe (POST, multipart/form-data)",
            "video_ingest": "/video/ingest (POST, multipart/form-data)",
            "video_detect": "/video/detect (POST, multipart/form-data)",
            "text_ingest": "/text/ingest (POST, form-data or multipart)",
            "text_docs_summarize": "/text/docs/summarize (POST, multipart/form-data)"
        }
    }


@app.get("/health")
async def health():
    return JSONResponse({"status": "ok"})

# To run: uvicorn main:app --reload --host 0.0.0.0 --port 8000

# TODO: Add root endpoint and health checks
