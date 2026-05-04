# Changelog

## v0.5.0 (2026-05-05)

### Added
- universal WebGIS landing messaging, no longer presenting q2w-mapcss as qgis2web-only
- new loading component docs for `q2w-spinner`, `q2w-loadbar`, and `q2w-skeleton`
- new print/export component docs for `q2w-print`
- toolbar wrapper documentation for grouped map controls
- header `q2w-header--pill-center` and `q2w-header--pill-right` variants
- popup status and chart variants
- compact splash modal variant
- search keyboard badge and floating search variants
- footer compact, floating, and coordinate-only variants
- button size variants and marker shape variants
- richer sheet, layer, measure, draw, compare, basemap, marker, tooltip, minimap, and sidebar docs

### Fixed
- landing CTA now points to the real categorized qgis2web example
- landing roadmap removed to avoid stale release status
- basemap docs now use the public `.q2w-bm-*` swatch classes
- real categorized example header now includes theme toggle and back-to-home controls

## v0.4.0 (2026-05-04)

### Added
- `dist/q2w-interactions.js` — lightweight JS behavior helpers for modal, toast, tabs, layer binding, coordinate display, and popup-close patterns
- `dist/q2w-leaflet.css` — universal Leaflet adapter for non-qgis2web projects
- `dist/q2w-plugins.css` — Leaflet plugin adapter bundle
- `tailwind.q2w.js` — Tailwind token plugin exposing q2w design tokens
- `snippets/templates/` — starter WebGIS shell templates (`basic`, `with-panel`, `dashboard`)
- branded site assets and navigation icon usage
- explicit `light` theme tokens and persisted `dark ↔ light` toggle behavior
- landing-page reveal motion and reduced-motion-safe polish
- expanded component docs variant coverage and browser checks
- SIPETA-inspired framework variants such as `q2w-header--pill-left`, `q2w-btn--help`, `q2w-popup--governmental`, and `q2w-popup--striped`

### Fixed
- theme toggle ambiguity on OS dark mode systems by switching explicit `dark ↔ light`
- component docs CSS path handling for nested docs pages
- landing mobile theme-toggle visibility
- docs completeness regressions through static and browser verification

## v0.1.0 (2026-05-04)

- Initial release foundation with qgis2web Leaflet styling, docs site, snippets, themes, and examples.
