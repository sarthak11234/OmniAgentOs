import logging
from typing import List, Dict, Any
from cortex.memory.vector_store import memory

logger = logging.getLogger("cortex.retrieval")

class ContextRetrieval:
    """
    Logic for retrieving relevant context from Memory (ChromaDB)
    based on user queries or current activity.
    """
    
    def __init__(self):
        self.memory = memory

    def search_context(self, query: str, limit: int = 5) -> List[str]:
        """
        Simple semantic search against the vector store.
        Returns a list of content strings.
        """
        logger.info(f"Searching context for: '{query}'")
        
        try:
            results = self.memory.search(query, limit=limit)
            
            # ChromaDB returns a dict with 'documents', 'metadatas', etc. which are lists of lists.
            # We flatten this for the consumer.
            documents = results.get("documents", [])
            
            if not documents:
                return []
                
            # documents is [[doc1, doc2, ...]]
            flat_docs = documents[0]
            return flat_docs
            
        except Exception as e:
            logger.error(f"Retrieval failed: {e}")
            return []

# Global Instance
retrieval = ContextRetrieval()
