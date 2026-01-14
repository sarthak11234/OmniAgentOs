import logging
from typing import List, Dict, Optional
from cortex.memory.vector_store import memory
from cortex.core.config import config

logger = logging.getLogger("cortex.memory.retrieval")

class RetrievalService:
    """
    Handles fetching the most relevant context for a given query.
    Combines semantic search results from ChromaDB into a formatted context block.
    """
    
    async def get_relevant_context(self, query: str, limit: int = 5, event_type: Optional[str] = None) -> str:
        """
        Queries the vector store and returns a formatted string of the matching documents.
        """
        try:
            filters = {}
            if event_type:
                filters["type"] = event_type
            
            # ChromaDB expects None instead of {} for no filter
            search_filters = filters if filters else None

            # 1. Search Vector Store
            results = memory.search(query, limit=limit, filters=search_filters)
            
            if not results or not results.get("documents"):
                return "No relevant context found."

            # 2. Format Context
            documents = results.get("documents")[0]
            metadatas = results.get("metadatas")[0]
            
            formatted_context = []
            for doc, meta in zip(documents, metadatas):
                source = meta.get("source", "unknown")
                timestamp = meta.get("timestamp", "unknown")
                m_type = meta.get("type", "context")
                
                header = f"--- Source: {source} | Type: {m_type} | Time: {timestamp} ---"
                formatted_context.append(f"{header}\n{doc}")

            return "\n\n".join(formatted_context)

        except Exception as e:
            logger.error(f"Error during context retrieval: {e}")
            return f"Error retrieving context: {str(e)}"

# Global Instance
retriever = RetrievalService()
