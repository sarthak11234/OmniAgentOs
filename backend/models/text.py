from transformers import pipeline
from sentence_transformers import SentenceTransformer

# Load summarization and embedding models once
_summarizer = pipeline("summarization", model="facebook/bart-large-cnn")
_embedder = SentenceTransformer("all-MiniLM-L6-v2")

def summarize_text(text: str) -> str:
    """
    Summarize input text using Hugging Face summarization pipeline.
    """
    summary = _summarizer(text, max_length=130, min_length=30, do_sample=False)
    return summary[0]["summary_text"]

def get_text_embedding(text: str):
    """
    Get embedding vector for the given text.
    """
    return _embedder.encode([text])[0]
