from fastapi import APIRouter, UploadFile, File, Form
from backend.models.text import summarize_text, get_text_embedding

router = APIRouter()

@router.post("/ingest")
async def ingest_text(text: str = Form(None), file: UploadFile = File(None)):
    # TODO: Forward text or document to event pipeline (Kafka/Redis)
    return {"status": "received", "text": text, "filename": file.filename if file else None}

@router.post("/docs/summarize")
async def summarize_document(file: UploadFile = File(...)):
    # Read document content
    content = (await file.read()).decode("utf-8")
    summary = summarize_text(content)
    embedding = get_text_embedding(summary)
    # TODO: Store summary and embedding in vector DB
    return {
        "summary": summary,
        "embedding": embedding.tolist() if hasattr(embedding, "tolist") else embedding
    }
