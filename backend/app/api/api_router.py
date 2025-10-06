from fastapi import APIRouter
from .v1 import text, audio, summarize

api_router = APIRouter()
api_router.include_router(text.router, prefix="/text", tags=["Text"])
api_router.include_router(audio.router, prefix="/audio", tags=["Audio"])
api_router.include_router(summarize.router, prefix="/summarize", tags=["Summarize"])
# ...add more as needed
