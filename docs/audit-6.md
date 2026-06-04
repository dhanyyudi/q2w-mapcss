# Audit-6 Plan: q2w-mapcss v0.5.0

## Context

Audit-5 implemented the v0.4.0 feature set but left behind a number of correctness, polish, and completeness issues. This plan covers the full scope of v0.5.0: critical bug fixes, universal rebranding, a thorough component-by-component gap audit against the wireframe reference (`qgis2web-wireframe-framework/index.html`), and a richer set of interactive variants across ALL components — not just header pill.

---

## Execution Order

1. Part 1 — Critical bug fixes (logo + stale v0.1 strings) ✅ DONE
2. Part 2 — Landing page: universal messaging + roadmap removal
3. Part 3 — Component gap fixes: all components vs wireframe reference
4. Part 4 — New component variants (creative additions beyond wireframe)
5. Part 5 — Missing components from wireframe (print, loading, toolbar)
6. Part 6 — Real examples page polish
7. Part 7 — Version bump 0.4.0 → 0.5.0
8. Part 8 — NPM publish readiness check

---

## Part 1 — Critical Bug Fixes ✅ ALREADY DONE

- `src/site/_includes/nav-landing.njk:5` — `v0.1` → `v0.5` ✅
- `src/site/_includes/footer.njk:20` — `v0.1` → `v0.5` ✅
- `site/examples/categorized-real/index.html:37` — `object-fit: cover` → `object-fit: contain` ✅
- `src/site/_includes/previews/sidebar.njk` — "Dashboard" → "Analisis Zona" ✅
- `src/site/_includes/footer.njk` — footer description updated, roadmap link removed ✅

---

## Part 2 — Landing Page (`src/site/landing.njk` + `nav-landing.njk`)

### 2.1 Remove Roadmap section
Delete the entire `<section class="ln-section reveal" id="roadmap">` block (lines 428–469).
Remove `<a href="#roadmap">Roadmap</a>` from `nav-landing.njk`.

### 2.2 Universal WebGIS messaging
- **H1**: `"Beautiful UI for your qgis2web exports."` → `"Beautiful UI for your web map."`
- **Subtitle**: `"A lightweight CSS framework for Leaflet-based web maps. Works great with qgis2web exports — and with any WebGIS or mapping project."`
- **"Why q2w" section (line 387)**: Add one sentence: `"q2w works on any Leaflet-based web map, not just qgis2web exports."`
- Keep the qgis2web before/after comparison — it remains the best concrete demonstration

### 2.3 CTA and nav link fixes
- `href="examples/choropleth.html"` → `href="examples/categorized-real/"` (primary CTA)
- Remove `<a href="examples/choropleth.html">Examples</a>` from nav-landing.njk
- Rename "Real example" display text to "Example"

---

## Part 3 — Component Gap Audit: Wireframe vs. Current Docs

### GAP ANALYSIS SUMMARY
Comparing `qgis2web-wireframe-framework/index.html` against `src/site/docs/` + `src/components.css`:

| Component | Wireframe Variants | Current Docs Has | CSS Has | Gaps |
|-----------|-------------------|-----------------|---------|------|
| header | 6 (default,bar,minimal,expressive,technical,pill-left) | 6 | 6 | Need pill-center, pill-right (new) |
| footer | Standard + scale bar | 1 preview, 3 listed | 1 base + scalebar CSS | Scale bar preview MISSING from docs |
| sidebar | Full dashboard (stats+chart+layers) | Minimal preview | Base only | Rich preview missing |
| layer | Default (sections+sublayers), compact/minimal, technical·dense | Partial | Complete | 2 variants not documented |
| popup | Tabular, rich+actions, tabbed, minimal, technical, WITH CHART | Most present | All CSS present | "With chart" variant missing |
| modal | Instructions + compact splash | 1 variant | Complete | Compact splash missing |
| search | Idle + active with keyboard shortcut badge (⌘K) | Basic | Complete | ⌘K badge missing |
| basemap | 6 basemaps using `.q2w-bm-*` CSS swatch classes | 4 gradients | Has `.q2w-bm-*` CSS | Uses gradients instead of CSS swatch classes |
| tooltip | Simple hover label | Basic | Base only | --compact, --dark not in CSS |
| marker | Default + colored variants (danger, success) | Basic | Complete | Colored variants not shown |
| loading | spinner, loadbar, skeleton | NOT IN DOCS | NOT IN CSS | Entirely missing section |
| print | Print/export panel `.q2w-print` | NOT IN DOCS | NOT IN CSS | Entirely missing |
| toolbar | `.q2w-toolbar` wrapper | NOT IN DOCS | NOT IN CSS | Entirely missing |
| layer+slider | Opacity slider expand `.q2w-layer__expand` | NOT IN DOCS | Slider CSS exists | Integration pattern not documented |
| measure | Modes (Distance/Area), readout rows | In docs | Complete | Preview doesn't show readout rows |
| draw | 6 tool buttons + separator | In docs | Complete | Preview missing SVG tool icons |
| compare | Full swipe stage demo | In docs | Complete | Preview too small/plain |
| mobile | Bottom sheet (popup + layers), FAB, mobile chrome | NOT IN DOCS | Sheet CSS exists | Mobile layout not documented |

