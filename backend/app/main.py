from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.api_router import api_router
from app.services.hf_client import hf_client

app = FastAPI(title="OmniAgentOS API")

# Increase max upload size to 100MB
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure max upload size
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await startup_event()
    yield
    # Shutdown
    pass

app.router.lifespan_context = lifespan

app.include_router(api_router, prefix="/api/v1")


@app.on_event("startup")
async def startup_event():
    """Initialize database and ML models on startup"""
    print("\n" + "="*60)
    print("🚀 Starting OmniAgentOS Backend...")
    print("="*60)
    
    # Run database migrations first
    try:
        print("\n🗄️  Running database migrations...")
        from app.db.migrate import run_migrations_and_seed
        run_migrations_and_seed()
    except Exception as e:
        print(f"⚠️  Database migration warning: {e}")
        print("⚠️  Continuing anyway - some features may be unavailable")
    
    # Initialize ML models
    print("\n" + "="*60)
    print("🤖 Initializing ML Models...")
    print("="*60)
    
    # try:
    #     print("\n🎵 Loading Audio Transcription Model (Whisper-small)...")
    #     _ = hf_client.transcriber
    #     print("✅ Audio Transcription Model loaded!")
    # except Exception as e:
    #     print(f"⚠️  Audio Transcription Model failed: {e}")

    # try:
    #     print("\n📝 Loading Text Generation Model (GPT-2)...")
    #     _ = hf_client.text_generator
    #     print("✅ Text Generation Model loaded!")
    # except Exception as e:
    #     print(f"⚠️  Text Generation Model failed: {e}")
    
    # try:
    #     print("\n📊 Loading Summarization Model (BART)...")
    #     _ = hf_client.summarizer
    #     print("✅ Summarization Model loaded!")
    # except Exception as e:
    #     print(f"⚠️  Summarization Model failed: {e}")
    
    print("\n" + "="*60)
    print("✨ Backend initialized successfully!")
    print("="*60 + "\n")
