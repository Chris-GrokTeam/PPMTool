#!/bin/zsh
set -e
export PATH="$HOME/.local/node-v22.18.0-darwin-arm64/bin:$PATH"
cd "$(dirname "$0")/.."
npm run dev
