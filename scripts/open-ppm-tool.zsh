#!/bin/zsh
# Double-click in Finder to start the PPM Tool and open Safari.
# Leave this Terminal window open while you use the app. Close it to stop.

set -u
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT" || {
  echo "Could not change to the PPM Tool folder."
  echo "Press Return to close."
  read
  exit 1
}

prepend_path_if_bin() {
  local dir="$1"
  if [[ -x "$dir/node" ]]; then
    export PATH="$dir:$PATH"
  fi
}

prepend_path_if_bin "/opt/homebrew/bin"
prepend_path_if_bin "/usr/local/bin"
if [[ -d "$HOME/.local" ]]; then
  for dir in "$HOME"/.local/node-v*/bin(NOn); do
    prepend_path_if_bin "$dir"
  done
fi
if [[ -s "$HOME/.nvm/nvm.sh" ]]; then
  source "$HOME/.nvm/nvm.sh" >/dev/null 2>&1 || true
fi
if command -v fnm >/dev/null 2>&1; then
  eval "$(fnm env)" >/dev/null 2>&1 || true
fi

fail() {
  echo
  echo "$1"
  shift
  for line in "$@"; do
    echo "$line"
  done
  echo
  echo "Press Return to close."
  read
  exit 1
}

if ! command -v node >/dev/null 2>&1; then
  fail "Runtime was not found." \
    "Install Node.js 22 or newer from https://nodejs.org" \
    "or with Homebrew:  brew install node@22" \
    "Then open this file again."
fi

if ! command -v npm >/dev/null 2>&1; then
  fail "Package manager was not found (usually installed with the runtime)." \
    "Reinstall Node.js 22+ so the package manager is on your PATH, then try again."
fi

NODE_MAJOR="$(node -p "process.versions.node.split('.')[0]" 2>/dev/null || echo 0)"
if [[ -z "$NODE_MAJOR" || "$NODE_MAJOR" -lt 22 ]]; then
  fail "PPM Tool needs Node.js 22 or newer (found $(node -v 2>/dev/null || echo unknown))." \
    "This app uses the built-in sqlite module." \
    "Upgrade the runtime, then open this file again."
fi

if [[ ! -d node_modules ]]; then
  echo "Installing dependencies (first run)…"
  if ! npm install; then
    fail "Dependency install failed. Check the messages above, fix the error, and try again."
  fi
  echo
fi

if curl -sS -m 2 -o /dev/null http://localhost:3000/ 2>/dev/null; then
  open -a Safari http://localhost:3000/ 2>/dev/null || open http://localhost:3000/
  echo "PPM Tool was already running. Browser opened to http://localhost:3000"
  echo "Press Return to close this window (the app keeps running)."
  read
  exit 0
fi

echo "Starting PPM Tool with $(node -v)…"
echo "Safari will open when the server is ready. Leave this window open."
echo "Close this window (or press Ctrl+C) to stop the app."
echo

(
  for _ in {1..90}; do
    if curl -sS -m 1 -o /dev/null http://localhost:3000/ 2>/dev/null; then
      open -a Safari http://localhost:3000/ 2>/dev/null || open http://localhost:3000/
      exit 0
    fi
    sleep 1
  done
  echo "Timed out waiting for http://localhost:3000 — check the messages above."
) &

if ! npm run dev; then
  echo
  fail "The dev server exited with an error. See messages above."
fi

echo
echo "Server stopped. Press Return to close."
read
