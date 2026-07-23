# Manticore

**Install a Field Node in your habitat — or preorder NestVue for the backyard nest.**

Manticore is a product and service business for private, local-first wildlife observation and habitat monitoring. The Field Node runs edge AI on-device; NestVue brings autonomous nest monitoring to birdhouses; optional data services handle sync, schemas, and multi-site intelligence when you want a network.

## Run it locally

```bash
cd wildatlas-prototype
./serve.sh
```

Open `http://localhost:8080`.

| Route | What |
|-------|------|
| `/` | Field Node product site — 3D configurator, install vs integrate |
| `/nestvue` | NestVue Smart Birdhouse — features + preorder |
| `/field-node.html` | Full-viewport Field Node image |
| `/atlas` | WildAtlas globe / habitat demo (prototype) |

Business / preorders: **lucas@manticore.email**

## Deploy on Render

This repo is a static site (no build step).

1. Push `main` to GitHub (includes the ~57MB Field Node `.glb`).
2. In [Render](https://dashboard.render.com): **New → Static Site** → connect `Lucastil2212/wildatlas-prototype`.
3. Settings:
   - **Build command:** leave empty (or `true`)
   - **Publish directory:** `.`
4. Or use the Blueprint: **New → Blueprint** → select the repo (`render.yaml`).

Auto-deploys on every push to `main`.

## Assets

Field Node imagery and schemas live in [`assets/manticore-field-node/`](assets/manticore-field-node/):

- `Manticore-Field-Node.png` — hardware hero
- `hardware_schema.png` — sensors, compute, power, deployment
- `software_data_schema.png` — capture → classify → signed log → sync

NestVue imagery lives in [`assets/nestvue-smart-birdhouse/`](assets/nestvue-smart-birdhouse/):

- `nestvue-product.png` — hero product shot
- `nestvue-specs.png` — dimensions and cutaway
- `nestvue-cutaway.png` — mounted solar / field view

## Atlas demo

The original WildAtlas 3D globe prototype remains at `/atlas` as a habitat intelligence demo (`atlas.html` redirects there on Render). See `ATTRIBUTION.md` for data credits used there.
