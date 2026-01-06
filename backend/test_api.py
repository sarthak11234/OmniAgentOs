"""Test the registration endpoint"""
import requests
import json

BASE_URL = "http://localhost:8000"

print("=" * 60)
print("Testing OmniAgentOS Backend API")
print("=" * 60)

# Test 1: Register a new user
print("\n1. Testing Registration Endpoint")
print("-" * 60)

register_data = {
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
}

try:
    response = requests.post(
        f"{BASE_URL}/api/v1/auth/register",
        json=register_data,
        headers={"Content-Type": "application/json"}
    )
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    if response.status_code == 201:
        print("✅ Registration successful!")
    else:
        print(f"⚠️ Registration failed: {response.json()}")
        
except Exception as e:
    print(f"❌ Error: {e}")

# Test 2: Login with the created user
print("\n2. Testing Login Endpoint")
print("-" * 60)

login_data = {
    "username": "testuser",
    "password": "password123"
}

try:
    response = requests.post(
        f"{BASE_URL}/api/v1/auth/login",
        json=login_data,
        headers={"Content-Type": "application/json"}
    )
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    if response.status_code == 200:
        print("✅ Login successful!")
        token = response.json().get("access_token")
        print(f"Access Token: {token[:50]}...")
    else:
        print(f"⚠️ Login failed: {response.json()}")
        
except Exception as e:
    print(f"❌ Error: {e}")

print("\n" + "=" * 60)
print("Testing Complete!")
print("=" * 60)
