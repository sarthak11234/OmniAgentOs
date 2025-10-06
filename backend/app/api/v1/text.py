from fastapi import APIRouter

router = APIRouter()

@router.post("/generate")
async def generate_text(prompt: str):
    # Call text backbone agent (stub)
    return {"result": f"Generated text for: {prompt}"}