---

### 3.1 Footer — Add scale bar variant
**File:** `src/site/docs/footer.njk`

Add a second live preview showing the footer with `.q2w-scalebar`:
```html
<div class="q2w-footer">
  <div class="q2w-footer__group">
    <div class="q2w-scalebar">
      <div>
        <div class="q2w-scalebar__bar"></div>
        <div style="display:flex;justify-content:space-between;width:80px;"><span>0</span><span>500m</span></div>
      </div>
    </div>
  </div>
  <div class="q2w-footer__group">1 : 24,000</div>
  <div class="q2w-footer__push"></div>
  <div class="q2w-footer__group q2w-footer__coord">Z 15 · -7.7868°, 108.4670°</div>
</div>
```
Also update `src/site/_includes/previews/footer.njk` to show both variants stacked.

### 3.2 Sidebar — Rich dashboard preview
**File:** `src/site/docs/sidebar.njk` + `src/site/_includes/previews/sidebar.njk`

Replace the minimal "Analisis Zona" preview with the full wireframe sidebar design (stats grid + inline SVG bar chart + layer toggles):
```html
<div class="q2w-sidebar" style="...">
  <div class="q2w-sidebar__header">
    <div class="q2w-sidebar__title">Cirebon Land Value</div>
    <div class="q2w-sidebar__sub">Mekarjaya · 4 zones</div>
  </div>
  <div class="q2w-sidebar__body">
    <!-- Stats grid (2 cols) -->
    <!-- SVG bar chart -->
    <!-- Layer toggles -->
  </div>
</div>
```
Also add `q2w-sidebar__title` and `q2w-sidebar__sub` to CSS sub-elements — currently CSS has `__header` + `__body` but doc lists `__head`. Reconcile naming.

### 3.3 Layer panel — Add missing variants to docs
**File:** `src/site/docs/layer.njk`

Add two variant cards matching wireframe (section 04):
1. **Compact/minimal** — no sublayer symbology, just layer names + checkboxes
2. **Technical·dense** — monospace font, compact rows with `font-size: 11px`, technical labels (e.g. `roads_lines`, `znt_polygons`)

### 3.4 Popup — Add "With chart" variant
**File:** `src/site/docs/popup.njk`

Add a preview card showing a popup with an inline SVG sparkline chart (as in wireframe section 06):
```html
<div class="q2w-popup">
  <div class="q2w-popup__header">...</div>
  <div class="q2w-popup__body" style="padding:12px;">
    <svg viewBox="0 0 240 80"><!-- sparkline --></svg>
    <div class="q2w-attr"><span class="q2w-attr__key">Δ 5y</span><span class="q2w-attr__val" style="color:var(--q2w-success)">+62%</span></div>
  </div>
</div>
```

### 3.5 Modal — Add compact splash variant
**File:** `src/site/docs/modal.njk`

Add a second preview card for the centered compact splash modal (wireframe section 07):
- Centered layout, logo centered, single call-to-action
- Smaller than the full instructions modal
- Good for "quick start" or "open map" splash screens

### 3.6 Search — Add ⌘K keyboard badge
**File:** `src/site/docs/search.njk` + `src/site/_includes/previews/search.njk`

