from fastapi import APIRouter

router = APIRouter()

@router.post("/")
async def summarize(text: str):
    # Call summarization agent (stub)
    return {"summary": f"Summary for: {text[:32]}..."}
