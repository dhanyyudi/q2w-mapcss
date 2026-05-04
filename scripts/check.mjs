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

const packageJson = JSON.parse(readOutput("package.json"));
if (packageJson.version !== "0.4.0") {
  console.error(`package.json version must be 0.4.0; found ${packageJson.version}.`);
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
assertIncludes("wrangler.toml", wranglerToml, ['Q2W_MAPCSS_VERSION = "0.4.0"']);

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

const popupDoc = readOutput("site/docs/popup.html");
for (const needle of ['q2w-popup--striped', 'q2w-popup--governmental']) {
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
  ],
  "site/docs/layer.html": [
    "q2w-panel",
    "q2w-layer",
    "q2w-sublayer",
    "q2w-panel__section",
    "q2w-panel__section-title",
    "q2w-panel__header--collapsible",
    "is-collapsed",
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
  ],
  "site/docs/toast.html": [
    "q2w-toast--success",
    "q2w-toast--warning",
    "q2w-toast--error",
  ],
  "site/docs/marker.html": [
    "q2w-marker",
    "q2w-cluster",
  ],
  "site/docs/modal.html": [
    "q2w-modal-backdrop",
    "q2w-modal",
    "q2w-modal__footer",
  ],
  "site/docs/search.html": [
    "q2w-search",
    "q2w-search__results",
    "q2w-search__item",
  ],
  "site/docs/basemap.html": [
    "q2w-basemap-grid",
    "q2w-basemap",
    "q2w-basemap--active",
  ],
};

for (const [relativePath, needles] of Object.entries(docsVariantRequirements)) {
  assertIncludes(relativePath, readOutput(relativePath), needles);
}

const css = readFileSync(join(root, "dist/q2w-mapcss.css"), "utf8");
assertIncludes("dist/q2w-mapcss.css", css, [
  "q2w-mapcss v0.4.0",
  "Lightweight CSS framework + JS interactions for qgis2web Leaflet exports.",
  "https://q2w-mapcss.pages.dev",
  "License: MIT",
]);

const minCss = readOutput("dist/q2w-mapcss.min.css");
assertIncludes("dist/q2w-mapcss.min.css", minCss, ["q2w-mapcss v0.4.0"]);

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

const realExample = readFileSync(
  join(root, "site/examples/categorized-real/index.html"),
  "utf8"
);
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
