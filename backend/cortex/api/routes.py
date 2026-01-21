from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from cortex.models.llm import llm_engine
from cortex.memory.retrieval import retriever
import logging

logger = logging.getLogger("cortex.api.routes")

router = APIRouter(prefix="/api")

class QueryRequest(BaseModel):
    query: str
    limit: Optional[int] = 5
    stream: Optional[bool] = False

class ContextAddRequest(BaseModel):
    filename: str
    content: str
    type: str = "file"

class LoginRequest(BaseModel):
    password: Optional[str] = "omni123"

class LoginResponse(BaseModel):
    token: str

class QueryResponse(BaseModel):
    answer: str
    context_used: str

class SummarizeRequest(BaseModel):
    text: str
    max_words: Optional[int] = 100

@router.post("/query", response_model=QueryResponse)
async def query_brain(request: QueryRequest):
    """
    RAG Endpoint: Retrieves context and then generates an answer using Gemini.
    """
    logger.info(f"Received query: {request.query}")
    
    # 1. Retrieve Context
    context = await retriever.get_relevant_context(request.query, limit=request.limit)
    
    # 2. Generate LLM Response
    answer = await llm_engine.generate_response(request.query, context=context)
    
    return QueryResponse(answer=answer, context_used=context)

@router.post("/summarize")
async def summarize(request: SummarizeRequest):
    """
    Independent summarization endpoint.
    """
    logger.info(f"Received summarization request ({len(request.text)} chars)")
    summary = await llm_engine.summarize(request.text, max_words=request.max_words)
    return {"summary": summary}

@router.post("/context/add")
async def add_context(request: ContextAddRequest):
    """
    Ingests text content into the vector memory.
    """
    from cortex.memory.vector_store import memory
    
    from datetime import datetime
    metadata = {
        "source": request.filename,
        "type": request.type,
        "timestamp": datetime.now().isoformat()
    }
    
    memory.add_event(content=request.content, metadata=metadata)
    logger.info(f"Added context from {request.filename}")
    return {"status": "success", "filename": request.filename}

@router.post("/auth/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    """
    Simple mock authentication.
    """
    # In a real system, verify password and sign JWT
    if request.password == "omni123":
        return LoginResponse(token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.VALID_TOKEN")
    
    raise HTTPException(status_code=401, detail="Invalid credentials")

@router.get("/memory/recent")
async def get_recent_memory(limit: int = 10):
    """
    Returns the most recent items stored in the vector memory.
    Useful for verification and debugging.
    """
    from cortex.memory.vector_store import memory
    results = memory.get_recent(limit=limit)
    return results

@router.get("/health")
async def health():
    return {"status": "ok"}
