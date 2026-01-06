import requests
import sys

URL = "http://localhost:8000/api/v1/summarize"

def test_short():
    print("Testing SHORT text (bypass model)...")
    try:
        r = requests.post(URL, json={"text": "Short text " * 10})
        print(f"Status: {r.status_code}")
        print(f"Response: {r.text}")
    except Exception as e:
        print(f"Exception: {e}")

def test_long():
    print("\nTesting LONG text (trigger model)...")
    text = "This is a sentence. " * 60  # ~240 words
    try:
        r = requests.post(URL, json={"text": text})
        print(f"Status: {r.status_code}")
        print(f"Response: {r.text}")
    except Exception as e:
        print(f"Exception: {e}")

if __name__ == "__main__":
    test_short()
    test_long()
