#!/usr/bin/env sh
set -eu
PORT="${PORT:-8080}"
# Local default: loopback. Set BIND=0.0.0.0 (or RENDER=true) for cloud hosts.
BIND="${BIND:-127.0.0.1}"
if [ "${RENDER:-}" = "true" ]; then
  BIND="0.0.0.0"
fi
SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
cd "$SCRIPT_DIR"
printf 'Manticore is running at http://%s:%s\n' "$BIND" "$PORT"
printf '  Product:  http://localhost:%s/\n' "$PORT"
printf '  Atlas:    http://localhost:%s/atlas.html\n' "$PORT"
python3 -m http.server "$PORT" --bind "$BIND"
