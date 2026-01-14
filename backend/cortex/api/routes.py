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

class QueryResponse(BaseModel):
    answer: str
    context_used: str

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

@router.get("/health")
async def health():
    return {"status": "ok"}
