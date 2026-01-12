# OmniContext OS 🧠

> **The Unified Context Operating System for Developers.**
> *Evolution of the OmniAgentOS Project*

**OmniContext** is an open-source, local-first AI "Brain" that bridges the gap between your code, your meetings, and your research. It captures context from everywhere—your IDE, your system audio, and your browser—so you never have to copy-paste context again.

---

## 📑 Table of Contents
1.  [Abstract & Vision](#-abstract--vision)
2.  [The Core Problem](#-the-core-problem)
3.  [The OmniContext Solution](#-the-omnicontext-solution)
4.  [Architecture Deep Dive](#-architecture-deep-dive)
    *   [The Cortex (Backend)](#1-the-cortex-backend)
    *   [The Event Bus Protocol](#2-the-event-bus-protocol)
    *   [The Satellites](#3-the-satellites)
5.  [Model Strategy & Hardware](#-model-strategy--hardware)
6.  [Security & Privacy](#-security--privacy-manifesto)
7.  [Legacy History (V1)](#-legacy-history-omniagentos-v1)
8.  [Roadmap](#-roadmap)

---

## 🔭 Abstract & Vision

We are entering the era of **Contextual AI**. The limitations of current AI tools are not in their intelligence (LLMs are smart enough), but in their **blindness**. Your AI assistant is isolated in a browser tab or a specific application, unaware of the rich context of your entire workflow.

**OmniContext** envisions a future where your AI is an **Operating System Service**, not an app. It runs in the background, securely perceiving what you perceive (audio, code, text), building a "Knowledge Graph" of your work, and offering proactive assistance.

**The End Goal**: "Computer, implement the changes discussed in the design review meeting this morning."
*To answer this, the system must know:*
1.  What was said in the meeting (Audio Context).
2.  Which file is the "design review" referring to (Code Context).
3.  How to implement code (Model Capability).

---

## 💥 The Core Problem

Today's developer workflow is fragmented across three distinct "Context Silos":

1.  **The Communication Silo (Zoom/Slack/Teams)**:
    *   *Data*: Decisions, requirements, changes in direction.
    *   *Problem*: This data is ephemeral. Once the meeting ends, the context is lost or buried in a transcript that your Code Editor doesn't know about.

2.  **The Execution Silo (VS Code/Terminal)**:
    *   *Data*: Source code, error logs, file structure.
    *   *Problem*: Copilot sees your file, but it doesn't know *why* you are writing it. It lacks the business logic defined in the meeting.

3.  **The Knowledge Silo (Browser/Docs)**:
    *   *Data*: StackOverflow answers, Documentation, Jira tickets.
    *   *Problem*: You research a solution in Chrome, then switch to VS Code, and the AI has already forgotten what you just read.

**Result**: The user acts as the "Human Router", constantly copy-pasting text between these silos to give the AI enough context to be useful.

---

## 💡 The OmniContext Solution

We propose a **Hub-and-Spoke** architecture to break down these silos.

*   **The Hub ("Cortex")**: A local server that acts as the "Long-Term Memory" and "Reasoning Engine".
*   **The Spokes ("Satellites")**: Lightweight background processes that capture data from specific apps and stream it to the Hub.

This creates a **Unified Context Graph**:
`Meeting(Time: 10AM) --related_to--> JiraTicket(ID: 123) --related_to--> CodeFile(auth.py)`

---

## 🏗 Architecture Deep Dive

### 1. The Cortex (Backend)
The Cortex is the central server (FastAPI) running on `localhost:8000`. It is **stateful** and **event-driven**.

*   **Stream Manager**:
    *   Accepts WebSocket connections from Satellites.
    *   Handles "Backpressure" (if the meeting audio is coming too fast, it buffers it).
    *   Performs "Diarization" (identifying who is speaking).

*   **Memory Service (ChromaDB)**:
    *   Instead of saving raw text, we save **Embeddings**.
    *   We use a **Vector Database** (Chroma) to store every "Event" (a sentence spoken, a function written).
    *   **Retrieval Strategy**: We use Hybrid Search (Vector Similarity + Time-Decay). Recent events are weighted higher.

### 2. The Event Bus Protocol
All Satellites communicate with Cortex using a strict JSON Schema over WebSockets.

**Example: Audio Event (from Desktop)**
```json
{
  "type": "audio_chunk",
  "source": "desktop_audio",
  "timestamp": 1704381234,
  "payload": {
    "format": "pcm_16bit",
    "sample_rate": 16000,
    "data": "<base64_encoded_audio>"
  }
}
```

**Example: Code Event (from VS Code)**
```json
{
  "type": "code_context",
  "source": "vscode_extension",
  "timestamp": 1704381240,
  "payload": {
    "filename": "auth_service.py",
    "cursor_line": 42,
    "content_snippet": "def login(user): ..."
  }
}
```

### 3. The Satellites

#### 🛰 Satellite-Meet (The Scribe)
*   **Implementation**: Python script using `sounddevice` and system-level audio loopback (WASAPI on Windows, Blackhole on macOS).
*   **Behavior**:
    *   Runs in the System Tray.
    *   Detects Voice Activity (VAD).
    *   Only streams when speech is detected to save bandwidth/compute.

#### 🛰 Satellite-Code (The Pair Programmer)
*   **Implementation**: VS Code Extension (TypeScript).
*   **Behavior**:
    *   **Passive Mode**: Watches file switches and edits. Indexes "Active Context" into the Brain.
    *   **Active Mode**: A Chat Sidebar where you can ask, "What did we say about this function?"

---

## 🧠 Model Strategy & Hardware

OmniContext is designed to run **100% Locally** using the HuggingFace ecosystem. We support a tiered model strategy:

### Tier A: "The Laptop User" (Efficiency)
*For MacBook Air M1/M2 or Laptops with 16GB RAM.*
*   **LLM**: **Llama-3-8B-Instruct** (Quantized Q4_K_M).
    *   *VRAM Usage*: ~5-6 GB.
    *   *Speed*: Fast token generation.
*   **Transcription**: **Whisper-Base**.
    *   *Speed*: Real-time.
    *   *Accuracy*: Good for clear meetings.

### Tier B: "The Workstation" (Power)
*For Desktops with NVIDIA RTX 3090/4090 (24GB VRAM).*
*   **LLM**: **Mixtral-8x7B** or **Llama-3-70B** (high quantization).
    *   *VRAM Usage*: ~20-22 GB.
    *   *Capability*: GPT-4 class reasoning. Can handle complex architectural queries.
*   **Transcription**: **Whisper-Large-V3**.
    *   *Accuracy*: Professional grade, handles accents/noise perfectly.

---

## 🔒 Security & Privacy Manifesto

**"Your Context is Your IP."**

In a corporate environment, sending your proprietary code and confidential meeting audio to OpenAI/Anthropic is often a security violation.

1.  **Local-First / Local-Only**:
    *   OmniContext sends **ZERO** data to the cloud.
    *   All inference happens on your GPU.
    *   All vector data is stored in `./data/chroma` on your disk.

2.  **Air-Gapped Capable**:
    *   You can unplug your internet cable, and OmniContext will still strictly function (once models are downloaded).

---

## 📜 Legacy History: OmniAgentOS (V1)

**OmniAgentOS (V1)** was our proof-of-concept. It demonstrated that Python and FastAPI could orchestrate local models.

**Key V1 Features:**
*   Stateless REST API.
*   Simple "Text-In, Text-Out" endpoints.
*   Basic `hf_client.py` wrapper around Transformers.

**Why we moved to V2**:
V1 was too slow and disconnected. Using REST for audio meant uploading a file *after* the meeting ended. V2's WebSockets allow us to transcribe *during* the meeting, so the context is ready the second you hang up.

---

## � Usage & Installation

### prerequisites
*   **Python**: 3.10+
*   **Hardware**: NVIDIA GPU (CUDA) or Apple Silicon (MPS). CPU-only is possible but slow.

### Quick Start
1.  **Clone**: `git clone ...`
2.  **Install Environment**:
    ```bash
    python -m venv venv
    source venv/bin/activate  # or venv\Scripts\activate
    pip install -r backend/requirements.txt
    ```
3.  **Run Cortex**:
    ```bash
    uvicorn backend.main:app --reload --port 8000
    ```
4.  **Connect Satellites**:
    *   (Instructions to follow in Phase 2 & 3)

---

## 🗺 Detailed Roadmap

*   **Phase 1: Cortex Foundation** (Current)
    *   [ ] Event Bus Implementation.
    *   [ ] ChromaDB Integration.
    *   [ ] Streaming Whisper Pipeline.
*   **Phase 2: VS Code Satellite**
    *   [ ] Extension Scaffold.
    *   [ ] Sidebar Chat UI.
    *   [ ] "Active File" Watcher.
*   **Phase 3: Audio Satellite**
    *   [ ] System Audio Capture.
    *   [ ] Voice Activity Detection.
*   **Phase 4: The Unification**
    *   [ ] RAG Pipeline (Connecting Audio -> Code).

---
*Built with ❤️ by the Open Source Community*
