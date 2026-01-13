#!/bin/sh
set -e

# echo "Running DB migrations..."
# python -m app.db.migrate || true

echo "Starting OmniContext Cortex..."
exec uvicorn backend.cortex.main:app --host 0.0.0.0 --port 8000 --limit-max-requests 10000 --limit-concurrency 100 --timeout-keep-alive 180
