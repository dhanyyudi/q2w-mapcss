import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function readOutput(relativePath) {
  return readFileSync(join(root, relativePath), "utf8");
}

function assertIncludes(label, content, needles) {
  for (const needle of needles) {
    if (!content.includes(needle)) {
      console.error(`${label} must include ${needle}.`);
      process.exit(1);
    }
  }
}

function assertNotIncludes(label, content, needles) {
  for (const needle of needles) {
    if (content.includes(needle)) {
      console.error(`${label} must not include ${needle}.`);
      process.exit(1);
    }
  }
}

const packageJson = JSON.parse(readOutput("package.json"));
if (packageJson.version !== "0.5.0") {
  console.error(`package.json version must be 0.5.0; found ${packageJson.version}.`);
  process.exit(1);
}
if (packageJson.private !== false) {
  console.error("package.json must set private to false for release preparation.");
  process.exit(1);
}
for (const key of ["homepage", "repository", "bugs", "files", "exports", "scripts"]) {
  if (!(key in packageJson)) {
    console.error(`package.json must include ${key}.`);
    process.exit(1);
  }
}
for (const fileEntry of ["dist/", "snippets/", "tailwind.q2w.js", "README.md", "LICENSE", "CHANGELOG.md"]) {
  if (!packageJson.files.includes(fileEntry)) {
    console.error(`package.json files must include ${fileEntry}.`);
    process.exit(1);
  }
}
for (const exportKey of [".", "./css", "./css/min", "./leaflet", "./plugins", "./showcase", "./interactions", "./tailwind"]) {
  if (!(exportKey in packageJson.exports)) {
    console.error(`package.json exports must include ${exportKey}.`);
    process.exit(1);
  }
}
if (packageJson.scripts.prepublishOnly !== "npm run check") {
  console.error("package.json prepublishOnly must run npm run check.");
  process.exit(1);
}

const required = [
  ".npmignore",
  "CHANGELOG.md",
  "eleventy.config.js",
  "dist/q2w-mapcss.css",
  "dist/q2w-mapcss.min.css",
  "dist/q2w-leaflet.css",
  "dist/q2w-leaflet.min.css",
  "dist/q2w-plugins.css",
  "dist/q2w-mapcss.showcase.css",
  "dist/q2w-interactions.js",
  "dist/q2w-interactions.min.js",
  "site/index.html",
  "site/docs.html",
  "site/docs/header.html",
  "site/docs/popup.html",
  "site/docs/share.html",
  "site/docs/loading.html",
  "site/docs/print.html",
  "site/examples/_data/znt.geojson",
  "site/_headers",
  "site/_redirects",
  "site/brand/icon.png",
  "site/brand/circle-icon.png",
  "site/brand/primary-logo.png",
  "site/brand/wordmark-horizontal.png",
  "site/dist/q2w-mapcss.css",
  "site/examples/choropleth.html",
  "site/examples/dashboard.html",
  "site/examples/heatmap.html",
  "site/examples/poi.html",
  "site/examples/categorized-real/index.html",
  "site/snippets/templates/basic.html",
  "site/snippets/templates/with-panel.html",
  "site/snippets/templates/dashboard.html",
  "wrangler.toml",
  "tailwind.q2w.js",
];

const missing = required.filter((path) => !existsSync(join(root, path)));
if (missing.length) {
  console.error(`Missing build outputs:\n${missing.join("\n")}`);
  process.exit(1);
}

const wranglerToml = readOutput("wrangler.toml");
assertIncludes("wrangler.toml", wranglerToml, ['Q2W_MAPCSS_VERSION = "0.5.0"']);

const npmIgnore = readOutput(".npmignore");
assertIncludes(".npmignore", npmIgnore, [
  "src/",
  "scripts/",
  "site/",
  "docs/",
  ".superpowers/",
  "AGENTS.md",
]);

const changelog = readOutput("CHANGELOG.md");
assertIncludes("CHANGELOG.md", changelog, [
  "# Changelog",
  "## v0.5.0 (2026-05-05)",
  "## v0.4.0 (2026-05-04)",
  "q2w-header--pill-center",
  "q2w-print",
  "dist/q2w-interactions.js",
  "tailwind.q2w.js",
  "snippets/templates/",
]);

