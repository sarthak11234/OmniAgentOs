from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import logging

# Initialize Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("cortex")

app = FastAPI(
    title="OmniContext Cortex",
    description="The Neural Center of OmniContext OS",
    version="2.0.0"
)

# Import Routers
from backend.cortex.api.websocket import router as ws_router

# Register Routers
app.include_router(ws_router)

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
    from backend.cortex.memory.vector_store import HAS_CHROMA
    return {
        "status": "online",
        "system": "OmniContext Cortex v2.0",
        "modules": {
            "memory": "ChromaDB (Active)" if HAS_CHROMA else "Mock Memory (Active)",
            "llm": "Llama.cpp (Inactive)",
            "audio": "Whisper (Inactive)"
        }
    }

@app.get("/health")
async def health():
    return {"status": "ok"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
