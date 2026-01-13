#!/bin/sh
set -e

# echo "Running DB migrations..."
# python -m app.db.migrate || true

echo "Starting OmniContext Unified Backend (REST + Cortex)..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --limit-max-requests 10000 --limit-concurrency 100 --timeout-keep-alive 180
