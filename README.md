# Manticore Field Node

**Install a Field Node in your habitat — or integrate with Manticore data services.**

Manticore is a product and service business for private, local-first wildlife observation and habitat monitoring. The Field Node runs edge AI on-device; optional data services handle sync, schemas, and multi-site intelligence when you want a network.

## Run it locally

```bash
cd wildatlas-prototype
./serve.sh
```

Open `http://localhost:8080`.

| Route | What |
|-------|------|
| `/` | Product site — install vs integrate |
| `/field-node.html` | Full-viewport product image |
| `/atlas.html` | WildAtlas globe / habitat demo (prototype) |

## Assets

Product imagery and schemas live in [`assets/manticore-field-node/`](assets/manticore-field-node/):

- `Manticore-Field-Node.png` — hardware hero
- `hardware_schema.png` — sensors, compute, power, deployment
- `software_data_schema.png` — capture → classify → signed log → sync

## Atlas demo

The original WildAtlas 3D globe prototype remains at `/atlas.html` as a habitat intelligence demo. See `ATTRIBUTION.md` for data credits used there.
