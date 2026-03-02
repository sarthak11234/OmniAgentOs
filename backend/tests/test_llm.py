"""Tests for LLMEngine error handling and graceful degradation."""
import os
import pytest


@pytest.fixture
def llm_no_key(monkeypatch):
    """Create an LLMEngine with no API key."""
    monkeypatch.setenv("GOOGLE_API_KEY", "")
    from cortex.models.llm import LLMEngine
    return LLMEngine()


def test_llm_not_initialized_without_key(llm_no_key):
    """LLMEngine should not initialize without API key."""
    assert llm_no_key.initialized is False


@pytest.mark.asyncio
async def test_generate_response_without_key(llm_no_key):
    """generate_response should return error message when not initialized."""
    result = await llm_no_key.generate_response("Hello")
    assert "Error" in result
    assert isinstance(result, str)


@pytest.mark.asyncio
async def test_summarize_without_key(llm_no_key):
    """summarize should return error message when not initialized."""
    result = await llm_no_key.summarize("Some text to summarize")
    assert "Error" in result
    assert isinstance(result, str)
