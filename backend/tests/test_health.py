"""Tests for health and root endpoints."""


def test_health_endpoint(test_client):
    """GET /health should return 200 with status ok."""
    response = test_client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"


def test_root_endpoint(test_client):
    """GET / should return system status overview."""
    response = test_client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "system" in data
    assert "modules" in data


def test_api_health_endpoint(test_client):
    """GET /api/v1/health/health should return 200."""
    response = test_client.get("/api/v1/health/health")
    assert response.status_code == 200
