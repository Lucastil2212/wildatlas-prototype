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
printf '  Acoustic:   http://localhost:%s/api/v1/acoustic/health\n' "$PORT"
exec python3 - "$BIND" "$PORT" <<'PY'
import json
import math
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

bind, port = sys.argv[1], int(sys.argv[2])
ROOT = Path(".").resolve()
rewrites = {
    "/atlas": "/atlas.html",
    "/atlas/": "/atlas.html",
    "/nestvue": "/nestvue.html",
    "/nestvue/": "/nestvue.html",
}

ACOUSTIC_DB = {"ecosystems": [], "ecosystemCount": 0, "clipCount": 0, "version": 1}
db_path = ROOT / "data" / "acoustic-ecosystems.js"
if db_path.exists():
    text = db_path.read_text(encoding="utf-8")
    match = re.search(r"window\.WILDATLAS_ACOUSTIC_DB\s*=\s*(\{.*\})\s*;\s*$", text, re.S)
    if match:
        ACOUSTIC_DB = json.loads(match.group(1))


def haversine_km(lat1, lon1, lat2, lon2):
    r = 6371.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp = math.radians(lat2 - lat1)
    dl = math.radians(lon2 - lon1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * r * math.asin(math.sqrt(a))


def nearest_ecosystem(lat, lon, radius_km=180):
    best = None
    for entry in ACOUSTIC_DB.get("ecosystems") or []:
        dist = haversine_km(lat, lon, entry["lat"], entry["lon"])
        if dist > radius_km:
            continue
        if best is None or dist < best["distanceKm"]:
            best = {**entry, "distanceKm": round(dist, 1)}
    return best


def fetch_json(url, timeout=20):
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": "ManticoreAcousticAPI/1.0",
            "Accept": "application/json",
        },
    )
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read().decode("utf-8"))


def live_inat(lat, lon, radius_km=120):
    params = urllib.parse.urlencode(
        {
            "lat": lat,
            "lng": lon,
            "radius": min(radius_km, 200),
            "sounds": "true",
            "quality_grade": "research",
            "sound_license": "cc0,cc-by,cc-by-sa,cc-by-nc,cc-by-nc-sa",
            "per_page": 12,
            "order_by": "votes",
            "order": "desc",
        }
    )
    data = fetch_json(f"https://api.inaturalist.org/v1/observations?{params}")
    clips = []
    for obs in data.get("results") or []:
        sounds = obs.get("sounds") or []
        if not sounds:
            continue
        sound = sounds[0]
        if not sound.get("file_url"):
            continue
        taxon = obs.get("taxon") or {}
        loc = obs.get("location") or ""
        o_lat = o_lon = None
        if "," in loc:
            try:
                o_lat, o_lon = map(float, loc.split(",", 1))
            except ValueError:
                pass
        clips.append(
            {
                "id": f"inat-{obs.get('id')}-{sound.get('id')}",
                "provider": "inaturalist",
                "providerId": str(obs.get("id")),
                "taxonCommon": taxon.get("preferred_common_name") or taxon.get("name") or "Wildlife sound",
                "taxonScientific": taxon.get("name") or "",
                "taxonId": taxon.get("id"),
                "lat": o_lat if o_lat is not None else lat,
                "lon": o_lon if o_lon is not None else lon,
                "fileUrl": str(sound["file_url"]).split("?")[0],
                "license": (sound.get("license_code") or "unknown").lower(),
                "attribution": sound.get("attribution") or "iNaturalist observer",
                "sourceUrl": f"https://www.inaturalist.org/observations/{obs.get('id')}",
                "observedOn": obs.get("observed_on") or "",
                "type": "species_call",
            }
        )
    return clips


def unique_clips(clips):
    seen = set()
    out = []
    for clip in clips:
        key = clip.get("fileUrl")
        if not key or key in seen:
            continue
        seen.add(key)
        out.append(clip)
    return out


