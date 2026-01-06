import passlib
from passlib.context import CryptContext
import sys

# Try PBKDF2 which has no 72 byte limit
print("Testing PBKDF2_SHA256...")
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

def test_hash(password):
    print(f"\n--- Testing password of length {len(password)} ---")
    try:
        hashed = pwd_context.hash(password)
        print(f"SUCCESS! Hash: {hashed[:20]}...")
        return True
    except Exception as e:
        print(f"FAIL: {e}")
        return False

if __name__ == "__main__":
    test_hash("short")
    test_hash("a" * 80)
    test_hash("b" * 200)

