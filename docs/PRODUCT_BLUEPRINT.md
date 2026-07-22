# WildAtlas product blueprint

## Product thesis

Most wildlife reference products begin with a species name. WildAtlas begins with **place**. A learner can start with where they live, somewhere they have heard about, or an arbitrary point on the planet; the product then explains the habitat, ecological relationships, and organisms likely to matter there.

The product promise is:

> **Touch anywhere on Earth and understand what lives there, why it belongs there, and what to notice next.**

This combines the spatial intuition of a globe, the depth of an encyclopedia, and the momentum of a collection game without making education conditional on payment or an account.

## Primary audiences

### Independent explorer

A curious learner who arrives with no scientific vocabulary. They need visual discovery, quick explanations, memorable facts, and obvious next actions.

### Family or classroom learner

A child and adult, teacher and class, or informal learning group. They need shared journeys, safe content, lesson prompts, readable provenance, and predictable controls.

### Emerging naturalist

A learner who wants scientific names, habitat specificity, field marks, seasonality, conservation context, and links to evidence.

The same underlying content should render through different explanation lenses rather than fragment into separate products.

## Experience principles

1. **Place before taxonomy.** Start with the environment and reveal the species network inside it.
2. **One obvious next action.** The primary action always advances the learning loop.
3. **Progressive disclosure.** A novice can stop after one paragraph; a naturalist can continue into detail and sources.
4. **Show relationships.** Explain pollination, predation, migration, decomposition, disturbance, and habitat engineering—not isolated trivia.
5. **Make uncertainty visible.** “Observed nearby,” “expected range,” and “editor-curated example” must look different.
6. **Reward attention, not compulsion.** Missions and collections encourage noticing; they do not punish absence or manufacture scarcity.
7. **Free core education.** Globe access, encyclopedia content, journal, and classroom use remain free.

## Core loop

```text
Land somewhere
    ↓
Read the habitat signal
    ↓
Meet signature neighbors
    ↓
Open a personalized species story
    ↓
Complete a field check
    ↓
Save or continue exploring
```

The loop should complete in under two minutes while allowing an hour-long deep dive.

## Information architecture

### 1. Globe

- Search / command bar
- Curated location markers
- Click-anywhere field-station creation
- Zoom, rotate, reset, and current-location controls
- Selected-place summary
- Expedition status and daily mission

### 2. Local field guide

- **Species:** curated spotlights plus live evidence
- **Habitat:** structure, climate pattern, ecological processes, and sensory cues
- **Field mission:** a short observation or comprehension task
- Radius and data-recency controls for live records

### 3. Species encyclopedia

- Common and scientific name
- Taxonomic group
- Explanation tuned to learning level
- Diet, activity, adaptation
- Ecological role
- Field marks and ethical observation guidance
- Media provenance
- Knowledge check
- Save to journal

### 4. Personal journal

- Saved field stations
- Saved species
- Completed checks
- XP and discovery history
- Exportable learning record in a later release

### 5. Learning preferences

- Curious / Explorer / Naturalist depth
- Taxon interests
- Later: language, accessibility settings, curriculum, age band, and units

## Content model

A production content object should separate editorial assertions from observational data:

```json
{
  "place": {
    "id": "ecoregion-or-station-id",
    "coordinates": { "lat": 0, "lon": 0 },
    "ecoregions": [],
    "habitat_summary": {},
    "sources": [],
    "reviewed_at": "ISO-8601"
  },
  "species": {
    "taxon_id": "stable-provider-id",
    "names": {},
    "taxonomy": {},
    "explanations": {
      "curious": {},
      "explorer": {},
      "naturalist": {}
    },
    "relationships": [],
    "field_marks": [],
    "conservation": {},
    "media": [],
    "sources": [],
    "reviewed_at": "ISO-8601"
  },
  "evidence": {
    "provider": "provider-id",
    "retrieved_at": "ISO-8601",
    "query_area": {},
    "records": [],
    "completeness_warning": true
  }
}
```

## Production architecture

```text
Responsive web client / installable PWA
              │
              ▼
     Edge backend-for-frontend
       ├── cache and deduplicate
       ├── normalize taxon IDs
       ├── enforce media licenses
       ├── obscure sensitive locations
       ├── provenance and review dates
       └── observability / failure budgets
              │
      ┌───────┼────────┐
      ▼       ▼        ▼
 geocoding  biodiversity  editorial CMS
 providers   providers    + curriculum
```

