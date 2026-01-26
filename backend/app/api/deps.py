from typing import Generator, Optional
from app.core.database import SessionLocal
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer

oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login", auto_error=False)

def get_db() -> Generator:
    try:
        db = SessionLocal()
        yield db
    finally:
        db.close()


async def get_current_user_optional(
    token: Optional[str] = Depends(oauth2_scheme_optional),
    db = None
):
    """
    Get current user from token, or return None for anonymous access.
    ML endpoints can use this for optional auth.
    """
    if not token:
        return None
    
    try:
        from app.core.security import verify_token
        from app.db import models
        
        payload = verify_token(token)
        if payload is None:
            return None
        
        username = payload.get("sub")
        if not username:
            return None
        
        # Get fresh db session if not provided
        if db is None:
            db = SessionLocal()
        
        user = db.query(models.User).filter(models.User.username == username).first()
        return user
    except Exception:
        return None


def get_user_id_or_default(user) -> int:
    """Get user ID or return 1 for anonymous users"""
    return user.id if user else 1
