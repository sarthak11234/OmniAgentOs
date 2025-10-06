import httpx
import os

HF_API_URL = "https://api-inference.huggingface.co/models/openai/whisper-large-v3"
HF_API_KEY = os.getenv("HF_API_KEY")

async def hf_transcribe_audio(file):
    headers = {"Authorization": f"Bearer {HF_API_KEY}"}
    async with httpx.AsyncClient() as client:
        response = await client.post(
            HF_API_URL,
            headers=headers,
            files={"file": (file.filename, await file.read())}
        )
        response.raise_for_status()
        return response.json().get("text", "")
