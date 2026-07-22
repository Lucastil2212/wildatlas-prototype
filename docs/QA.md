# WildAtlas quality-assurance report

## Test environment

The prototype was served locally and exercised in Chromium 144 through the Chrome DevTools Protocol. Desktop tests used a 1440 × 1000 viewport; mobile tests used 390 × 844.

## Automated checks

| Area | Result |
|---|---|
| JavaScript syntax (`node --check`) | Pass |
| Python asset generator compilation | Pass |
| Unique HTML IDs | Pass |
| Images have alternative text where semantically required | Pass |
| Buttons and form controls have text or accessible labels | Pass |
| WebGL context and 1440 × 1000 render surface | Pass |
| JavaScript console exceptions during tested flows | None |
| Desktop horizontal/vertical document overflow | None at home state |
| Mobile horizontal overflow at 390 px | None |
| Reduced mobile navigation and condensed place card | Pass |

## Functional flows exercised

### Globe

- NASA texture loaded into WebGL
- Eight curated markers rendered
- Click on a non-marker point created a **Wild field station**
- Broad local biome inference populated the station summary
- Desktop and mobile globe views rendered successfully

### Field guide

- Amazon guide panel opened and announced `aria-hidden="false"`
- Species, Habitat, and Field mission tabs rendered
- Five curated species cards appeared
- Live-sightings control displayed its offline-safe initial state

### Species encyclopedia

- Jaguar profile opened
- Common and scientific names rendered
- Personalized Explorer explanation rendered
- Three fact tiles rendered
- Three knowledge-check choices rendered
- Close action restored focus to the previous interface context

### Search

- Search overlay opened and focused its input
- Curated species query `jaguar` returned Jaguar
- Coordinate query `51.5, -0.1` returned a land-here action
- Four featured journeys rendered
- `/` keyboard shortcut reopened search after focus restoration
- `Ctrl/⌘ + K` is also registered in the application

### Journal and progression

- A dropped field station could be saved
- Journal count updated to one
- Saved location rendered in the journal
- XP updated after discovery and save actions

### Responsive behavior

At 390 × 844:

- document width equaled viewport width
- no horizontal overflow was detected
- side rail transformed into a bottom navigation bar
- desktop mission card was hidden
- hero and place card remained within the viewport width

## Visual captures

- `screenshots/desktop-home.png`
- `screenshots/desktop-field-guide.png`
- `screenshots/desktop-species.png`
- `screenshots/desktop-search.png`
- `screenshots/mobile-home.png`

## Environment limitation

The QA container could not resolve outbound DNS. Successful responses from Open-Meteo and iNaturalist therefore could not be exercised end to end in this environment. The request construction, loading state, timeout, abort, fallback, and error handling are implemented; the curated experience remains available when those services cannot be reached. Live integrations should be verified against the deployment origin before launch and moved behind a cached backend-for-frontend for production.

## Remaining launch work

This is a high-fidelity product prototype, not a publication-ready global encyclopedia. Before public launch:

1. Perform scientific and editorial review of curated copy.
2. Add source-level citations and review dates in the UI.
3. Verify live API behavior, CORS, attribution, rate limits, and failure budgets from the production domain.
4. Add ecoregion and marine-region lookup rather than broad pixel-color biome inference.
5. Conduct formal WCAG testing with screen readers and keyboard-only users.
6. Establish policies for obscured sensitive-species locations and licensed media.
7. Test on physical iOS and Android devices, lower-powered GPUs, and browsers with WebGL disabled.
