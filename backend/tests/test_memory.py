"""Tests for MemoryService (ChromaDB / Mock vector store)."""
import pytest


@pytest.fixture
def memory_service():
    """Create a fresh MemoryService in mock mode for testing."""
    from cortex.memory.vector_store import MemoryService
    # Force mock mode by creating with a non-existent path
    svc = MemoryService.__new__(MemoryService)
    svc.mock_store = []
    return svc


def test_add_event(memory_service):
    """Adding an event should store it in the mock store."""
    memory_service.add_event(
        content="Test code context from main.py",
        metadata={"source": "test", "type": "code"},
    )
    assert len(memory_service.mock_store) == 1
    assert memory_service.mock_store[0]["content"] == "Test code context from main.py"


def test_add_event_empty_content(memory_service):
    """Adding empty content should be a no-op."""
    memory_service.add_event(content="", metadata={"source": "test"})
    assert len(memory_service.mock_store) == 0


def test_search(memory_service):
    """Search should find events by keyword."""
    memory_service.add_event(
        content="Fix the authentication bug in login.py",
        metadata={"source": "vscode", "type": "code"},
    )
    memory_service.add_event(
        content="Database migration for user table",
        metadata={"source": "terminal", "type": "code"},
    )

    results = memory_service.search("authentication")
    assert len(results["documents"][0]) == 1
    assert "authentication" in results["documents"][0][0]


def test_search_no_results(memory_service):
    """Search with no matching content should return empty."""
    memory_service.add_event(
        content="Some random content",
        metadata={"source": "test"},
    )
    results = memory_service.search("nonexistent_term_xyz")
    assert len(results["documents"][0]) == 0


def test_get_recent(memory_service):
    """get_recent should return the latest N items."""
    for i in range(5):
        memory_service.add_event(
            content=f"Event {i}",
            metadata={"source": "test", "index": i},
        )

    results = memory_service.get_recent(limit=3)
    assert len(results["documents"]) == 3
    assert results["documents"][-1] == "Event 4"


def test_custom_event_id(memory_service):
    """Events with custom IDs should use the provided ID."""
    memory_service.add_event(
        content="Custom ID event",
        metadata={"source": "test"},
        event_id="custom-123",
    )
    assert memory_service.mock_store[0]["id"] == "custom-123"