const readme = readOutput("README.md");
assertIncludes("README.md", readme, [
  "# q2w-mapcss",
  "npm version",
  "Deploy Status",
  "Tailwind Plugin",
  "Buy me a coffee",
  "## JS Interactions (optional)",
  "## Tailwind plugin",
  "## Templates",
  "npm install q2w-mapcss",
  "q2w.toast('Layer loaded successfully', 'success');",
]);

for (const forbidden of [
  "## Development",
  "Cloudflare Pages:",
  "build command:",
  "output directory:",
  "deploy branch:",
  "## Scope",
]) {
  if (readme.includes(forbidden)) {
    console.error(`README.md must not include release-internal section ${forbidden}.`);
    process.exit(1);
  }
}

const leakedDocs = [
  "site/docs/audit.md",
  "site/docs/audit-2.md",
  "site/docs/audit-3.md",
  "site/docs/audit-4.md",
  "site/docs/superpowers",
].filter((path) => existsSync(join(root, path)));
if (leakedDocs.length) {
  console.error(`Agent-only docs must not be published:\n${leakedDocs.join("\n")}`);
  process.exit(1);
}

const headerDoc = readOutput("site/docs/header.html");
if (!headerDoc.includes('../dist/q2w-mapcss.css') || !headerDoc.includes('../dist/q2w-mapcss.showcase.css')) {
  console.error("Component docs must load CSS from ../dist/ because they are nested under /docs/.");
  process.exit(1);
}
if (headerDoc.includes('href="dist/q2w-mapcss.css"') || headerDoc.includes('href="dist/q2w-mapcss.showcase.css"')) {
  console.error("Component docs must not use root-page relative dist CSS paths.");
  process.exit(1);
}
if (!headerDoc.includes("const key = 'q2w-theme'") || !headerDoc.includes('cs-theme-dot') || !headerDoc.includes('theme-toggle')) {
  console.error("Docs pages must include persisted theme controls and theme dots.");
  process.exit(1);
}
for (const needle of [
  'q2w-header--bar',
  'q2w-header--minimal',
  'q2w-header--expressive',
  'q2w-header--technical',
  'q2w-header--pill-left',
  'q2w-header--pill-center',
  'q2w-header--pill-right',
]) {
  if (!headerDoc.includes(needle)) {
    console.error(`Header docs must include variant ${needle}.`);
    process.exit(1);
  }
}
const explicitThemeRuntime = [
  "const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;",
  "document.documentElement.dataset.theme = theme;",
  "const next = current === 'dark' ? 'light' : 'dark';",
  "applyTheme(root.dataset.theme || 'light');",
];
const missingThemeRuntime = explicitThemeRuntime.filter((needle) => !headerDoc.includes(needle));
if (missingThemeRuntime.length) {
  console.error(`Docs pages must use explicit light/dark theme runtime:\n${missingThemeRuntime.join("\n")}`);
  process.exit(1);
}

const siteIndex = readFileSync(join(root, "site/index.html"), "utf8");
if (siteIndex.includes("ln-strip") || siteIndex.includes("ln-tile") || siteIndex.includes("ln-marquee")) {
  console.error("Landing page must not ship marquee strip markup after Audit 4.");
  process.exit(1);
}
if (!siteIndex.includes("ln-showcase__grid") || !siteIndex.includes("docs/header.html")) {
  console.error("Landing page must ship the component showcase grid after Audit 4.");
  process.exit(1);
}
const landingNav = siteIndex.match(/<nav class="ln-nav">[\s\S]*?<\/nav>/)?.[0] || "";
const githubMatches = landingNav.match(/>\s*GitHub\s*</g) || [];
if (githubMatches.length !== 1) {
  console.error("Landing nav must expose GitHub exactly once.");
  process.exit(1);
}
if (!siteIndex.includes('theme-toggle')) {
  console.error("Landing page must include the minimal theme toggle.");
  process.exit(1);
}
if (!siteIndex.includes('/brand/icon.png') || !siteIndex.includes('og:image')) {
  console.error("Landing page must include branded icon and social metadata.");
  process.exit(1);
}
assertIncludes("site/index.html", siteIndex, [
  "Beautiful UI for your <em>web map</em>.",
  "Works great with qgis2web exports — and with any WebGIS or mapping project.",
  "examples/categorized-real/",
  "/brand/icon.png",
]);
assertNotIncludes("site/index.html", siteIndex, [
  'id="roadmap"',
  'href="#roadmap"',
  "Beautiful UI for your qgis2web exports.",
  "brand-neutral",
  '<span class="ln-brand__mark">q2</span>',
]);

