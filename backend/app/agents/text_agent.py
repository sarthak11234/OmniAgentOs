from app.services.hf_client import hf_client

async def generate_text(prompt: str, max_length: int = 256) -> str:
    """
    Generate text using HuggingFace Llama model
    
    Args:
        prompt: The prompt to generate text from
        max_length: Maximum length of generated text
    
    Returns:
        Generated text string
    """
    return await hf_client.generate_text(prompt, max_length)