def resolve_soundscape(lat, lon, radius_km=180):
    local = nearest_ecosystem(lat, lon, radius_km)
    clips = list((local or {}).get("clips") or [])
    source = "local-db" if clips else "live"
    if len(clips) < 3:
        try:
            clips = unique_clips(clips + live_inat(lat, lon, radius_km))
            source = "local+live" if local and (local.get("clips")) else "live"
        except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as exc:
            if not clips:
                return {
                    "ecosystem": None,
                    "clips": [],
                    "source": "error",
                    "status": "error",
                    "error": str(exc),
                }
    ecosystem = None
    if local:
        ecosystem = {
            "id": local["id"],
            "name": local["name"],
            "region": local["region"],
            "lat": local["lat"],
            "lon": local["lon"],
            "biomeKey": local.get("biomeKey"),
            "habitat": local.get("habitat"),
            "distanceKm": local.get("distanceKm"),
        }
    else:
        ecosystem = {
            "id": f"live-{lat:.2f}-{lon:.2f}",
            "name": "Live acoustic field station",
            "region": "Browsed from global sound archives",
            "lat": lat,
            "lon": lon,
            "biomeKey": None,
            "habitat": "mixed habitat",
            "distanceKm": 0,
        }
    return {
        "ecosystem": ecosystem,
        "clips": unique_clips(clips),
        "source": source,
        "status": "ready" if clips else "empty",
        "catalog": {
            "ecosystemCount": ACOUSTIC_DB.get("ecosystemCount"),
            "clipCount": ACOUSTIC_DB.get("clipCount"),
            "generatedAt": ACOUSTIC_DB.get("generatedAt"),
        },
    }


class Handler(SimpleHTTPRequestHandler):
    def _send_json(self, payload, status=200):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Cache-Control", "public, max-age=60")
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        if self.path.startswith("/api/"):
            self.send_response(204)
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
            self.send_header("Access-Control-Allow-Headers", "Content-Type, Accept")
            self.end_headers()
            return
        self.send_error(404)

    def do_GET(self):
        path = self.path.split("?", 1)[0]
        query = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)

        if path == "/api/v1/acoustic/health":
            return self._send_json(
                {
                    "ok": True,
                    "service": "manticore-acoustic",
                    "version": 1,
                    "ecosystemCount": ACOUSTIC_DB.get("ecosystemCount"),
                    "clipCount": ACOUSTIC_DB.get("clipCount"),
                    "generatedAt": ACOUSTIC_DB.get("generatedAt"),
                    "liveProviders": ["inaturalist", "gbif"],
                }
            )

        if path == "/api/v1/acoustic/ecosystems":
            slim = [
                {
                    "id": e["id"],
                    "name": e["name"],
                    "region": e["region"],
                    "lat": e["lat"],
                    "lon": e["lon"],
                    "biomeKey": e.get("biomeKey"),
                    "habitat": e.get("habitat"),
                    "clipCount": e.get("clipCount", len(e.get("clips") or [])),
                }
                for e in ACOUSTIC_DB.get("ecosystems") or []
            ]
            return self._send_json(
                {
                    "count": len(slim),
                    "ecosystems": slim,
                    "generatedAt": ACOUSTIC_DB.get("generatedAt"),
                }
            )

        if path == "/api/v1/acoustic/soundscape":
            try:
                lat = float((query.get("lat") or [None])[0])
                lon = float((query.get("lon") or query.get("lng") or [None])[0])
                radius_km = float((query.get("radius_km") or ["180"])[0])
            except (TypeError, ValueError):
                return self._send_json({"error": "lat and lon are required numbers"}, status=400)
            return self._send_json(resolve_soundscape(lat, lon, radius_km))

        if path.startswith("/api/"):
            return self._send_json({"error": "not found"}, status=404)

        if path in rewrites:
            suffix = ""
            if "?" in self.path:
                suffix = "?" + self.path.split("?", 1)[1]
            self.path = rewrites[path] + suffix
        return SimpleHTTPRequestHandler.do_GET(self)


ThreadingHTTPServer((bind, port), Handler).serve_forever()
PY
