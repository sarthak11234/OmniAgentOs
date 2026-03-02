import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.api_router import api_router

logger = logging.getLogger("omniagent")


async def _startup():
    """Initialize database on startup."""
    logger.info("Starting OmniAgentOS Backend...")

    # Run database migrations
    try:
        logger.info("Running database migrations...")
        from app.db.migrate import run_migrations_and_seed
        run_migrations_and_seed()
    except Exception as e:
        logger.warning(f"Database migration warning: {e} — continuing anyway")

    logger.info("Backend initialized successfully!")


@asynccontextmanager
async def lifespan(app: FastAPI):
    await _startup()
    yield


app = FastAPI(
    title="OmniAgentOS API",
    description="Multimodal AI Orchestration API",
    version="2.0.0",
    lifespan=lifespan,
)

# CORS — allow satellites and frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# REST API v1 (auth, audio, text, summarize, results, health)
app.include_router(api_router, prefix="/api/v1")

# Cortex WebSocket (satellite connections)
from cortex.api.websocket import router as ws_router
app.include_router(ws_router)

# Cortex REST (RAG query, context, memory)
from cortex.api.routes import router as cortex_router
app.include_router(cortex_router)


@app.get("/")
async def root():
    """Root endpoint — system status overview."""
    from cortex.memory.vector_store import HAS_CHROMA
    from cortex.models.llm import llm_engine
    return {
        "status": "online",
        "system": "OmniAgentOS v2.0",
        "modules": {
            "memory": "ChromaDB" if HAS_CHROMA else "Mock",
            "llm": "Gemini (Active)" if llm_engine.initialized else "Inactive",
        },
    }


@app.get("/health")
async def health():
    return {"status": "ok"}
