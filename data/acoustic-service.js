/* Manticore Acoustic — place-first ecosystem sound data service (browser client).
 *
 * Lookup order:
 *   1. Local seeded DB (window.WILDATLAS_ACOUSTIC_DB)
 *   2. Optional same-origin /api/v1/acoustic (when serve.sh is running)
 *   3. Live iNaturalist sounds near the pin
 *   4. Live GBIF sound occurrences near the pin
 *
 * Every clip carries provider, license, attribution, and sourceUrl.
 */
(() => {
  "use strict";

  const EARTH_KM = 6371;
  const DEFAULT_RADIUS_KM = 180;
  const LIVE_PER_PAGE = 12;
  const INAT_LICENSES = "cc0,cc-by,cc-by-sa,cc-by-nc,cc-by-nc-sa";
  const AUDIO_EXT = /\.(mp3|wav|m4a|ogg|flac|aac)(\?|$)/i;
  const AUDIO_MIME = /audio\//i;

  const toRad = (deg) => (deg * Math.PI) / 180;

  function haversineKm(lat1, lon1, lat2, lon2) {
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return 2 * EARTH_KM * Math.asin(Math.sqrt(a));
  }

  function db() {
    return window.WILDATLAS_ACOUSTIC_DB || null;
  }

  function listEcosystems() {
    const catalog = db();
    return catalog?.ecosystems ? [...catalog.ecosystems] : [];
  }

  function getEcosystem(id) {
    return listEcosystems().find((entry) => entry.id === id) || null;
  }

  function nearestEcosystems(lat, lon, { limit = 8, maxKm = 2500 } = {}) {
    return listEcosystems()
      .map((entry) => ({
        ...entry,
        distanceKm: haversineKm(lat, lon, entry.lat, entry.lon),
      }))
      .filter((entry) => entry.distanceKm <= maxKm)
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, limit);
  }

  function ecosystemAt(lat, lon, radiusKm = DEFAULT_RADIUS_KM) {
    const nearest = nearestEcosystems(lat, lon, { limit: 1, maxKm: radiusKm })[0];
    return nearest || null;
  }

  function normalizeInatObservation(obs) {
    const sound = (obs.sounds || [])[0];
    if (!sound?.file_url) return null;
    const license = String(sound.license_code || "").toLowerCase();
    if (license && !INAT_LICENSES.split(",").includes(license)) return null;
    const taxon = obs.taxon || {};
    let lat = null;
    let lon = null;
    if (obs.location && obs.location.includes(",")) {
      const [latS, lonS] = obs.location.split(",");
      lat = Number(latS);
      lon = Number(lonS);
    } else if (obs.geojson?.coordinates?.length === 2) {
      lon = Number(obs.geojson.coordinates[0]);
      lat = Number(obs.geojson.coordinates[1]);
    }
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
    return {
      id: `inat-${obs.id}-${sound.id || "s"}`,
      provider: "inaturalist",
      providerId: String(obs.id),
      taxonCommon: taxon.preferred_common_name || taxon.name || "Wildlife sound",
      taxonScientific: taxon.name || "",
      taxonId: taxon.id || null,
      lat,
      lon,
      fileUrl: String(sound.file_url).split("?")[0],
      license: license || "unknown",
      attribution: sound.attribution || obs.user?.login || "iNaturalist observer",
      sourceUrl: `https://www.inaturalist.org/observations/${obs.id}`,
      observedOn: obs.observed_on || obs.time_observed_at || "",
      type: "species_call",
    };
  }

  function isAudioMedia(media) {
    const format = media.format || "";
    const identifier = media.identifier || "";
    return AUDIO_MIME.test(format) || AUDIO_EXT.test(identifier) || /\/sounds\//.test(identifier);
  }

  function normalizeGbifOccurrence(occ) {
    const media = (occ.media || []).find(isAudioMedia);
    if (!media?.identifier) return null;
    const lat = Number(occ.decimalLatitude);
    const lon = Number(occ.decimalLongitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
    const license = String(media.license || occ.license || "")
      .replace(/^https?:\/\/creativecommons\.org\/licenses\//i, "")
      .replace(/\/\d\.\d\/?$/, "")
      .replace(/\//g, "-")
      .toLowerCase();
    return {
      id: `gbif-${occ.key}`,
      provider: "gbif",
      providerId: String(occ.key),
      taxonCommon: occ.vernacularName || occ.species || occ.scientificName || "Wildlife sound",
      taxonScientific: occ.species || occ.scientificName || "",
      taxonId: occ.taxonKey || null,
      lat,
      lon,
      fileUrl: media.identifier,
      license: license || "unknown",
      attribution: media.creator || occ.recordedBy || "GBIF contributor",
      sourceUrl: `https://www.gbif.org/occurrence/${occ.key}`,
      observedOn: occ.eventDate || "",
      type: "species_call",
    };
  }

  async function fetchJson(url, { signal } = {}) {
    const response = await fetch(url, {
      signal,
      headers: { Accept: "application/json" },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }

  async function fetchLiveInat({ lat, lon, radiusKm = 80, signal } = {}) {
    const params = new URLSearchParams({
      lat: String(lat),
      lng: String(lon),
      radius: String(radiusKm),
      sounds: "true",
      quality_grade: "research",
      sound_license: INAT_LICENSES,
      per_page: String(LIVE_PER_PAGE),
      order_by: "votes",
      order: "desc",
    });
    const data = await fetchJson(`https://api.inaturalist.org/v1/observations?${params}`, { signal });
    return (data.results || []).map(normalizeInatObservation).filter(Boolean);
  }

  async function fetchLiveGbif({ lat, lon, radiusKm = 120, signal } = {}) {
    // Approximate degree box; fine for discovery browse.
    const dLat = radiusKm / 111;
    const dLon = radiusKm / (111 * Math.max(0.2, Math.cos(toRad(lat))));
    const params = new URLSearchParams({
      mediaType: "Sound",
      hasCoordinate: "true",
      decimalLatitude: `${lat - dLat},${lat + dLat}`,
      decimalLongitude: `${lon - dLon},${lon + dLon}`,
      limit: String(LIVE_PER_PAGE),
    });
    const data = await fetchJson(`https://api.gbif.org/v1/occurrence/search?${params}`, { signal });
    return (data.results || []).map(normalizeGbifOccurrence).filter(Boolean);
  }

  async function fetchViaLocalApi({ lat, lon, radiusKm, signal } = {}) {
    const params = new URLSearchParams({
      lat: String(lat),
      lon: String(lon),
      radius_km: String(radiusKm),
    });
    try {
      return await fetchJson(`/api/v1/acoustic/soundscape?${params}`, { signal });
    } catch {
      return null;
    }
  }

  function uniqueClips(clips) {
    const seen = new Set();
    const out = [];
    for (const clip of clips) {
      if (!clip?.fileUrl || seen.has(clip.fileUrl)) continue;
      seen.add(clip.fileUrl);
      out.push(clip);
    }
    return out;
  }

  /**
   * Resolve a soundscape package for a map pin.
   * Returns { ecosystem, clips, source, status, queriedAt }.
   */
  async function resolveSoundscape({
    lat,
    lon,
    biomeKey = null,
    name = null,
    radiusKm = DEFAULT_RADIUS_KM,
    preferLive = false,
    signal = null,
  } = {}) {
    const queriedAt = new Date().toISOString();
    const localHit = ecosystemAt(lat, lon, radiusKm);
    const localClips = localHit?.clips?.length ? [...localHit.clips] : [];

    if (localClips.length && !preferLive) {
      return {
        ecosystem: {
          id: localHit.id,
          name: localHit.name,
          region: localHit.region,
          lat: localHit.lat,
          lon: localHit.lon,
          biomeKey: localHit.biomeKey,
          habitat: localHit.habitat,
          distanceKm: localHit.distanceKm,
        },
        clips: uniqueClips(localClips),
        source: "local-db",
        status: "ready",
        liveTried: false,
        queriedAt,
      };
    }

    // Same-origin data API (serve.sh) — data-services surface.
    const apiPayload = await fetchViaLocalApi({ lat, lon, radiusKm, signal });
    if (apiPayload?.clips?.length) {
      return {
        ecosystem: apiPayload.ecosystem || {
          id: `pin-${lat.toFixed(3)}-${lon.toFixed(3)}`,
          name: name || "Field station",
          region: "Live acoustic browse",
          lat,
          lon,
          biomeKey,
          habitat: biomeKey || "unknown",
          distanceKm: 0,
        },
        clips: uniqueClips(apiPayload.clips),
        source: apiPayload.source || "api",
        status: "ready",
        liveTried: true,
        queriedAt,
      };
    }

    // Live provider browse when local DB misses (or preferLive).
    const liveClips = [];
    let liveError = null;
    try {
      const inat = await fetchLiveInat({ lat, lon, radiusKm: Math.min(radiusKm, 150), signal });
      liveClips.push(...inat);
    } catch (error) {
      liveError = error;
    }
    if (liveClips.length < 3) {
      try {
        const gbif = await fetchLiveGbif({ lat, lon, radiusKm: Math.min(radiusKm, 200), signal });
        liveClips.push(...gbif);
      } catch (error) {
        liveError = liveError || error;
      }
    }

    const clips = uniqueClips([...localClips, ...liveClips]);
    if (!clips.length) {
      return {
        ecosystem: localHit
          ? {
              id: localHit.id,
              name: localHit.name,
              region: localHit.region,
              lat: localHit.lat,
              lon: localHit.lon,
              biomeKey: localHit.biomeKey,
              habitat: localHit.habitat,
              distanceKm: localHit.distanceKm,
            }
          : {
              id: `pin-${lat.toFixed(3)}-${lon.toFixed(3)}`,
              name: name || "Field station",
              region: "No acoustic matches yet",
              lat,
              lon,
              biomeKey,
              habitat: biomeKey || "unknown",
              distanceKm: 0,
            },
        clips: [],
        source: localHit ? "local-db-empty" : "live-empty",
        status: liveError ? "error" : "empty",
        liveTried: true,
        error: liveError ? String(liveError.message || liveError) : null,
        queriedAt,
      };
    }

    return {
      ecosystem: localHit
        ? {
            id: localHit.id,
            name: localHit.name,
            region: localHit.region,
            lat: localHit.lat,
            lon: localHit.lon,
            biomeKey: localHit.biomeKey,
            habitat: localHit.habitat,
            distanceKm: localHit.distanceKm,
          }
        : {
            id: `live-${lat.toFixed(2)}-${lon.toFixed(2)}`,
            name: name || "Live acoustic field station",
            region: "Browsed from global sound archives",
            lat,
            lon,
            biomeKey,
            habitat: biomeKey || "mixed habitat",
            distanceKm: 0,
          },
      clips,
      source: localClips.length ? "local+live" : "live",
      status: "ready",
      liveTried: true,
      queriedAt,
    };
  }

  function catalogStats() {
    const catalog = db();
    if (!catalog) {
      return { ecosystemCount: 0, clipCount: 0, version: null, generatedAt: null };
    }
    return {
      ecosystemCount: catalog.ecosystemCount || catalog.ecosystems?.length || 0,
      clipCount: catalog.clipCount || 0,
      version: catalog.version || 1,
      generatedAt: catalog.generatedAt || null,
      product: catalog.product || "manticore-acoustic",
    };
  }

  window.ManticoreAcoustic = {
    version: "1.0.0",
    listEcosystems,
    getEcosystem,
    nearestEcosystems,
    ecosystemAt,
    resolveSoundscape,
    fetchLiveInat,
    fetchLiveGbif,
    catalogStats,
    haversineKm,
  };
})();
