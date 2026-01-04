from fastapi import APIRouter
# v1 routers
from .v1 import text, audio, summarize, health, results

api_router = APIRouter()
api_router.include_router(text.router, prefix="/text", tags=["Text"])
api_router.include_router(audio.router, prefix="/audio", tags=["Audio"])
api_router.include_router(summarize.router, prefix="/summarize", tags=["Summarize"])
api_router.include_router(health.router, prefix="/health", tags=["Health"])
api_router.include_router(results.router, prefix="", tags=["Results"])  # No prefix - results are top-level
# ...add more as needed
