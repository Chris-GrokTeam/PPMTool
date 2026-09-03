#!/bin/zsh
# Double-click in Finder to start the PPM Tool and open Safari.
# Leave this Terminal window open while you use the app. Close it to stop.

set -e
cd "$(dirname "$0")"
export PATH="$HOME/.local/node-v22.18.0-darwin-arm64/bin:$PATH"

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js was not found. Expected PATH entry:"
  echo "  $HOME/.local/node-v22.18.0-darwin-arm64/bin"
  echo "Press Return to close."
  read
  exit 1
fi

if curl -sS -m 2 -o /dev/null http://localhost:3000/ 2>/dev/null; then
  open -a Safari http://localhost:3000/
  echo "PPM Tool was already running. Safari opened to http://localhost:3000"
  echo "Press Return to close this window (the app keeps running)."
  read
  exit 0
fi

echo "Starting PPM Tool…"
echo "Safari will open when the server is ready. Leave this window open."
echo "Close this window (or press Ctrl+C) to stop the app."
echo

(
  for _ in {1..90}; do
    if curl -sS -m 1 -o /dev/null http://localhost:3000/ 2>/dev/null; then
      open -a Safari http://localhost:3000/
      exit 0
    fi
    sleep 1
  done
  echo "Timed out waiting for http://localhost:3000 — check the messages above."
) &

npm run dev
echo
echo "Server stopped. Press Return to close."
read
