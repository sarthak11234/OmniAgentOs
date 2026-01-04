from fastapi import APIRouter
from pydantic import BaseModel
from app.agents.text_agent import generate_text

router = APIRouter()


class TextGenerationRequest(BaseModel):
    prompt: str
    max_length: int = 256


class TextGenerationResponse(BaseModel):
    prompt: str
    generated_text: str


@router.post("/generate", response_model=TextGenerationResponse)
async def generate_text_endpoint(request: TextGenerationRequest):
    """
    Generate text using Llama model
    
    Args:
        request: TextGenerationRequest with prompt and optional max_length
    
    Returns:
        TextGenerationResponse with original prompt and generated text
    """
    result = await generate_text(request.prompt, request.max_length)
    return TextGenerationResponse(
        prompt=request.prompt,
        generated_text=result
    )
