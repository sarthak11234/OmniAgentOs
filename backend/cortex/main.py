from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import logging
from cortex.core.config import config

# Initialize Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("cortex")

app = FastAPI(
    title="OmniContext Cortex",
    description="The Neural Center of OmniContext OS",
    version="2.0.0"
)

# Import Routers
from cortex.api.websocket import router as ws_router
from cortex.api.routes import router as rest_router

# Register Routers
app.include_router(ws_router)
app.include_router(rest_router)

# CORS: Allow Satellites to connect from anywhere (Localhost)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    from cortex.memory.vector_store import HAS_CHROMA
    from cortex.models.llm import llm_engine
    from cortex.models.transcription import transcription_engine
    return {
        "status": "online",
        "system": "OmniContext Cortex v2.0",
        "modules": {
            "memory": "ChromaDB (Active)" if HAS_CHROMA else "Mock Memory (Active)",
            "llm": f"Gemini ({config.LLM_MODEL})" if llm_engine.initialized else "Inactive",
            "audio": f"Whisper ({config.WHISPER_MODEL})" if transcription_engine.initialized else "Inactive"
        }
    }

@app.get("/health")
async def health():
    return {"status": "ok"}

if __name__ == "__main__":
    uvicorn.run("cortex.main:app", host="0.0.0.0", port=8000, reload=True)