const docsOverviewBranding = readOutput("site/docs.html");
assertIncludes("site/docs.html", docsOverviewBranding, ["/brand/icon.png", "q2w-mapcss"]);
assertNotIncludes("site/docs.html", docsOverviewBranding, ["brand-neutral", '<span class="ln-brand__mark">q2</span>']);
const landingMotionNeedles = [
  'html { scroll-behavior: smooth; }',
  '.reveal {',
  '.reveal.is-visible',
  'reveal-delay-1',
  'reveal-delay-2',
  'reveal-delay-3',
  '@keyframes btn-breathe',
  '@media (prefers-reduced-motion: reduce)',
  'IntersectionObserver',
  "document.querySelectorAll('.reveal')",
  'observer.unobserve',
];
for (const needle of landingMotionNeedles) {
  if (!siteIndex.includes(needle)) {
    console.error(`Landing page must include Phase 3 motion output: ${needle}`);
    process.exit(1);
  }
}

const revealCardCount = (siteIndex.match(/ln-card(?: ln-card--lg)? reveal reveal-delay-/g) || []).length;
if (revealCardCount < 12) {
  console.error(`Landing page must include reveal classes on at least 12 showcase cards; found ${revealCardCount}.`);
  process.exit(1);
}

const componentLayoutDoc = readOutput("site/docs/filter.html");
assertIncludes("site/docs/filter.html", componentLayoutDoc, [
  ".doc-preview:has(.doc-map-preview)",
]);

const footerDoc = readOutput("site/docs/footer.html");
assertIncludes("site/docs/footer.html", footerDoc, [
  "q2w-scalebar",
  "q2w-footer--compact",
  "q2w-footer--floating",
  "q2w-footer--coords",
]);

const sidebarDoc = readOutput("site/docs/sidebar.html");
assertIncludes("site/docs/sidebar.html", sidebarDoc, [
  "Cirebon Land Value",
  "q2w-sidebar__title",
  "q2w-sidebar__sub",
  "<svg",
]);

const loadingDoc = readOutput("site/docs/loading.html");
assertIncludes("site/docs/loading.html", loadingDoc, [
  "q2w-spinner",
  "q2w-loadbar",
  "q2w-skeleton",
]);

const sliderDoc = readOutput("site/docs/slider.html");
assertIncludes("site/docs/slider.html", sliderDoc, [
  "data-doc-slider",
  "data-doc-slider-value",
  "q2w-slider__input",
  "Layer opacity",
  "75%",
]);

const shareDoc = readOutput("site/docs/share.html");
assertIncludes("site/docs/share.html", shareDoc, [
  "q2w-share__qr",
  "q2w-share__grid",
  "q2w-share__stat",
  "Copy link",
  "Embed code",
  "current viewport",
  "data-doc-share-copy",
]);

const filterDoc = readOutput("site/docs/filter.html");
assertIncludes("site/docs/filter.html", filterDoc, [
  "q2w-filter__chip",
  "q2w-filter__segment",
  "q2w-filter__range",
  "q2w-filter__summary",
  "1,248",
  "Road buffer",
  "data-doc-filter-segment",
]);

const drawDoc = readOutput("site/docs/draw.html");
assertIncludes("site/docs/draw.html", drawDoc, [
  "data-doc-draw-tool",
  "data-doc-draw-status",
  "Point tool active",
]);

