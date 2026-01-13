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

COPY app ./app

COPY entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

CMD ["./entrypoint.sh"]
