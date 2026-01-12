import logging
from typing import List, Dict, Optional
import os
import uuid
import json

logger = logging.getLogger("cortex.memory")

# Try to import ChromaDB, fallback to Mock if missing
try:
    import chromadb
    from chromadb.config import Settings
    HAS_CHROMA = True
except ImportError:
    HAS_CHROMA = False
    logger.warning("⚠️ ChromaDB not found. Running in MOCK MEMORY mode (No persistence).")

class MemoryService:
    """
    Wraps ChromaDB (or Mock) to provide storage and retrieval for Cortex Events.
    """
    def __init__(self, persist_path: str = "backend/data/chroma"):
        self.persist_path = persist_path
        
        if HAS_CHROMA:
            # Ensure directory exists
            os.makedirs(persist_path, exist_ok=True)
            logger.info(f"Initializing ChromaDB at {persist_path}")
            self.client = chromadb.PersistentClient(path=persist_path)
            self.collection = self.client.get_or_create_collection(
                name="cortex_events",
                metadata={"hnsw:space": "cosine"}
            )
        else:
            self.mock_store = []

    def add_event(self, content: str, metadata: Dict, event_id: Optional[str] = None):
        """
        Ingests a text chunk (transcript or code) into the vector store.
        """
        if not content:
            return

        e_id = event_id or str(uuid.uuid4())
        
        if HAS_CHROMA:
            try:
                self.collection.add(
                    documents=[content],
                    metadatas=[metadata],
                    ids=[e_id]
                )
                logger.debug(f"Stored event {e_id} in memory.")
            except Exception as e:
                logger.error(f"Failed to store event: {e}")
        else:
            # Mock Implementation
            record = {"id": e_id, "content": content, "metadata": metadata}
            self.mock_store.append(record)
            logger.info(f"[MOCK] Stored event: {content[:30]}...")

    def search(self, query: str, limit: int = 5, filters: Optional[Dict] = None):
        """
        Semantic search for context.
        """
        if HAS_CHROMA:
            results = self.collection.query(
                query_texts=[query],
                n_results=limit,
                where=filters
            )
            return results
        else:
            # Simple keyword search for Mock
            # Retrieve last N items that contain the query words
            matches = [
                r for r in self.mock_store 
                if query.lower() in r["content"].lower()
            ]
            return {"documents": [[m["content"] for m in matches[:limit]]]}

# Global Instance
memory = MemoryService()