Update search preview to show the ⌘K shortcut badge inside the search field (as in wireframe section 09):
```html
<div class="q2w-search">
  <svg class="ic q2w-search__icon">...</svg>
  <input placeholder="Search address or coordinates…" />
  <span class="q2w-search__kbd">⌘K</span>
</div>
```
Add `.q2w-search__kbd` CSS to `src/components.css` — monospace label, right-aligned inside search field.

### 3.7 Basemap — Fix to use proper CSS swatch classes
**File:** `src/site/docs/basemap.njk` + `src/site/_includes/previews/basemap.njk`

The wireframe uses `.q2w-bm-streets`, `.q2w-bm-satellite`, `.q2w-bm-voyager`, `.q2w-bm-terrain`, `.q2w-bm-light`, `.q2w-bm-dark` — these CSS classes already exist in `src/components.css` (lines 638-649). Currently the docs use raw CSS gradients, not these classes.

Replace gradient `style=""` attributes with proper classes:
```html
<div class="q2w-basemap q2w-basemap--active">
  <div class="q2w-basemap__thumb q2w-bm-satellite"></div>
  <div class="q2w-basemap__label">Esri Imagery</div>
</div>
<div class="q2w-basemap">
  <div class="q2w-basemap__thumb q2w-bm-dark"></div>
  <div class="q2w-basemap__label">Dark canvas</div>
</div>
<!-- etc. for 6 basemaps -->
```
Expand to 6 basemap options (satellite, voyager, streets, terrain, light, dark) to match wireframe.

### 3.8 Marker — Show colored variants
**File:** `src/site/docs/marker.njk` + `src/site/_includes/previews/marker.njk`

Add colored marker variants (wireframe section 11):
```html
<div class="q2w-marker"></div>  <!-- accent -->
<div class="q2w-marker" style="background: var(--q2w-danger);"></div>
<div class="q2w-marker" style="background: var(--q2w-success);"></div>
<div class="q2w-cluster">12</div>
<div class="q2w-cluster" style="width: 44px; height: 44px; font-size: 13px;">128</div>
```

### 3.9 Measure — Show full readout with Distance/Area modes
**File:** `src/site/_includes/previews/measure.njk`

Currently a minimal preview. Replace with the full measure component showing:
- Header with icon
- Mode tabs (Distance / Area) with active state
- Readout rows (Total, Last segment, Bearing)

### 3.10 Draw — Add SVG tool icons to preview
**File:** `src/site/_includes/previews/draw.njk`

Currently shows plain text buttons. Replace with SVG icon buttons as in wireframe (Point, Line, Polygon, Rectangle, | Edit, Delete) matching wireframe section 15.

### 3.11 Tooltip — Implement --compact and --dark CSS
**File:** `src/components.css`

Currently `.q2w-tooltip--compact` and dark mode support are documented but have zero CSS:
```css
.q2w-tooltip--compact {
  padding: 3px 7px;
  font-size: 10px;
}
[data-theme="dark"] .q2w-tooltip,
.q2w-tooltip[data-theme="dark"] {
  background: var(--q2w-surface);
  color: var(--q2w-text);
  border: 1px solid var(--q2w-border);
}
```
Also add a rich tooltip variant `.q2w-tooltip--rich` (multi-line, with title + value row) to the docs.

### 3.12 Footer — Implement --compact and --floating CSS
**File:** `src/components.css`

Currently documented but not in CSS. Add:
```css
.q2w-footer--compact {
  height: 28px;
  font-size: 10.5px;
  padding: 0 10px;
}
.q2w-footer--floating {
  position: absolute;
  left: 12px; right: 12px; bottom: 12px;
  border-radius: var(--q2w-radius-md);
  box-shadow: var(--q2w-shadow-md);
}
```

### 3.13 Compare — Improve preview with full swipe demo
**File:** `src/site/docs/compare.njk` + `src/site/_includes/previews/compare.njk`

Update to show a proper before/after swipe with two contrasting gradient "layers" (like wireframe section 15.b), labels left/right, and the compare handle visible in the center.

---

## Part 4 — Creative New Component Variants (beyond wireframe)

These variants are not in the wireframe but are natural, useful extensions that any user would need once they start building real maps.

