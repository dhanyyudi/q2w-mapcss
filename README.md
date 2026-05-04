# q2w-mapcss

`q2w-mapcss` is a lightweight CSS framework for Leaflet exports from qgis2web.

It turns the default qgis2web map chrome into a cleaner interface with design tokens, themes, headers, footers, layer panels, legends, popups, and a compatibility adapter for the DOM that qgis2web already generates.

## Quick Start

Copy the built CSS into your qgis2web export:

```html
<link rel="stylesheet" href="css/q2w-mapcss.css">
```

Add the body helpers:

```html
<body class="q2w-qgis2web q2w-has-footer q2w-controls-below-header">
```

Then add snippets such as a header and footer around the existing `<div id="map"></div>`.

```html
<div class="q2w-header">
  <div class="q2w-header__brand">
    <div class="q2w-header__logo">q2</div>
    <div>
      <div class="q2w-header__title">WebGIS Zona Nilai Tanah</div>
      <div class="q2w-header__sub">Sistem Informasi Peta Tematik</div>
    </div>
  </div>
</div>

<div id="map"></div>

<div class="q2w-footer">
  <div class="q2w-footer__group">Powered by qgis2web · Leaflet · QGIS</div>
  <div class="q2w-footer__push"></div>
  <div class="q2w-footer__group q2w-footer__coord" id="q2w-coords">0.0000, 0.0000</div>
</div>
```

## Themes

Use a theme on `<html>` or `<body>`:

```html
<html lang="id" data-theme="ocean">
```

Available presets:

- `dark`
- `ocean`
- `forest`
- `sunset`
- `slate`

You can also override tokens directly:

```css
:root {
  --q2w-accent: #0f7a78;
  --q2w-header-h: 56px;
  --q2w-footer-h: 28px;
}
```

## Icons

`q2w-mapcss` is icon-agnostic — no icon library is bundled. Use any SVG icon set you prefer.

The docs site uses [Lucide](https://lucide.dev) (MIT). To use Lucide in your own project:

```html
<!-- Option A: inline SVG (recommended — no CDN, no request) -->
<!-- Copy the SVG directly from lucide.dev into your HTML -->
<button class="q2w-btn">
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" ...>...</svg>
  Open layers
</button>

<!-- Option B: Lucide CDN script -->
<script src="https://unpkg.com/lucide@latest"></script>
<i data-lucide="layers"></i>
<script>lucide.createIcons();</script>
```

All q2w-mapcss components accept any icon as a child element.

## Development

```bash
npm run build
npm run check
npm run dev
```

Cloudflare Pages:

- build command: `npm run build`
- output directory: `site`
- deploy branch: `main`

## Scope

V1 supports Leaflet qgis2web exports. OpenLayers support is intentionally deferred.

## Support

If q2w-mapcss saved you time, consider buying me a coffee:

[☕ tiptap.gg/dhanypedia/tip](https://tiptap.gg/dhanypedia/tip)