const basemapDoc = readOutput("site/docs/basemap.html");
assertIncludes("site/docs/basemap.html", basemapDoc, [
  "doc-map-preview__tiles--light",
  "data-doc-basemap=\"OSM Streets\"",
  "data-doc-basemap=\"Carto Light\"",
  "data-doc-basemap=\"Esri Terrain\"",
  "data-doc-basemap=\"Esri Imagery\"",
  "tile.openstreetmap.org",
  "basemaps.cartocdn.com/light_all",
  "World_Terrain_Base",
  "World_Imagery",
]);
assertNotIncludes("site/docs/basemap.html", basemapDoc, [
  "id=\"docs-basemap-map\"",
  "L.map(mapEl",
  "height: 220px",
]);

const compassDoc = readOutput("site/docs/compass.html");
assertIncludes("site/docs/compass.html", compassDoc, [
  "q2w-compass--ring",
  "q2w-compass--button",
  "q2w-compass--bearing",
  "q2w-scale",
  "q2w-scale--bar",
  "q2w-scale--text",
  "1 km",
  "Bearing",
  "032°",
]);

const printDoc = readOutput("site/docs/print.html");
assertIncludes("site/docs/print.html", printDoc, [
  "q2w-print",
  "q2w-print__header",
  "q2w-print__row",
]);

const popupDoc = readOutput("site/docs/popup.html");
for (const needle of ['q2w-popup--striped', 'q2w-popup--governmental', 'q2w-popup--status', 'data-status="ok"']) {
  if (!popupDoc.includes(needle)) {
    console.error(`Popup docs must include variant ${needle}.`);
    process.exit(1);
  }
}

const modalDoc = readOutput("site/docs/modal.html");
assertIncludes("site/docs/modal.html", modalDoc, [
  "../dist/q2w-interactions.js",
  'data-q2w-modal="docs-modal-demo"',
  'id="docs-modal-demo"',
  "data-q2w-close",
]);

const toastDoc = readOutput("site/docs/toast.html");
assertIncludes("site/docs/toast.html", toastDoc, [
  "../dist/q2w-interactions.js",
  "data-doc-toast",
  "window.q2w.toast",
]);

const popupInteractiveDoc = readOutput("site/docs/popup.html");
assertIncludes("site/docs/popup.html", popupInteractiveDoc, [
  "../dist/q2w-interactions.js",
  "data-q2w-panel-group=\"popup-demo\"",
  "data-q2w-tab=\"attributes\"",
  "data-q2w-panel=\"history\"",
]);

