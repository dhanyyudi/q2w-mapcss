# Changelog

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