### Why a backend-for-frontend is needed

- Avoid exposing service keys if future providers require them
- Respect rate limits and cache popular place/radius queries
- Normalize inconsistent taxonomies and common names
- Store media attribution and license metadata
- Filter or generalize sensitive species coordinates
- Add deterministic fallbacks during provider outages
- Support localization and source-aware content review

## Data layers for a production build

The prototype demonstrates the interaction with broad biome inference and community sightings. Global educational quality requires additional layers:

- terrestrial and marine ecoregions
- land cover and elevation
- freshwater basins and coastlines
- climate normals and seasonality
- species ranges and migration corridors
- observational occurrence data
- protected areas and conservation status
- human pressure and restoration stories
- editorially reviewed local narratives

No single source should be presented as a complete local inventory. Range models, observations, and editor-curated examples need distinct labels.

## Personalization model

Personalization should be transparent and learner-controlled.

### Inputs

- selected explanation depth
- declared interests
- recently opened taxa and habitats
- completed questions
- optional curriculum or age band

### Ranking

Prioritize a mix of:

- strong local relevance
- learner interest
- ecological importance
- novelty relative to the journal
- representation across taxonomic groups
- editorial quality and evidence confidence

### Guardrails

- Provide a “Why am I seeing this?” explanation
- Never hide the complete local list behind personalization
- Avoid inferences about sensitive personal traits
- Keep progress local by default
- Allow reset and export

## Ethical engagement system

The desired outcome is repeated curiosity, not compulsive use.

Use:

- small daily observation prompts
- collections with educational context
- positive progress feedback
- surprise journeys
- seasonal return invitations
- collaborative classroom goals

Avoid:

- punishment for missed days
- randomized paid rewards
- artificial scarcity
- infinite-scroll content without stopping cues
- notification pressure
- competitive rankings for children

## Trust, safety, and scientific integrity

### Sensitive biodiversity

Threatened, persecuted, or commercially valuable species may require coordinate obscuration. Do not reconstruct intentionally hidden observation locations. Explain why some records are generalized.

### Field safety

Location pages should surface hazards where relevant: tides, heat, ice, altitude, wildlife distance, disease vectors, private land, and local regulations. Educational prompts must not encourage approaching or handling wildlife.

### Evidence quality

Every factual module should carry:

- source or source set
- evidence type
- geographic applicability
- last retrieval or review date
- uncertainty / completeness note
- media license and attribution

### Child and classroom use

- no behavioral advertising
- no public profile by default
- no precise location history retained without explicit consent
- teacher-managed classroom modes
- WCAG-oriented keyboard, contrast, reduced-motion, and screen-reader support
- reading-level and language controls

## MVP-to-production roadmap

### Phase 1 — Interaction prototype — complete here

- 3D globe and click-anywhere stations
- eight editorial journeys
- species encyclopedia and quizzes
- local journal and preferences
- live geocoding and sightings integration points
- responsive desktop/mobile UI

### Phase 2 — Public MVP

- backend-for-frontend and caching
- reliable ecoregion lookup for every coordinate
- normalized taxonomy and source provenance
- 50–100 reviewed flagship ecosystems
- content-management workflow
- installable PWA and offline journey packs
- accessibility audit and user testing
- privacy review and sensitive-location policy

### Phase 3 — Global learning platform

- multilingual encyclopedia
- educator dashboard and lesson sequences
- seasonal and migration layers
- conservation and restoration stories
- journal export / optional sync
- expert and community editorial contribution workflow
- open educational content API

## Success measures

Avoid optimizing raw session duration. Prefer measures tied to learning and exploration:

- percentage of sessions that reach a species story
- distinct habitats explored per learner
- knowledge-check completion and improvement
- journal diversity across taxa and ecosystems
- return rate without notification pressure
- classroom lesson completion
- source-panel use by advanced learners
- accessibility task success
- learner-reported curiosity and confidence

The north-star metric can be **meaningful discoveries per returning learner**, where a discovery requires opening a sourced habitat or species explanation—not merely generating a page view.
