# q2w-mapcss

> A lightweight CSS framework for building polished Leaflet WebGIS interfaces, including qgis2web exports.

[![npm version](https://img.shields.io/npm/v/q2w-mapcss?color=0f7a78&label=npm)](https://www.npmjs.com/package/q2w-mapcss)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://github.com/dhanyyudi/q2w-mapcss/blob/main/LICENSE)
[![Deploy Status](https://img.shields.io/website?url=https%3A%2F%2Fq2w-mapcss.pages.dev&label=docs&color=0f7a78)](https://q2w-mapcss.pages.dev)

[![CSS](https://img.shields.io/badge/CSS-Plain%20CSS-264de4?logo=css3&logoColor=white)](https://q2w-mapcss.pages.dev)
[![Leaflet](https://img.shields.io/badge/Leaflet-Compatible-199900?logo=leaflet&logoColor=white)](https://leafletjs.com)
[![Tailwind Plugin](https://img.shields.io/badge/Tailwind-Plugin%20Available-06B6D4?logo=tailwindcss&logoColor=white)](https://q2w-mapcss.pages.dev/docs.html#tokens)
[![qgis2web](https://img.shields.io/badge/qgis2web-Drop--in%20Support-589632?logo=qgis&logoColor=white)](https://plugins.qgis.org/plugins/qgis2web/)

[![Buy me a coffee](https://img.shields.io/badge/Support-Buy%20me%20a%20coffee-FFDD00?logo=buy-me-a-coffee&logoColor=black)](https://tiptap.gg/dhanypedia/tip)
[![GitHub stars](https://img.shields.io/github/stars/dhanyyudi/q2w-mapcss?style=social)](https://github.com/dhanyyudi/q2w-mapcss)

---

## Quick Start

### CDN (recommended)

```html
<link rel="stylesheet" href="https://q2w-mapcss.pages.dev/dist/q2w-mapcss.css">
```

### npm (after the package is published)

```bash
npm install q2w-mapcss
```

```html
<link rel="stylesheet" href="node_modules/q2w-mapcss/dist/q2w-mapcss.css">
```

### qgis2web integration

1. Copy `dist/q2w-mapcss.css` into your export `css/` folder.
2. Add the stylesheet after qgis2web and plugin CSS files.
3. Add body helpers:

```html
<body class="q2w-qgis2web q2w-has-footer q2w-controls-below-header">
```

## Themes

Apply via `data-theme` on `<html>` or `<body>`:

```html
<html data-theme="ocean">
```

| Theme | Value | Accent |
|-------|-------|--------|
| Default | `light` | Teal `#0f7a78` |
| Dark | `dark` | Cyan `#2dd4d0` |
| Ocean | `ocean` | Blue `#1d6fc4` |
| Forest | `forest` | Green `#2f7d4a` |
| Sunset | `sunset` | Orange `#d8632a` |
| Slate | `slate` | Gray `#3f4a5c` |

Override any token:

```css
:root {
  --q2w-accent: #137a7f;
  --q2w-radius-md: 8px;
}
```

## Icons

`q2w-mapcss` is icon-agnostic. Use any SVG or icon set:

```html
<button class="q2w-btn">
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z"></path><path d="M9 4v14"></path><path d="M15 6v14"></path></svg>
  Open map
</button>
```

## JS Interactions (optional)

```html
<script src="https://q2w-mapcss.pages.dev/dist/q2w-interactions.js"></script>
```

Enables modal open/close, toast notifications, tab switching, popup close, layer panel binding, and coordinate display helpers.

```js
q2w.toast('Layer loaded successfully', 'success');
q2w.coordDisplay(map, '#my-coords-element');
```

## Tailwind plugin

```js
// tailwind.config.js
const q2w = require('q2w-mapcss/tailwind');
module.exports = { plugins: [q2w] };
```

Adds `q2w-*` color, radius, spacing, and shadow utilities to Tailwind. Continue loading q2w-mapcss CSS separately for component classes.

## Templates

Starter app shells are available under `snippets/templates/`:

- `basic.html` — floating header + map + footer
- `with-panel.html` — map shell with collapsible layer panel binding
- `dashboard.html` — map plus summary sidebar layout

## Docs

The component docs include layout, controls, data display, feedback, loading, print/export, and advanced WebGIS patterns.

- Landing page: https://q2w-mapcss.pages.dev/
- Component docs: https://q2w-mapcss.pages.dev/docs.html
- Quick start: https://github.com/dhanyyudi/q2w-mapcss/blob/main/docs/quick-start.md

## License

MIT © [dhanyyudi](https://github.com/dhanyyudi)

---

☕ If q2w-mapcss saved you time → [buy me a coffee](https://tiptap.gg/dhanypedia/tip)
