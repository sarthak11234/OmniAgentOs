import chromadb
from chromadb.config import Settings
import logging
from typing import List, Dict, Optional
import os
import uuid

logger = logging.getLogger("cortex.memory")

class MemoryService:
    """
    Wraps ChromaDB to provide simple storage and retrieval format for Cortex Events.
    """
    def __init__(self, persist_path: str = "backend/data/chroma"):
        # Ensure directory exists
        os.makedirs(persist_path, exist_ok=True)
        
        logger.info(f"Initializing ChromaDB at {persist_path}")
        self.client = chromadb.PersistentClient(path=persist_path)
        
        # Create core collection
        self.collection = self.client.get_or_create_collection(
            name="cortex_events",
            metadata={"hnsw:space": "cosine"}
        )

    def add_event(self, content: str, metadata: Dict, event_id: Optional[str] = None):
        """
        Ingests a text chunk (transcript or code) into the vector store.
        """
        if not content:
            return

        e_id = event_id or str(uuid.uuid4())
        
        try:
            self.collection.add(
                documents=[content],
                metadatas=[metadata],
                ids=[e_id]
            )
            logger.debug(f"Stored event {e_id} in memory.")
        except Exception as e:
            logger.error(f"Failed to store event: {e}")

    def search(self, query: str, limit: int = 5, filters: Optional[Dict] = None):
        """
        Semantic search for context.
        """
        results = self.collection.query(
            query_texts=[query],
            n_results=limit,
            where=filters
        )
        return results

# Global Instance
# In a real app we might dependency inject this, but for now singleton is fine.
memory = MemoryService()
