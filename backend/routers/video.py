from fastapi import APIRouter, UploadFile, File
from backend.models.video import detect_objects_in_video

router = APIRouter()

@router.post("/ingest")
async def ingest_video(file: UploadFile = File(...)):
    # TODO: Forward video to event pipeline (Kafka/Redis)
    return {"status": "received", "filename": file.filename}

@router.post("/detect")
async def detect_video_objects(file: UploadFile = File(...)):
    video_bytes = await file.read()
    detections = detect_objects_in_video(video_bytes)
    return {"detections": detections}
