from app.services.hf_client import hf_client

async def summarize_text(text: str, max_length: int = 150) -> str:
    """
    Summarize text using HuggingFace BART model
    
    Args:
        text: Text to summarize
        max_length: Maximum length of summary
    
    Returns:
        Summarized text
    """
    return await hf_client.summarize_text(text, max_length)
