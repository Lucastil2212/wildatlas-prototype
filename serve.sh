#!/usr/bin/env sh
set -eu
PORT="${PORT:-8080}"
SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
cd "$SCRIPT_DIR"
printf 'Manticore is running at http://localhost:%s\n' "$PORT"
printf '  Product:  http://localhost:%s/\n' "$PORT"
printf '  Atlas:    http://localhost:%s/atlas.html\n' "$PORT"
python3 -m http.server "$PORT" --bind 127.0.0.1
