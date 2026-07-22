# Data and imagery attribution

## Earth imagery

The globe uses the NASA Visible Earth **Blue Marble** texture distributed by NASA's Scientific Visualization Studio.

- Project page: https://svs.gsfc.nasa.gov/2915/
- Local source file: `assets/earth-blue-marble.png`
- Original texture: https://svs.gsfc.nasa.gov/vis/a000000/a002900/a002915/bluemarble-2048.png
- Credit: NASA / Visible Earth / Scientific Visualization Studio

NASA states that the Blue Marble images are freely available to educators and the public. Preserve NASA credit in any redistributed version.

## Wildlife observations and photos

When a learner explicitly requests live sightings, the prototype calls the iNaturalist API:

- API documentation: https://api.inaturalist.org/v1/docs/
- Endpoint used: `/v1/observations/species_counts`
- Website: https://www.inaturalist.org/

Photo attribution returned by the service is displayed in the species profile. A production implementation should retain the underlying taxon/observation link, license, photographer attribution, and retrieval date for every media asset.

### Curated encyclopedia photos

Curated species profiles also use **default taxon photos** from iNaturalist (medium-resolution CDN URLs), stored with photographer/license attribution and a taxon link in `data/content.js` / `data/species-photos.json`.

- Retrieval date for the current prototype enrichment: **2026-07-22**
- Credits are shown under each species visual, with a link to the iNaturalist taxon page
- These photos remain the property of their creators under the licenses shown (often CC BY-NC or similar); they are not redistributed as local files in this prototype

Regenerate enrichment with a local script against the iNaturalist `/v1/taxa` endpoint if photos need refreshing.

## Place search and weather

Place-name lookup and live weather both use Open-Meteo:

- Geocoding docs: https://open-meteo.com/en/docs/geocoding-api
- Geocoding endpoint: `https://geocoding-api.open-meteo.com/v1/search`
- Forecast docs: https://open-meteo.com/en/docs
- Forecast endpoint: `https://api.open-meteo.com/v1/forecast`

Current conditions and a 3-day outlook are requested for every selected location (curated journeys, dropped pins, and searched places). Open-Meteo's geocoding database is based on GeoNames. Production use should follow the current Open-Meteo and GeoNames attribution and licensing requirements.

## Habitat artwork

The eight biome illustrations were procedurally generated for this prototype by `generate_assets.py`. They are illustrative backdrops, not documentary photographs and not suitable as evidence for species identification.

## Educational copy

The curated habitat and species descriptions were authored for product demonstration. They require editorial and scientific review before use as a formal educational reference.
