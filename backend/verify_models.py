"""
Script to test ML model endpoints
"""
import requests
import json
import wave
import struct

BASE_URL = "http://localhost:8000/api/v1"

def create_test_wav(filename="test_audio.wav"):
    """Create a simple 1-second silence WAV file for testing"""
    sample_rate = 44100
    duration = 1.0
    frequency = 440.0
    
    # Open valid wav file
    with wave.open(filename, 'w') as obj:
        obj.setnchannels(1) # mono
        obj.setsampwidth(2) # 2 bytes per sample
        obj.setframerate(sample_rate)
        
        # Create dummy data (silence)
        for i in range(int(sample_rate * duration)):
            value = 0
            data = struct.pack('<h', value)
            obj.writeframesraw(data)
            
    return filename

def test_text_generation():
    print("\n📝 Testing Text Generation (DistilGPT-2)...")
    try:
        payload = {"prompt": "Once upon a time", "max_length": 50}
        
        # The endpoint expects form data or json? Let's check text router
        # Based on previous file views, it seems to be form data or json
        # Let's try json first, if fails try form
        
        response = requests.post(f"{BASE_URL}/text/generate", json=payload)
        
        if response.status_code == 200:
            print("[OK] Text Generation Success!")
            print(f"Output: {response.json().get('generated_text', '')[:100]}...")
            return True
        else:
            print(f"[FAIL] Text Generation Failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"[FAIL] Text Generation Error: {e}")
        return False

def test_summarization():
    print("\n📊 Testing Summarization (BART distilled)...")
    try:
        text = "Artificial intelligence (AI) is intelligence demonstrated by machines, as opposed to the natural intelligence displayed by animals including humans. AI research has been defined as the field of study of intelligent agents, which refers to any system that perceives its environment and takes actions that maximize its chance of achieving its goals."
        payload = {"text": text}
        
        response = requests.post(f"{BASE_URL}/summarize", json=payload)
        
        if response.status_code == 200:
            print("[OK] Summarization Success!")
            print(f"Output: {response.json().get('summary_text', '')[:100]}...")
            return True
        else:
            print(f"[FAIL] Summarization Failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"[FAIL] Summarization Error: {e}")
        return False

def test_audio_transcription():
    print("\n🎵 Testing Audio Transcription (Whisper tiny)...")
    try:
        filename = create_test_wav()
        with open(filename, 'rb') as f:
            files = {'file': (filename, f, 'audio/wav')}
            response = requests.post(f"{BASE_URL}/audio/transcribe", files=files)
            
        if response.status_code == 200:
            print("[OK] Audio Transcription Success!")
            print(f"Output: {response.json().get('transcript', '')}")
            return True
        else:
            print(f"[FAIL] Audio Transcription Failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"[FAIL] Audio Transcription Error: {e}")
        return False

if __name__ == "__main__":
    print("="*60)
    print(" OmniAgentOS Model Verification")
    print("="*60)
    
    whisper_status = test_audio_transcription()
    gpt2_status = test_text_generation()
    bart_status = test_summarization()
    
    print("\n" + "="*60)
    print("Summary:")
    print(f"Text Generation: {'[OK] Working' if gpt2_status else '[FAIL] Failed'}")
    print(f"Summarization:   {'[OK] Working' if bart_status else '[FAIL] Failed'}")
    print(f"Transcription:   {'[OK] Working' if whisper_status else '[FAIL] Failed'}")
    print("="*60)