const docsVariantRequirements = {
  "site/docs/header.html": [
    "q2w-header",
    "q2w-header--bar",
    "q2w-header--minimal",
    "q2w-header--expressive",
    "q2w-header--technical",
    "q2w-header--pill-left",
    "q2w-header--pill-center",
    "q2w-header--pill-right",
  ],
  "site/docs/popup.html": [
    "q2w-popup",
    "q2w-popup__media",
    "q2w-tabs",
    "q2w-popup--minimal",
    "q2w-popup--technical",
    "q2w-popup--expressive",
    "q2w-popup--striped",
    "q2w-popup--governmental",
  ],
  "site/docs/button.html": [
    "q2w-btn",
    "q2w-btn--primary",
    "q2w-btn--ghost",
    "q2w-btn--icon",
    "q2w-btn--pill",
    "q2w-btn--loading",
    "q2w-btn--help",
    "q2w-btn--sm",
    "q2w-btn--lg",
  ],
  "site/docs/layer.html": [
    "q2w-panel",
    "q2w-layer",
    "q2w-sublayer",
    "q2w-panel__section",
    "q2w-panel__section-title",
    "q2w-panel__header--collapsible",
    "is-collapsed",
    "Compact layer list",
    "Technical dense",
    "q2w-layer__handle",
    "q2w-layer__expand",
  ],
  "site/docs/legend.html": [
    "q2w-legend-swatch",
    "q2w-grad",
    "--q2w-div-",
    "q2w-legend-dot",
    "q2w-legend-line",
  ],
  "site/docs/control.html": [
    "q2w-control",
    "q2w-control__btn",
    "q2w-control--rounded",
    "q2w-toolbar",
    "q2w-toolbar--row",
  ],
  "site/docs/toast.html": [
    "q2w-toast--info",
    "q2w-toast--success",
    "q2w-toast--warning",
    "q2w-toast--error",
  ],
  "site/docs/marker.html": [
    "q2w-marker",
    "q2w-marker--pin",
    "q2w-marker--square",
    "q2w-cluster",
    "var(--q2w-danger)",
    "var(--q2w-success)",
  ],
  "site/docs/modal.html": [
    "q2w-modal-backdrop",
    "q2w-modal",
    "q2w-modal__footer",
    "Compact splash",
    "Open map",
  ],
  "site/docs/search.html": [
    "q2w-search",
    "q2w-search__results",
    "q2w-search__item",
    "q2w-search__kbd",
    "⌘K",
    "q2w-search--floating",
  ],
  "site/docs/basemap.html": [
    "q2w-basemap-panel",
    "q2w-basemap-grid--tiles",
    "q2w-basemap--tile",
    "q2w-basemap--active",
    "q2w-bm-osm",
    "q2w-bm-esri-terrain",
    "q2w-bm-esri-imagery",
    "q2w-bm-carto-light",
  ],
  "site/docs/measure.html": [
    "Distance",
    "Area",
    "Last segment",
    "Bearing",
  ],
  "site/docs/compass.html": [
    "q2w-compass--ring",
    "q2w-compass--button",
    "q2w-compass--bearing",
    "q2w-scale--bar",
    "q2w-scale--text",
    "1:25,000",
  ],
  "site/docs/draw.html": [
    "Point",
    "Line",
    "Polygon",
    "Rectangle",
    "Edit",
    "Delete",
    "<svg",
  ],
  "site/docs/tooltip.html": [
    "q2w-tooltip--compact",
    "q2w-tooltip--dark",
    "q2w-tooltip--rich",
  ],
  "site/docs/compare.html": [
    "Before",
    "After",
    "q2w-compare__handle",
  ],
  "site/docs/sheet.html": [
    "Bottom sheet · popup",
    "Bottom sheet · layers",
    "Mobile chrome",
  ],
  "site/docs/minimap.html": [
    "q2w-minimap__tiles--dark",
  ],
  "site/docs/loading.html": [
    "q2w-spinner",
    "q2w-loadbar",
    "q2w-skeleton",
  ],
  "site/docs/print.html": [
    "q2w-print",
    "q2w-print__header",
    "q2w-print__row",
  ],
};

for (const [relativePath, needles] of Object.entries(docsVariantRequirements)) {
  assertIncludes(relativePath, readOutput(relativePath), needles);
}

const css = readFileSync(join(root, "dist/q2w-mapcss.css"), "utf8");
assertIncludes("dist/q2w-mapcss.css", css, [
  "q2w-mapcss v0.5.0",
  "Lightweight CSS framework + JS interactions for qgis2web Leaflet exports.",
  "https://q2w-mapcss.pages.dev",
  "License: MIT",
  ".q2w-header--pill-center",
  ".q2w-header--pill-right",
  ".q2w-popup--status",
  ".q2w-toast--info",
  ".q2w-search__kbd",
  ".q2w-search--floating",
  ".q2w-footer--compact",
  ".q2w-footer--floating",
  ".q2w-footer--coords",
  ".q2w-tooltip--compact",
  ".q2w-tooltip--dark",
  ".q2w-toolbar",
  ".q2w-btn--sm",
  ".q2w-btn--lg",
  ".q2w-marker--pin",
  ".q2w-marker--square",
  ".q2w-print",
  ".q2w-spinner",
  ".q2w-loadbar",
  ".q2w-skeleton",
  ".q2w-slider__input",
  ".q2w-share__title",
  ".q2w-share__qr",
  ".q2w-share__grid",
  ".q2w-share__stat",
  ".q2w-filter__count",
  ".q2w-filter__chip",
  ".q2w-filter__segment",
  ".q2w-filter__range",
  ".q2w-filter__summary",
  ".q2w-draw__status",
  ".q2w-bm-osm",
  ".q2w-bm-esri-terrain",
  ".q2w-basemap-panel",
  ".q2w-basemap-grid--tiles",
  ".q2w-basemap--tile",
  ".q2w-compass--ring",
  ".q2w-compass--button",
  ".q2w-compass--bearing",
  ".q2w-scale--bar",
  ".q2w-scale--text",
  ".leaflet-layerstree-header-label",
  ".leaflet-layerstree-header-name table",
]);

