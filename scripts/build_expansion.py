#!/usr/bin/env python3
"""Build expanded WildAtlas content from expansion_catalog.json + iNaturalist photos."""

from __future__ import annotations

import json
import time
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
UA = "WildAtlas-Prototype/1.0 (educational; local prototype)"


def expand(raw: dict) -> dict:
    curious = raw["hook"]
    explorer = raw.get("explorer") or (
        f"{raw['common']} relies on {raw['adaptation'].lower()} while active "
        f"{raw['activity'].lower()}. {raw['hook']} In this habitat it feeds on {raw['diet'].lower()}."
    )
    naturalist = raw.get("naturalist") or (
        f"{raw['scientific']} is a {raw['group'].lower()} associated with this ecosystem. "
        f"Observers note {raw['adaptation'].lower()} and a diet centered on {raw['diet'].lower()}."
    )
    role = raw.get("role") or (
        f"As a {raw['group'].lower()}, {raw['common']} helps structure local food webs "
        f"through its {raw['diet'].lower()} feeding."
    )
    return {
        "id": raw["id"],
        "common": raw["common"],
        "scientific": raw["scientific"],
        "icon": raw["icon"],
        "group": raw["group"],
        "diet": raw["diet"],
        "activity": raw["activity"],
        "adaptation": raw["adaptation"],
        "curious": curious,
        "explorer": explorer,
        "naturalist": naturalist,
        "role": role,
        "look": raw["look"],
        "quiz": raw["quiz"],
    }


def apply_media(species: dict, photos: dict) -> dict:
    p = photos.get(species["id"])
    if not p:
        return species
    species = dict(species)
    species.update(
        {
            "photo": p["photo"],
            "photoCredit": p["photoCredit"],
            "sourceUrl": p["sourceUrl"],
            "taxonId": p["taxonId"],
        }
    )
    return species


def fetch_taxon(query: str, taxon_id: int | None = None) -> dict | None:
    if taxon_id:
        url = f"https://api.inaturalist.org/v1/taxa/{taxon_id}"
        req = urllib.request.Request(url, headers={"User-Agent": UA})
        with urllib.request.urlopen(req, timeout=30) as r:
            results = json.load(r).get("results") or []
    else:
        results = []
        for params in (
            {"q": query, "rank": "species", "per_page": "8", "is_active": "true"},
            {"q": query, "per_page": "8", "is_active": "true"},
        ):
            url = "https://api.inaturalist.org/v1/taxa?" + urllib.parse.urlencode(params)
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=30) as r:
                results = json.load(r).get("results") or []
            qlow = query.lower()
            exact = [t for t in results if (t.get("name") or "").lower() == qlow]
            results = exact or results
            if results:
                break
    for t in results:
        photo = t.get("default_photo") or {}
        url_photo = photo.get("medium_url") or photo.get("url") or photo.get("square_url")
        if not url_photo:
            continue
        attr = photo.get("attribution") or (
            f"Photo license: {photo['license_code']}" if photo.get("license_code") else "Photo via iNaturalist"
        )
        return {
            "taxonId": t["id"],
            "matchedName": t.get("name"),
            "common": t.get("preferred_common_name"),
            "photo": url_photo,
            "photoCredit": attr,
            "license": photo.get("license_code"),
            "sourceUrl": f"https://www.inaturalist.org/taxa/{t['id']}",
        }
    return None


def ensure_photos(queries: dict[str, str], photos: dict, overrides: dict[str, int]) -> dict:
    missing = {k: v for k, v in queries.items() if k not in photos}
    print(f"Fetching {len(missing)} photos ({len(photos)} cached)...")
    failed = []
    for i, (sid, query) in enumerate(missing.items(), 1):
        try:
            result = fetch_taxon(query, overrides.get(sid))
            if result:
                photos[sid] = result
                print(f"[{i}/{len(missing)}] OK {sid} -> {result['matchedName']}")
            else:
                failed.append(sid)
                print(f"[{i}/{len(missing)}] FAIL {sid}")
        except Exception as exc:  # noqa: BLE001
            failed.append(sid)
            print(f"[{i}/{len(missing)}] ERR {sid}: {exc}")
        time.sleep(0.28)
    if failed:
        print("FAILED:", failed)
    return photos


