import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = join(root, "src");
const distDir = join(root, "dist");
const version = JSON.parse(readFileSync(join(root, "package.json"), "utf8")).version;
const header = `/*!\n * q2w-mapcss v${version}\n * Lightweight CSS framework + JS interactions for qgis2web Leaflet exports.\n * https://q2w-mapcss.pages.dev\n * License: MIT\n */\n`;
const minHeader = `/*! q2w-mapcss v${version} | MIT | https://q2w-mapcss.pages.dev */\n`;

function read(path) {
  return readFileSync(path, "utf8");
}

function write(path, content) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
}

function minify(css) {
  return css
    .replace(/\/\*![\s\S]*?\*\//g, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*([{}:;,>])\s*/g, "$1")
    .replace(/;}/g, "}")
    .trim();
}

function minifyJs(source) {
  return source
    .replace(/\/\*![\s\S]*?\*\//g, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|\s+)\/\/.*$/gm, "")
    .replace(/\n\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function bundleCss(sources, outputName) {
  const concatenated = sources.map((path) => read(join(root, path))).join("\n\n");
  write(join(distDir, `${outputName}.css`), `${header}${concatenated}\n`);
  write(join(distDir, `${outputName}.min.css`), `${minHeader}${minify(concatenated)}\n`);
}

function buildDist() {
  const fullSources = [
    "src/tokens.css",
    "src/components.css",
    "src/adapter-leaflet.css",
    "src/adapter-qgis2web.css",
  ];
  const leafletSources = [
    "src/tokens.css",
    "src/components.css",
    "src/adapter-leaflet.css",
  ];
  const showcase = [
    "/* q2w-mapcss docs showcase styles, not required for map exports. */",
    read(join(srcDir, "showcase.css")),
  ].join("\n\n");

  rmSync(distDir, { recursive: true, force: true });
  mkdirSync(distDir, { recursive: true });
  bundleCss(fullSources, "q2w-mapcss");
  bundleCss(leafletSources, "q2w-leaflet");
  write(join(distDir, "q2w-plugins.css"), read(join(srcDir, "adapter-plugins.css")) + "\n");
  write(join(distDir, "q2w-mapcss.showcase.css"), showcase);

  const interactions = read(join(srcDir, "interactions.js"));
  write(join(distDir, "q2w-interactions.js"), `${interactions}\n`);
  write(join(distDir, "q2w-interactions.min.js"), `${minifyJs(interactions)}\n`);
}

buildDist();
console.log("Built q2w-mapcss dist/.");