const minCss = readOutput("dist/q2w-mapcss.min.css");
assertIncludes("dist/q2w-mapcss.min.css", minCss, ["q2w-mapcss v0.5.0"]);

const showcaseCss = readOutput("dist/q2w-mapcss.showcase.css");
assertIncludes("dist/q2w-mapcss.showcase.css", showcaseCss, [
  ".doc-map-preview",
  ".doc-map-preview__tiles",
  ".doc-map-preview__controls",
]);

const mustContain = [
  "--q2w-accent",
  ".q2w-header",
  ".q2w-popup",
  ".leaflet-control-layers",
  ".leaflet-popup-content",
  "body.q2w-qgis2web #map",
];

const absent = mustContain.filter((needle) => !css.includes(needle));
if (absent.length) {
  console.error(`Framework CSS missing expected selectors:\n${absent.join("\n")}`);
  process.exit(1);
}
if (!css.includes('[data-theme="light"] {')) {
  console.error('Framework CSS must include explicit [data-theme="light"] tokens.');
  process.exit(1);
}
for (const needle of ['.q2w-btn--help', '.q2w-panel__header--collapsible', 'body.q2w-labels-box .leaflet-tooltip']) {
  if (!css.includes(needle)) {
    console.error(`Framework CSS must include Phase 2 selector ${needle}.`);
    process.exit(1);
  }
}

const interactionsJs = readOutput("dist/q2w-interactions.js");
assertIncludes("dist/q2w-interactions.js", interactionsJs, [
  "window.q2w.toast = createToast",
  "window.q2w.coordDisplay = coordDisplay",
  "window.q2w.bindLayerPanel = bindLayerPanel",
  "initModals()",
  "initTabs()",
]);

const minSize = statSync(join(root, "dist/q2w-mapcss.min.css")).size;
if (minSize <= 1000) {
  console.error("Minified CSS looks too small.");
  process.exit(1);
}

const leafletCss = readFileSync(join(root, "dist/q2w-leaflet.css"), "utf8");
if (!leafletCss.includes(".leaflet-container") || !leafletCss.includes(".leaflet-popup-content")) {
  console.error("Universal Leaflet CSS missing expected Leaflet selectors.");
  process.exit(1);
}
if (leafletCss.includes("body.q2w-qgis2web")) {
  console.error("Universal Leaflet CSS must not include qgis2web body helpers.");
  process.exit(1);
}

const example = readFileSync(join(root, "site/examples/choropleth.html"), "utf8");
if (!example.includes("../dist/q2w-mapcss.css")) {
  console.error("Example pages must consume the hosted dist CSS.");
  process.exit(1);
}
const realExample = readOutput("site/examples/categorized-real/index.html");
assertIncludes("site/examples/categorized-real/index.html", realExample, [
  "q2w-theme-toggle",
  "Kembali ke beranda",
  "../../index.html",
  "sp-welcome",
  "helpBtn",
]);
assertNotIncludes("site/examples/categorized-real/index.html", realExample, [
  "object-fit: cover",
]);

for (const name of ["choropleth", "dashboard", "heatmap", "poi"]) {
  const html = readFileSync(join(root, `site/examples/${name}.html`), "utf8");
  if (!html.includes("_data/znt.geojson")) {
    console.error(`${name} example must load shared znt.geojson data.`);
    process.exit(1);
  }
  if (html.includes("clip-path")) {
    console.error(`${name} example must not contain fake clip-path map geometry.`);
    process.exit(1);
  }
}

