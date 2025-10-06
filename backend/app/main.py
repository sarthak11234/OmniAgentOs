from fastapi import FastAPI
from app.api.api_router import api_router

app = FastAPI(title="OmniAgentOS API")

app.include_router(api_router, prefix="/api/v1")
