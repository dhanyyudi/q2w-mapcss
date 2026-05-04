# Quick Start

Use `q2w-mapcss` after qgis2web has exported a Leaflet project.

## 1. Add the CSS

For a local copy:

```html
<link rel="stylesheet" href="css/q2w-mapcss.css">
```

For the hosted Cloudflare Pages copy:

```html
<link rel="stylesheet" href="https://q2w-mapcss.pages.dev/dist/q2w-mapcss.css">
```

## Using with plain Leaflet (without qgis2web)

If you are not using qgis2web, use the universal Leaflet build:

```html
<link rel="stylesheet" href="css/q2w-leaflet.css">
```

Omit `q2w-qgis2web` from body helpers. Use `.q2w-header`, `.q2w-panel`, and other component classes directly.

## 2. Add body helpers

```html
<body class="q2w-qgis2web q2w-has-footer q2w-controls-below-header">
```

`q2w-qgis2web` makes the exported map fullscreen. `q2w-has-footer` leaves room for a footer. `q2w-controls-below-header` moves Leaflet controls below a floating header.

## 3. Add snippets

Use the files in `snippets/` as copy paste starting points:

- `header.html`
- `footer.html`
- `welcome-modal.html`
- `help-modal.html`
- `legend-panel.html`

## 4. Customize tokens

```css
:root {
  --q2w-accent: #137a7f;
  --q2w-accent-hover: #0f6669;
  --q2w-radius-md: 8px;
}
```

## Adding plugin support

```html
<!-- After the main CSS — only needed if you use leaflet-draw or markercluster -->
<link rel="stylesheet" href="css/q2w-plugins.css">
```

## Optional: JS interactions

If you want lightweight behavior helpers for demos and map chrome, add:

```html
<script src="css/q2w-interactions.js"></script>
```

This optional file enables:

- modal open and close helpers
- toast auto-dismiss
- tab switching
- popup close button behavior
- layer panel binding helpers for Leaflet
- coordinate display updates for a footer target

## 5. Icons (optional)

q2w-mapcss does not require an icon library. Place any SVG inside a component:

```html
<button class="q2w-btn">
  <!-- any SVG here -->
  Open map
</button>
```

The docs use [Lucide](https://lucide.dev) icons (MIT, inline SVG).

## Templates

Use the starter templates in `snippets/templates/` when you want a complete app shell instead of a single snippet:

- `basic.html` — floating header + map + footer
- `with-panel.html` — map shell with a collapsible layer panel
- `dashboard.html` — map plus summary sidebar layout

## 5. Verify the export

Check these items:

- Map fills the browser viewport.
- Header does not overlap the zoom, search, or measure controls.
- Layer tree opens and scrolls.
- Popup tables are readable.
- Mobile viewport has no horizontal overflow.
