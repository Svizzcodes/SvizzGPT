#!/bin/bash
set -e

# ============================================================
# SVIZZGPT OVERLAY LAUNCHER
# ============================================================

echo "=================================================="
echo "          INITIALIZING SVIZZGPT OVERLAY           "
echo "=================================================="

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "[!] .env file not found. Copying from .env.example..."
    cp .env.example .env
fi

# Ensure Python Virtual Environment is setup
if [ ! -d "backend/venv" ]; then
    echo "[*] Creating Python virtual environment..."
    python3 -m venv backend/venv
    backend/venv/bin/pip install --upgrade pip
    backend/venv/bin/pip install -r backend/requirements.txt
fi

# Start Backend Server in background
echo "[*] Starting FastAPI Backend on http://localhost:8000..."
backend/venv/bin/python backend/run.py &
BACKEND_PID=$!

# Trap Ctrl+C to kill both backend and frontend processes
cleanup() {
    echo ""
    echo "[*] Shutting down SvizzGPT..."
    kill $BACKEND_PID 2>/dev/null || true
    exit 0
}
trap cleanup SIGINT SIGTERM

echo "[*] Starting Web Overlay on http://localhost:5173..."
echo "[*] Shortcut to toggle: Ctrl+Space (Windows) or Cmd+Space (Mac) or Esc to hide"
echo "[*] For full native floating overlay on top of full-screen apps, run: cd frontend && npm run desktop"

# Start Frontend Dev Server
cd frontend
npm run dev

# Wait on backend process
wait $BACKEND_PID
