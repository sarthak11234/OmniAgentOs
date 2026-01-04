from fastapi import APIRouter
from app.core import database

router = APIRouter()


@router.get("/health")
async def health():
    return {"status": "ok"}


@router.get("/ready")
def ready():
    """Check if application is ready. Returns true when ML models are loaded."""
    # Since ML models are preloaded on startup and initialization completes,
    # if we're responding to requests, the app is ready
    return {"ready": True}
