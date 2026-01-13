FROM python:3.11-slim

WORKDIR /app

# Install system dependencies including ffmpeg for audio processing and build tools for python packages
RUN apt-get update && apt-get install -y \
    ffmpeg \
    build-essential \
    cmake \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code into 'backend' package structure to support 'from backend.cortex...' imports
COPY . ./backend

# Add /app and /app/backend to PYTHONPATH so both 'backend' and 'app' packages are found
ENV PYTHONPATH=/app:/app/backend

# Ensure entrypoint is executable (fix potential windows permissions issues during copy)
RUN sed -i 's/\r$//' ./backend/entrypoint.sh && chmod +x ./backend/entrypoint.sh

CMD ["./backend/entrypoint.sh"]