if (!readFileSync(join(root, "site/examples/heatmap.html"), "utf8").includes("leaflet-heat")) {
  console.error("Heatmap example must include leaflet-heat.");
  process.exit(1);
}
if (!readFileSync(join(root, "site/examples/poi.html"), "utf8").includes("markercluster")) {
  console.error("POI example must include markercluster.");
  process.exit(1);
}

if (!realExample.includes("../../dist/q2w-mapcss.css")) {
  console.error("Real qgis2web example must consume ../../dist/q2w-mapcss.css.");
  process.exit(1);
}
if (realExample.includes("css/sipeta-redesign.css")) {
  console.error("Real qgis2web example must not load css/sipeta-redesign.css.");
  process.exit(1);
}

function walk(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

const tailwindPlugin = readOutput("tailwind.q2w.js");
assertIncludes("tailwind.q2w.js", tailwindPlugin, [
  'require("tailwindcss/plugin")',
  '"q2w-accent": "var(--q2w-accent)"',
  '"q2w-surface": "var(--q2w-surface)"',
  '"q2w-md": "var(--q2w-radius-md)"',
  '"q2w-4": "var(--q2w-space-4)"',
  '"q2w-lg": "var(--q2w-shadow-lg)"',
]);

const basicTemplate = readOutput("site/snippets/templates/basic.html");
assertIncludes("site/snippets/templates/basic.html", basicTemplate, [
  "q2w-mapcss.css",
  "q2w-interactions.js",
  "window.q2w.coordDisplay",
  "id=\"map\"",
]);

const panelTemplate = readOutput("site/snippets/templates/with-panel.html");
assertIncludes("site/snippets/templates/with-panel.html", panelTemplate, [
  "q2w-panel__header--collapsible",
  "data-layer-id=\"cities\"",
  "window.q2w.bindLayerPanel",
]);

const dashboardTemplate = readOutput("site/snippets/templates/dashboard.html");
assertIncludes("site/snippets/templates/dashboard.html", dashboardTemplate, [
  "q2w-sidebar",
  "q2w-panel",
  "Chart placeholder",
]);

const quickStart = readOutput("docs/quick-start.md");
assertIncludes("docs/quick-start.md", quickStart, [
  'script src="css/q2w-interactions.js"',
  "modal open and close helpers",
  "snippets/templates/",
  "with-panel.html",
  "dashboard.html",
]);

const docsOverview = readOutput("site/docs.html");
assertIncludes("site/docs.html", docsOverview, [
  "Templates",
  "basic.html",
  "with-panel.html",
  "dashboard.html",
]);

const gitignore = readOutput(".gitignore");
assertIncludes(".gitignore", gitignore, [
  "/qgis2web-wireframe-framework/",
  "/web-branding/",
  "/qgis2web_redesign/",
]);

assertIncludes("dist/q2w-mapcss.css", css, [
  ".q2w-header--pill-left",
  ".q2w-btn--help",
  ".q2w-panel.is-collapsed",
  ".q2w-popup--striped",
  ".q2w-popup--governmental",
]);

const qgis2webAdapter = readOutput("src/adapter-qgis2web.css");
assertIncludes("src/adapter-qgis2web.css", qgis2webAdapter, [
  "body.q2w-labels-box .leaflet-tooltip",
]);

assertIncludes("site/index.html", siteIndex, [
  "v0.5 · WebGIS-ready · MIT",
  "Beautiful UI for your <em>web map</em>.",
  "q2w works on any Leaflet-based web map, not just qgis2web exports.",
]);
assertNotIncludes("site/index.html", siteIndex, [
  "04 · ROADMAP",
  "What's next.",
]);

const sourceFiles = walk(join(root, "src/site")).filter((path) => /\.(html|njk)$/.test(path));
const legacyRefs = [];
for (const file of sourceFiles) {
  const content = readFileSync(file, "utf8");
  if (content.includes("assets/tokens.css") || content.includes("assets/q2w.css")) {
    legacyRefs.push(file.replace(`${root}/`, ""));
  }
}
if (legacyRefs.length) {
  console.error(`Source site files still reference legacy asset paths:\n${legacyRefs.join("\n")}`);
  process.exit(1);
}

console.log("q2w-mapcss check passed.");
