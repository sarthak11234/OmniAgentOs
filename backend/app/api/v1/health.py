from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
async def health():
    """Basic health check endpoint"""
    return {"status": "ok"}


@router.get("/ready")
async def ready():
    """Check if application is ready to serve requests"""
    return {"ready": True}

