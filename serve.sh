#!/usr/bin/env sh
set -eu
PORT="${PORT:-8080}"
BIND="${BIND:-127.0.0.1}"
if [ "${RENDER:-}" = "true" ]; then
  BIND="0.0.0.0"
fi
SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
cd "$SCRIPT_DIR"
printf 'Manticore is running at http://%s:%s\n' "$BIND" "$PORT"
printf '  Field Node: http://localhost:%s/\n' "$PORT"
printf '  NestVue:    http://localhost:%s/nestvue\n' "$PORT"
printf '  Atlas:      http://localhost:%s/atlas\n' "$PORT"
exec python3 - "$BIND" "$PORT" <<'PY'
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

bind, port = sys.argv[1], int(sys.argv[2])
rewrites = {
    "/atlas": "/atlas.html",
    "/atlas/": "/atlas.html",
    "/nestvue": "/nestvue.html",
    "/nestvue/": "/nestvue.html",
}

class Handler(SimpleHTTPRequestHandler):
    def send_head(self):
        path = self.path.split("?", 1)[0]
        if path in rewrites:
            suffix = ""
            if "?" in self.path:
                suffix = "?" + self.path.split("?", 1)[1]
            self.path = rewrites[path] + suffix
        return super().send_head()

ThreadingHTTPServer((bind, port), Handler).serve_forever()
PY
