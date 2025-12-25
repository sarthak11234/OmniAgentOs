#!/bin/sh
set -e

echo "Running DB migrations..."
python -m app.db.migrate || true

echo "Starting uvicorn..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
