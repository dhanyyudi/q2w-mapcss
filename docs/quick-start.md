# Quick Start

Use `q2w-mapcss` after qgis2web has exported a Leaflet project.

## 1. Add the CSS

For a local copy:

```html
<link rel="stylesheet" href="css/q2w-mapcss.css">
```

For a deployed docs copy:

```html
<link rel="stylesheet" href="https://YOUR-CLOUDFLARE-PAGES-URL/dist/q2w-mapcss.css">
```

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

## 5. Verify the export

Check these items:

- Map fills the browser viewport.
- Header does not overlap the zoom, search, or measure controls.
- Layer tree opens and scrolls.
- Popup tables are readable.
- Mobile viewport has no horizontal overflow.