### 4.1 Header: `pill-center` and `pill-right`
Only `pill-left` exists. Add two natural companion variants:
**CSS additions in `src/components.css` (after `.q2w-header--pill-left`):**
```css
/* Centered floating pill — good for storytelling / embed maps */
.q2w-header--pill-center {
  left: 50%;
  right: auto;
  transform: translateX(-50%);
  border-radius: var(--q2w-radius-full);
  max-width: 480px;
  /* inherit shadow/bg/padding from pill-left */
}
/* Right-edge pill — mirrored from pill-left */
.q2w-header--pill-right {
  left: auto;
  right: var(--q2w-header-edge, 16px);
  border-radius: var(--q2w-radius-full);
}
```
Add preview cards to `src/site/docs/header.njk`.

### 4.2 Popup: `q2w-popup--status`
A popup variant that shows a status indicator (traffic-light circle) in the header — useful for feature health/condition maps:
```css
.q2w-popup--status .q2w-popup__header::before {
  content: '';
  width: 10px; height: 10px;
  border-radius: 50%;
  background: var(--q2w-accent);
  flex: none;
}
/* Status color utilities */
.q2w-popup--status[data-status="ok"]::before { background: var(--q2w-success); }
.q2w-popup--status[data-status="warn"]::before { background: var(--q2w-warning); }
.q2w-popup--status[data-status="error"]::before { background: var(--q2w-danger); }
```

### 4.3 Toast: `q2w-toast--info`
Currently success/warning/error exist but no neutral info toast. Add:
```css
.q2w-toast--info {
  border-left-color: var(--q2w-info);
  background: var(--q2w-info-soft, color-mix(in srgb, var(--q2w-info) 10%, transparent));
}
.q2w-toast--info .q2w-toast__icon { color: var(--q2w-info); }
```

### 4.4 Layer: `q2w-layer--drag` with opacity expand
The wireframe phase-2 shows `.q2w-layer__handle` (drag handle ⋮⋮) + `.q2w-layer__expand` with inline opacity slider — document this pattern properly:
- Add `.q2w-layer__handle` CSS (drag grip icon, cursor: grab)
- Add `.q2w-layer__expand` CSS (collapsible sub-row beneath a layer row)
- Document in `src/site/docs/layer.njk` as an interactive variant

### 4.5 Search: `q2w-search--floating`
A floating search variant that expands on focus (collapsed = icon only, expanded = full width input):
```css
.q2w-search--floating {
  position: absolute;
  top: var(--q2w-header-edge, 16px);
  left: var(--q2w-header-edge, 16px);
  width: 36px;
  transition: width 0.2s ease;
  overflow: hidden;
}
.q2w-search--floating:focus-within {
  width: 280px;
}
```

### 4.6 Footer: Coordinate-only minimal variant
```css
.q2w-footer--coords {
  height: 28px;
  padding: 0 12px;
  justify-content: flex-end;
  background: transparent;
  box-shadow: none;
  border-top: none;
}
```
Shows just the coordinate display — useful for fullscreen maps that need attribution elsewhere.

### 4.7 Panel: `q2w-panel--dark` explicit dark preview
The panel supports `data-theme="dark"` via token inheritance but this is never shown in docs. Add a preview card showing the layer panel in explicit dark mode.

### 4.8 Minimap: dark tiles variant
The CSS has `.q2w-minimap__tiles--dark` (lines 821–824) but it's not shown in docs. Add a dark tiles preview card.

### 4.9 Button: Size variants `q2w-btn--sm` and `q2w-btn--lg`
Natural extensions for buttons used inside controls vs. hero CTAs:
```css
.q2w-btn--sm { height: 28px; padding: 0 10px; font-size: 11px; }
.q2w-btn--lg { height: 40px; padding: 0 20px; font-size: 14px; font-weight: 600; }
```

### 4.10 Marker: `q2w-marker--pin` (leaf/teardrop with dot) and `q2w-marker--square`
The current marker is a teardrop. Add two visual variants:
- `--pin`: classic pin with circular head
- `--square`: compact labeled square (useful for feature annotation)

---

## Part 5 — Missing Components from Wireframe (need CSS + doc pages)

### 5.1 Loading states: `q2w-spinner`, `q2w-loadbar`, `q2w-skeleton`
**Wireframe section 12. Currently: NO CSS, NO doc page.**

