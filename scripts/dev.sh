#!/bin/zsh
# Start the Next.js dev server. Prefer runtime already on PATH; fall back to
# Homebrew / nvm / fnm / ~/.local versioned installs.
set -euo pipefail
cd "$(cd "$(dirname "$0")/.." && pwd)"

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

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js not found. Install Node 22+ from https://nodejs.org" >&2
  exit 1
fi
if ! command -v npm >/dev/null 2>&1; then
  echo "Package manager not found. Reinstall Node 22+ so it is on PATH." >&2
  exit 1
fi
NODE_MAJOR="$(node -p "process.versions.node.split('.')[0]" 2>/dev/null || echo 0)"
if [[ "$NODE_MAJOR" -lt 22 ]]; then
  echo "Need Node.js 22+ (found $(node -v)). This app uses built-in sqlite." >&2
  exit 1
fi

npm run dev
