import asyncio
import sys
import os

# Add project root to path
sys.path.append(os.getcwd())

from backend.cortex.memory.vector_store import memory
from backend.cortex.memory.retrieval import retrieval

def test_memory():
    print("=== Testing Cortex Memory (ChromaDB) ===")
    
    # 1. Ingest
    print("[1/3] Adding test event...", end=" ")
    try:
        memory.add_event(
            content="The user is working on the OmniContext backend memory implementation.",
            metadata={"source": "test_script", "type": "test", "timestamp": 1234567890}
        )
        print("✅ Success")
    except Exception as e:
        print(f"❌ Failed: {e}")
        return

    # 2. Search
    print("[2/3] Searching for context...", end=" ")
    results = retrieval.search_context("backend memory")
    
    if results:
        print(f"✅ Found {len(results)} results.")
        print(f"   Top result: {results[0]}")
    else:
        print("❌ No results found.")

    print("\n=== Test Complete ===")

if __name__ == "__main__":
    test_memory()
