#!/bin/zsh
# Double-click in Finder to start the PPM Tool and open Safari.
DIR="$(cd "$(dirname "$0")" && pwd)"
exec /bin/zsh "$DIR/scripts/open-ppm-tool.zsh"
