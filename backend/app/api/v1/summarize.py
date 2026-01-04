from fastapi import APIRouter
from pydantic import BaseModel
from app.agents.summarize_agent import summarize_text

# Disable redirect on trailing slash
router = APIRouter(redirect_slashes=False)


class SummarizationRequest(BaseModel):
    text: str
    max_length: int = 150


class SummarizationResponse(BaseModel):
    original_length: int
    summary: str
    summary_length: int


@router.post("", response_model=SummarizationResponse)
async def summarize_endpoint(request: SummarizationRequest):
    """
    Summarize text using BART model
    
    Args:
        request: SummarizationRequest with text and optional max_length
    
    Returns:
        SummarizationResponse with original length, summary, and summary length
    """
    summary = await summarize_text(request.text, request.max_length)
    return SummarizationResponse(
        original_length=len(request.text),
        summary=summary,
        summary_length=len(summary)
    )
