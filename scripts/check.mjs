import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const required = [
  "dist/q2w-mapcss.css",
  "dist/q2w-mapcss.min.css",
  "dist/q2w-mapcss.showcase.css",
  "site/index.html",
  "site/docs.html",
  "site/dist/q2w-mapcss.css",
  "site/examples/choropleth.html",
  "site/examples/dashboard.html",
  "site/examples/heatmap.html",
  "site/examples/poi.html",
  "wrangler.toml",
];

const missing = required.filter((path) => !existsSync(join(root, path)));
if (missing.length) {
  console.error(`Missing build outputs:\n${missing.join("\n")}`);
  process.exit(1);
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

const minSize = statSync(join(root, "dist/q2w-mapcss.min.css")).size;
if (minSize <= 1000) {
  console.error("Minified CSS looks too small.");
  process.exit(1);
}

const example = readFileSync(join(root, "site/examples/choropleth.html"), "utf8");
if (!example.includes("../dist/q2w-mapcss.css")) {
  console.error("Example pages must consume the hosted dist CSS.");
  process.exit(1);
}

console.log("q2w-mapcss check passed.");