Add CSS in `src/components.css`:
```css
/* Spinner */
.q2w-spinner {
  width: 20px; height: 20px;
  border: 2px solid var(--q2w-border);
  border-top-color: var(--q2w-accent);
  border-radius: 50%;
  animation: q2w-spin 0.6s linear infinite;
}
@keyframes q2w-spin { to { transform: rotate(360deg); } }

/* Loading bar row */
.q2w-loadbar {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 12px;
  background: var(--q2w-surface-soft);
  border-radius: var(--q2w-radius-md);
  font-size: 12px;
}

/* Skeleton shimmer */
.q2w-skeleton {
  background: linear-gradient(90deg, var(--q2w-surface-soft) 25%, var(--q2w-border) 50%, var(--q2w-surface-soft) 75%);
  background-size: 200% 100%;
  border-radius: var(--q2w-radius-sm);
  animation: q2w-shimmer 1.4s ease infinite;
}
@keyframes q2w-shimmer { to { background-position: -200% 0; } }
```

Create `src/site/docs/loading.njk` with all three variants.
Add to component nav/index.

### 5.2 Print/export: `q2w-print`
**Wireframe section 10. Currently: NO CSS, NO doc page.**

Add CSS for `.q2w-print`:
```css
.q2w-print {
  background: var(--q2w-surface);
  border: 1px solid var(--q2w-border);
  border-radius: var(--q2w-radius-md);
  width: 220px;
  overflow: hidden;
}
.q2w-print__header { padding: 8px 12px; font-weight: 600; font-size: 13px; border-bottom: 1px solid var(--q2w-border); }
.q2w-print__row { display: flex; align-items: center; justify-content: space-between; padding: 6px 12px; font-size: 12px; border-bottom: 1px solid var(--q2w-border); }
.q2w-print__row select { font-size: 11px; border: 1px solid var(--q2w-border); border-radius: 3px; padding: 2px 4px; }
.q2w-print__footer { padding: 8px 12px; }
```

Create `src/site/docs/print.njk`.

### 5.3 Toolbar wrapper: `q2w-toolbar`
**Used in wireframe to group control stacks. Currently: NO CSS, NO doc page.**

```css
.q2w-toolbar {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.q2w-toolbar--row { flex-direction: row; }
```

Document in `src/site/docs/control.njk` as a companion wrapper, or as its own mini-section. At minimum document how to use `.q2w-toolbar` to group multiple `.q2w-control` blocks.

### 5.4 Mobile layouts — document in sheet.njk
**Wireframe section 14. Currently sheet.njk has minimal coverage.**

Update `src/site/docs/sheet.njk` to show all three mobile scenarios from the wireframe:
1. **Bottom sheet · popup** — sheet showing feature attributes
2. **Bottom sheet · layers** — sheet showing layer toggles
3. **Mobile chrome** — bar header + FAB (floating action button) + inline search

This does NOT need new CSS — these patterns use existing components. Just document the composition pattern with proper HTML examples.

---

## Part 6 — Real Examples Page Polish (`site/examples/categorized-real/index.html`)

### 6.1 Logo fix ✅ DONE

### 6.2 Add dark/light mode toggle
Add `.q2w-theme-toggle` button to header actions (interactions.js is already wired up):
```html
<button class="q2w-btn q2w-btn--icon q2w-theme-toggle" aria-label="Toggle dark mode" title="Toggle theme">
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/>
  </svg>
</button>
```

### 6.3 Add "Back to home" button
Add to header actions, before the Bantuan button:
```html
<a href="../../index.html" class="q2w-btn q2w-btn--ghost q2w-btn--icon" aria-label="Beranda" title="Kembali ke beranda">
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
</a>
```

### 6.4 Verify welcome banner and help modal
- Confirm `sp-welcome` displays correctly on load (z-index, opacity not hidden by default)
- Confirm Bantuan button opens help modal (already working per audit)
- Confirm welcome "Mulai gunakan peta" button closes with correct `.hidden` class transition

---

## Part 7 — Version Bump to 0.5.0

Update all version references:

| File | Line(s) | Change |
|------|---------|--------|
| `package.json` | 3 | `"0.4.0"` → `"0.5.0"` |
| `wrangler.toml` | 5 | `"0.4.0"` → `"0.5.0"` |
| `scripts/check.mjs` | 21, 22, 96, 111, 355, 362 | `"0.4.0"` → `"0.5.0"` |
| `src/site/landing.njk` | 287 | `v0.4` → `v0.5` |
| `src/site/landing.njk` | 460 | status `--next` → `--done` |
| `CHANGELOG.md` | top | Add `## v0.5.0 (2026-05-05)` section |

