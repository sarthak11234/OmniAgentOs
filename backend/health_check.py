import requests
import time
import sys

BASE_URL = "http://localhost:8000/api/v1"

def wait_for_server():
    print("Waiting for server...")
    for i in range(30):
        try:
            r = requests.get(f"{BASE_URL}/health")
            if r.status_code == 200:
                print("Server is UP and HEALTHY!")
                return True
        except:
            pass
        time.sleep(2)
        print(".", end="", flush=True)
    print("\nServer timed out!")
    return False

def test_registration():
    print("\nTesting Registration...")
    payload = {
        "username": "test_health_user",
        "email": "health@test.com",
        "password": "longpassword_safe_test"
    }
    try:
        r = requests.post(f"{BASE_URL}/auth/register", json=payload)
        if r.status_code == 201:
            print("✅ Registration SUCCESS")
            return True
        elif r.status_code == 400 and "already exists" in r.text:
             print("✅ Registration SUCCESS (User already existed)")
             return True
        else:
            print(f"❌ Registration FAILED: {r.status_code} {r.text}")
            return False
    except Exception as e:
        print(f"❌ Registration EXCEPTION: {e}")
        return False

def check_models():
    # Optional: check if models loaded (via logs or implicit status)
    pass

if __name__ == "__main__":
    if wait_for_server():
        test_registration()
    else:
        sys.exit(1)