def main() -> None:
    catalog = json.loads((DATA / "expansion_catalog.json").read_text())
    snap = json.loads((DATA / "_snapshot.json").read_text())
    photos = json.loads((DATA / "species-photos.json").read_text())

    queries: dict[str, str] = {}
    overrides = catalog.get("taxonOverrides") or {}

    def ingest_species(raw_list):
        out = []
        for raw in raw_list:
            sp = expand(raw)
            queries[sp["id"]] = sp["scientific"]
            out.append(sp)
        return out

    # Start from existing extras
    extras_by_id = {loc["id"]: loc for loc in snap["extraLocations"]}
    additions = {k: [expand(s) if "hook" in s else s for s in v] for k, v in (snap.get("speciesAdditions") or {}).items()}

    # Append more species onto existing extra locations
    for loc_id, raw_list in (catalog.get("extraLocationAdditions") or {}).items():
        loc = extras_by_id[loc_id]
        have = {s["id"] for s in loc["species"]}
        for sp in ingest_species(raw_list):
            if sp["id"] not in have:
                loc["species"].append(sp)
                have.add(sp["id"])

    # New speciesAdditions for base + extras
    for loc_id, raw_list in (catalog.get("speciesAdditions") or {}).items():
        bucket = additions.setdefault(loc_id, [])
        have = {s["id"] for s in bucket}
        # also avoid colliding with species already on that extra location
        if loc_id in extras_by_id:
            have |= {s["id"] for s in extras_by_id[loc_id]["species"]}
        for sp in ingest_species(raw_list):
            if sp["id"] not in have:
                bucket.append(sp)
                have.add(sp["id"])

    # Brand-new locations
    new_locations = []
    for raw_loc in catalog["newLocations"]:
        loc = {
            "id": raw_loc["id"],
            "name": raw_loc["name"],
            "region": raw_loc["region"],
            "lat": raw_loc["lat"],
            "lon": raw_loc["lon"],
            "biomeKey": raw_loc["biomeKey"],
            "icon": raw_loc["icon"],
            "curated": True,
            "summary": raw_loc["summary"],
            "subtitle": raw_loc["subtitle"],
            "stats": raw_loc["stats"],
            "habitat": raw_loc["habitat"],
            "species": ingest_species(raw_loc["species"]),
        }
        new_locations.append(loc)

    photos = ensure_photos(queries, photos, overrides)
    (DATA / "species-photos.json").write_text(json.dumps(photos, indent=2))

    # Apply media everywhere
    for loc in extras_by_id.values():
        loc["species"] = [apply_media(s if "curious" in s else expand(s), photos) for s in loc["species"]]
    for loc in new_locations:
        loc["species"] = [apply_media(s, photos) for s in loc["species"]]
    for loc_id, arr in list(additions.items()):
        additions[loc_id] = [apply_media(s if "curious" in s else expand(s), photos) for s in arr]

    # Re-apply media on snapshot extras' original species too (already have photos)
    extra_list = list(extras_by_id.values()) + new_locations

    photo_map = {
        sid: {
            "photo": p["photo"],
            "photoCredit": p["photoCredit"],
            "sourceUrl": p["sourceUrl"],
            "taxonId": p["taxonId"],
        }
        for sid, p in photos.items()
    }

    # Ensure additions also tracked for photo map completeness
    content = {
        "retrievedAt": "2026-07-22",
        "speciesPhotos": photo_map,
        "extraLocations": extra_list,
        "speciesAdditions": additions,
    }

    missing = [sid for sid in queries if sid not in photos]
    if missing:
        raise SystemExit(f"Missing photos for: {missing}")

    out = DATA / "content.js"
    out.write_text(
        "/* Generated curated expansions + iNaturalist photo enrichment for WildAtlas. */\n"
        "window.WILDATLAS_CONTENT = "
        + json.dumps(content, indent=2, ensure_ascii=False)
        + ";\n"
    )

    n_extra_sp = sum(len(l["species"]) for l in extra_list)
    n_add = sum(len(v) for v in additions.values())
    print(
        json.dumps(
            {
                "extraLocations": len(extra_list),
                "speciesInExtras": n_extra_sp,
                "additionSpecies": n_add,
                "photos": len(photo_map),
                "newLocationIds": [l["id"] for l in new_locations],
                "bytes": out.stat().st_size,
            },
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