CHANGELOG v0.5.0 summary to include:
- Universal WebGIS rebranding (not qgis2web-only)
- 3 new components: loading states, print panel, toolbar
- pill-center and pill-right header variants
- popup with chart, compact splash modal
- 9 new creative component variants
- basemap docs use proper `.q2w-bm-*` CSS classes
- real example: theme toggle + back button
- layer panel: compact + technical variants documented
- mobile patterns documented in sheet component

Also remove fake example files:
- `src/site/examples/choropleth.njk`
- `src/site/examples/dashboard.njk`
- `src/site/examples/heatmap.njk`
- `src/site/examples/poi.njk`

---

## Part 8 — NPM Publish Readiness

1. `node scripts/check.mjs` must pass (all version strings updated)
2. `npm run build` must succeed, `dist/` regenerated cleanly
3. `.npmignore` excludes: `src/`, `site/`, `qgis2web_redesign/`, `qgis2web-wireframe-framework/`, `scripts/`, `docs/`
4. `npm pack --dry-run` — tarball must contain only `dist/`, `LICENSE`, `README.md`, `package.json`
5. `git tag v0.5.0`

---

## Critical Files Reference

| File | Changes |
|------|---------|
| `src/components.css` | Add: pill-center, pill-right, spinner/loadbar/skeleton, print, toolbar, search__kbd, footer--compact/floating, tooltip--compact/dark, layer__handle/expand, btn--sm/lg, marker variants, toast--info, search--floating, footer--coords |
| `src/site/landing.njk` | Remove roadmap, update H1/subtitle, fix CTA href |
| `src/site/_includes/nav-landing.njk` | Remove roadmap + fake examples links |
| `src/site/docs/header.njk` | Add pill-center and pill-right preview cards |
| `src/site/docs/footer.njk` | Add scale bar variant preview |
| `src/site/docs/layer.njk` | Add compact + technical variants |
| `src/site/docs/popup.njk` | Add with-chart variant |
| `src/site/docs/modal.njk` | Add compact splash variant |
| `src/site/docs/search.njk` | Add ⌘K badge |
| `src/site/docs/basemap.njk` | Use `.q2w-bm-*` classes, expand to 6 basemaps |
| `src/site/docs/marker.njk` | Show colored variants |
| `src/site/docs/measure.njk` | Full readout preview |
| `src/site/docs/draw.njk` | SVG icon buttons |
| `src/site/docs/compare.njk` | Full swipe demo |
| `src/site/docs/sheet.njk` | Add 3 mobile scenarios |
| `src/site/docs/loading.njk` | NEW: spinner, loadbar, skeleton |
| `src/site/docs/print.njk` | NEW: print/export panel |
| `src/site/_includes/previews/*.njk` | Update for sidebar, footer, basemap, measure, draw, marker, compare |
| `site/examples/categorized-real/index.html` | Theme toggle + back button |
| `package.json`, `wrangler.toml`, `scripts/check.mjs`, `CHANGELOG.md` | Version bump |

## Reuse Points

- Theme toggle wiring: `src/interactions.js:5–23` — just needs `.q2w-theme-toggle` button
- `.q2w-bm-*` swatch CSS: `src/components.css:638–649` — already implemented, just not used in docs
- Sidebar CSS: `src/components.css:536–551` — existing, reconcile `__header`/`__head` naming
- Wireframe sidebar reference: `qgis2web-wireframe-framework/index.html:659–701`
- Wireframe measure: `qgis2web-wireframe-framework/index.html:775–793`
- Wireframe mobile: `qgis2web-wireframe-framework/index.html:903–960`
- Wireframe phase-2: `qgis2web-wireframe-framework/index.html:963–1206`

## Verification

1. `npm run build` + `node scripts/check.mjs` pass
2. Dev server: landing has no roadmap, universal messaging, `v0.5` badge
3. Component docs: basemap shows 6 tiles with `.q2w-bm-*` classes, footer shows 2 variants, header shows pill-left/center/right, layer shows 3 variants, popup shows 6+ variants, new loading/print pages exist
4. Real example: theme toggle works, back button present, logo not clipped
5. `npm pack --dry-run` confirms clean tarball
