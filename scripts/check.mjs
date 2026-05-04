import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const required = [
  "eleventy.config.js",
  "dist/q2w-mapcss.css",
  "dist/q2w-mapcss.min.css",
  "dist/q2w-leaflet.css",
  "dist/q2w-leaflet.min.css",
  "dist/q2w-plugins.css",
  "dist/q2w-mapcss.showcase.css",
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
  "wrangler.toml",
];

const missing = required.filter((path) => !existsSync(join(root, path)));
if (missing.length) {
  console.error(`Missing build outputs:\n${missing.join("\n")}`);
  process.exit(1);
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

const headerDoc = readFileSync(join(root, "site/docs/header.html"), "utf8");
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

const popupDoc = readFileSync(join(root, "site/docs/popup.html"), "utf8");
for (const needle of ['q2w-popup--striped', 'q2w-popup--governmental']) {
  if (!popupDoc.includes(needle)) {
    console.error(`Popup docs must include variant ${needle}.`);
    process.exit(1);
  }
}

const css = readFileSync(join(root, "dist/q2w-mapcss.css"), "utf8");
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
