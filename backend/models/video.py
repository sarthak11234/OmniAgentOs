from transformers import pipeline
import tempfile
import cv2

# Load object detection model once
_object_detector = pipeline("object-detection", model="facebook/detr-resnet-50")

def detect_objects_in_video(video_bytes: bytes):
    """
    Run object detection on the first frame of the video.
    Returns detected objects.
    """
    # Write video bytes to a temporary file
    with tempfile.NamedTemporaryFile(suffix=".mp4") as tmp:
        tmp.write(video_bytes)
        tmp.flush()
        cap = cv2.VideoCapture(tmp.name)
        success, frame = cap.read()
        cap.release()
        if not success:
            return []
        # Convert BGR to RGB
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = _object_detector(frame_rgb)
        return results
