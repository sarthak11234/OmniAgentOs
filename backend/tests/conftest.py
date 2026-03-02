"""Shared pytest fixtures for OmniAgentOS tests."""
import os
import pytest

# Set minimal env vars before any app imports
os.environ.setdefault("GOOGLE_API_KEY", "")


@pytest.fixture
def test_client():
    """Create a FastAPI TestClient for integration tests."""
    from fastapi.testclient import TestClient
    from app.main import app
    with TestClient(app) as client:
        yield client
