import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = join(root, "src");
const siteSourceDir = join(srcDir, "site");
const publicDir = join(root, "public");
const distDir = join(root, "dist");
const siteDir = join(root, "site");
const siteDistDir = join(siteDir, "dist");
const version = JSON.parse(readFileSync(join(root, "package.json"), "utf8")).version;
const header = `/* q2w-mapcss v${version} | MIT License | https://github.com/dhanyyudi/q2w-mapcss */\n`;
const minHeader = `/* q2w-mapcss v${version} | MIT */\n`;

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

function replaceAll(input, replacements) {
  let output = input;
  for (const [from, to] of replacements) {
    output = output.split(from).join(to);
  }
  return output;
}

function rewriteCommonHtml(html, depth = "") {
  const distHref = `${depth}dist/q2w-mapcss.css`;
  return replaceAll(html, [
    ['<link rel="stylesheet" href="assets/tokens.css" />\n<link rel="stylesheet" href="assets/q2w.css" />', `<link rel="stylesheet" href="${distHref}" />`],
    ['<link rel="stylesheet" href="../assets/tokens.css" />\n<link rel="stylesheet" href="../assets/q2w.css" />', `<link rel="stylesheet" href="${distHref}" />`],
    ["q2w — qgis2web Component Kit", "q2w-mapcss — qgis2web CSS Framework"],
    ["q2w — UI components for qgis2web exports", "q2w-mapcss — CSS framework for qgis2web exports"],
    ["q2w · Choropleth example", "q2w-mapcss · Choropleth example"],
    ["q2w · Dashboard example", "q2w-mapcss · Dashboard example"],
    ["q2w · Heatmap example", "q2w-mapcss · Heatmap example"],
    ["q2w · POI example", "q2w-mapcss · POI example"],
    ["q2w · component kit", "q2w-mapcss"],
    ["q2w · Component kit", "q2w-mapcss"],
    ["q2w · component kit · v0.1", "q2w-mapcss · v0.1"],
    ["<span>q2w</span>", "<span>q2w-mapcss</span>"],
    ["Why q2w", "Why q2w-mapcss"],
    ["WHY q2w", "WHY q2w-mapcss"],
    ["With q2w", "With q2w-mapcss"],
    ["Cheatsheet", "Docs"],
    ["A component kit for qgis2web exports.", "A CSS framework for qgis2web exports."],
    ["q2w is a lightweight Tailwind + Leaflet UI framework.", "q2w-mapcss is a lightweight Tailwind inspired CSS framework for Leaflet qgis2web exports."],
    ["Beautiful UI for your <em>qgis2web</em> exports.", "Polished map UI for your <em>qgis2web</em> exports."],
    ["A lightweight Tailwind + Leaflet component kit.", "A lightweight CSS framework for Leaflet qgis2web exports."],
    ["Drop on top of any qgis2web export.", "Drop into any Leaflet qgis2web export."],
    ["Component kit", "Component gallery"],
    ["Browse components", "Browse docs"],
    ['href="index.html"', 'href="docs.html"'],
    ['href="landing.html"', 'href="index.html"'],
    ['href="../index.html"', 'href="../docs.html"'],
    ["assets/tokens.css", "dist/q2w-mapcss.css"],
    ["assets/q2w.css", "dist/q2w-mapcss.css"],
    ["q2w.css", "q2w-mapcss.css"],
    ["q2w/dist/q2w-mapcss.css", "q2w-mapcss/dist/q2w-mapcss.css"],
    ['<span class="tk-n">npm</span> <span class="tk-k">install</span> <span class="tk-s">q2w</span>', '<span class="tk-c"># Copy dist/q2w-mapcss.css into your qgis2web export</span>'],
    ["q2w fixes that once.", "q2w-mapcss fixes that once."],
    ["q2w-footer", "q2w-footer"],
  ]);
}

function patchExampleChrome(html) {
  if (!html.includes(".ex-back") || html.includes("q2w-mapcss example responsive patch")) {
    return html;
  }
  const patch = `
  /* q2w-mapcss example responsive patch */
  @media (max-width: 640px) {
    .ex-back {
      top: auto !important;
      bottom: 44px !important;
      left: 12px !important;
      z-index: 800;
    }
    .ex-map > .q2w-popup {
      left: 12px !important;
      right: 12px !important;
      width: auto !important;
      transform: none !important;
    }
  }
`;
  return html.replace("</style>", `${patch}</style>`);
}

