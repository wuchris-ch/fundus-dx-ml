#!/usr/bin/env bash
set -euo pipefail

backend_cmd="uvicorn api.main:app --reload --host 0.0.0.0 --port 8000"
echo "Starting backend: ${backend_cmd}"
${backend_cmd} &
BACKEND_PID=$!

cleanup() {
  echo "Stopping backend (pid ${BACKEND_PID})"
  kill "${BACKEND_PID}" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

echo "Starting frontend: npm run dev (from frontend/)"
pushd frontend >/dev/null
npm run dev
popd >/dev/null
