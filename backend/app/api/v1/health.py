from fastapi import APIRouter
from app.core import database

router = APIRouter()


@router.get("/health")
async def health():
    return {"status": "ok"}


@router.get("/ready")
def ready():
    """Check DB connectivity by executing a simple query."""
    try:
        with database.engine.connect() as conn:
            conn.execute("SELECT 1")
        return {"ready": True}
    except Exception:
        return {"ready": False}