function injectShowcaseCss(html) {
  const link = '<link rel="stylesheet" href="dist/q2w-mapcss.showcase.css" />';
  const quickStartLink = '<a href="#quick-start">Quick start</a>';
  let output = html;
  if (html.includes("q2w-mapcss.showcase.css")) {
    output = html;
  } else {
    output = html.replace('<link rel="stylesheet" href="dist/q2w-mapcss.css" />', `<link rel="stylesheet" href="dist/q2w-mapcss.css" />\n${link}`);
  }
  if (!output.includes('href="#quick-start"')) {
    output = output.replace('<a href="#tokens" class="active">Tokens</a>', `${quickStartLink}\n    <a href="#tokens" class="active">Tokens</a>`);
  }
  if (!output.includes('id="quick-start"')) {
    output = output.replace("<!-- ============ Tokens ============ -->", `${quickStartSection()}\n\n<!-- ============ Tokens ============ -->`);
  }
  return output;
}

function quickStartSection() {
  return `<!-- ============ Quick start ============ -->
<section class="cs-section" id="quick-start">
  <div class="cs-section__head">
    <span class="cs-num">00</span>
    <h2>Quick start</h2>
    <p>Use the compiled CSS and copy snippets into a Leaflet qgis2web export.</p>
  </div>
  <div class="cs-grid cs-grid--3">
    <div class="cs-card">
      <div class="cs-card__head"><div class="cs-card__title">Local CSS</div><div class="cs-card__tag">copy file</div></div>
      <div class="cs-card__body" style="align-items: stretch; justify-content: flex-start; min-height: 140px;">
        <pre class="cs-mono" style="white-space: pre-wrap; margin: 0;">&lt;link rel="stylesheet" href="css/q2w-mapcss.css"&gt;</pre>
      </div>
    </div>
    <div class="cs-card">
      <div class="cs-card__head"><div class="cs-card__title">Hosted CSS</div><div class="cs-card__tag">Cloudflare Pages</div></div>
      <div class="cs-card__body" style="align-items: stretch; justify-content: flex-start; min-height: 140px;">
        <pre class="cs-mono" style="white-space: pre-wrap; margin: 0;">&lt;link rel="stylesheet" href="/dist/q2w-mapcss.css"&gt;</pre>
      </div>
    </div>
    <div class="cs-card">
      <div class="cs-card__head"><div class="cs-card__title">Body helpers</div><div class="cs-card__tag">adapter</div></div>
      <div class="cs-card__body" style="align-items: stretch; justify-content: flex-start; min-height: 140px;">
        <pre class="cs-mono" style="white-space: pre-wrap; margin: 0;">&lt;body class="q2w-qgis2web q2w-has-footer q2w-controls-below-header"&gt;</pre>
      </div>
    </div>
  </div>
  <p style="margin: 14px 0 0; color: var(--q2w-text-muted); font-size: 12.5px;">Snippets are available under <code>snippets/</code>: header, footer, welcome modal, help modal, legend panel, and popup.</p>
</section>`;
}

function bundleCss(sources, outputName) {
  const concatenated = sources.map((path) => read(join(root, path))).join("\n\n");
  write(join(distDir, `${outputName}.css`), `${header}${concatenated}\n`);
  write(join(distDir, `${outputName}.min.css`), `${minHeader}${minify(concatenated)}\n`);
}

function buildCss() {
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
}

function buildSite() {
  rmSync(siteDir, { recursive: true, force: true });
  mkdirSync(siteDistDir, { recursive: true });
  cpSync(distDir, siteDistDir, { recursive: true });
  cpSync(join(publicDir, "uploads"), join(siteDir, "uploads"), { recursive: true });
  cpSync(join(root, "snippets"), join(siteDir, "snippets"), { recursive: true });
  cpSync(join(root, "docs"), join(siteDir, "docs"), { recursive: true });

  const landing = rewriteCommonHtml(read(join(siteSourceDir, "landing.html")));
  const docs = injectShowcaseCss(rewriteCommonHtml(read(join(siteSourceDir, "docs.html"))));
  write(join(siteDir, "index.html"), landing);
  write(join(siteDir, "docs.html"), docs);

  const examplesDir = join(siteSourceDir, "examples");
  const siteExamplesDir = join(siteDir, "examples");
  cpSync(examplesDir, siteExamplesDir, { recursive: true });
  for (const name of ["choropleth.html", "dashboard.html", "heatmap.html", "poi.html"]) {
    const path = join(siteExamplesDir, name);
    const html = patchExampleChrome(rewriteCommonHtml(read(path), "../"));
    write(path, html);
  }

  write(join(siteDir, "_headers"), [
    "/*",
    "  X-Content-Type-Options: nosniff",
    "  Referrer-Policy: strict-origin-when-cross-origin",
    "",
    "/dist/*.css",
    "  Cache-Control: public, max-age=31536000, immutable",
    "",
  ].join("\n"));

  write(join(siteDir, "_redirects"), [
    "/components /docs.html 200",
    "/docs /docs.html 200",
    "",
  ].join("\n"));
}

buildCss();
buildSite();

console.log("Built q2w-mapcss dist/ and site/.");
