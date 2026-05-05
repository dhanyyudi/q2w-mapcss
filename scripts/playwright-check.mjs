import { spawn } from "node:child_process";
import { once } from "node:events";
import { chromium } from "@playwright/test";

const port = 4173;
const baseUrl = `http://127.0.0.1:${port}`;
const server = spawn(process.execPath, ["-e", `
  const http = require('node:http');
  const fs = require('node:fs');
  const path = require('node:path');
  const root = path.join(process.cwd(), 'site');
  const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml' };
  http.createServer((req, res) => {
    const url = new URL(req.url, 'http://127.0.0.1');
    let filePath = path.join(root, decodeURIComponent(url.pathname));
    if (url.pathname.endsWith('/')) filePath = path.join(filePath, 'index.html');
    if (!filePath.startsWith(root)) { res.writeHead(403); res.end('Forbidden'); return; }
    fs.readFile(filePath, (err, data) => {
      if (err) { res.writeHead(404); res.end('Not found'); return; }
      res.writeHead(200, { 'content-type': types[path.extname(filePath)] || 'application/octet-stream' });
      res.end(data);
    });
  }).listen(${port}, '127.0.0.1', () => console.log('ready'));
`], { stdio: ["ignore", "pipe", "pipe"] });

async function expectLandingRevealWorks(page, baseUrl) {
  await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" });

  const revealCount = await page.locator(".reveal").count();
  if (revealCount < 13) {
    throw new Error(`Landing page should expose at least 13 reveal elements; found ${revealCount}.`);
  }

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(700);

  const visibleCount = await page.locator(".reveal.is-visible").count();
  if (visibleCount < 8) {
    throw new Error(`Landing reveal should mark visible elements after scrolling; found ${visibleCount}.`);
  }

  const firstCardTransform = await page.locator(".ln-card").first().evaluate((el) => getComputedStyle(el).transitionDuration);
  if (firstCardTransform === "0s") {
    throw new Error("Landing card transitions should be enabled in normal motion mode.");
  }
}

async function expectPageContains(page, path, selectors) {
  await page.goto(`${baseUrl}${path}`, { waitUntil: "networkidle" });
  for (const selector of selectors) {
    const count = await page.locator(selector).count();
    if (count < 1) {
      throw new Error(`${path} should render selector ${selector}.`);
    }
  }
}

async function expectDocsFooterStyled(page, baseUrl) {
  await page.goto(`${baseUrl}/docs.html`, { waitUntil: "networkidle" });
  const footer = page.locator(".ln-footer");
  if ((await footer.count()) !== 1) {
    throw new Error("Docs overview must render one shared footer.");
  }
  const styles = await footer.evaluate((el) => {
    const computed = getComputedStyle(el);
    const grid = el.querySelector(".ln-footer__grid");
    const gridComputed = grid ? getComputedStyle(grid) : null;
    return {
      paddingTop: computed.paddingTop,
      borderTopStyle: computed.borderTopStyle,
      gridDisplay: gridComputed ? gridComputed.display : "",
      gridColumns: gridComputed ? gridComputed.gridTemplateColumns : "",
    };
  });
  if (styles.paddingTop === "0px" || styles.borderTopStyle === "none") {
    throw new Error("Docs overview footer must keep shared padding and border styles.");
  }
  if (styles.gridDisplay !== "grid" || !styles.gridColumns.includes("px")) {
    throw new Error("Docs overview footer grid styles are missing.");
  }
}

async function expectInteractiveDocs(page, baseUrl) {
  await page.goto(`${baseUrl}/docs/slider.html`, { waitUntil: "networkidle" });
  await page.locator("[data-doc-slider]").fill("42");
  if ((await page.locator("[data-doc-slider-value]").first().textContent())?.trim() !== "42%") {
    throw new Error("Slider docs preview must update the displayed value when dragged.");
  }

  await page.goto(`${baseUrl}/docs/share.html`, { waitUntil: "networkidle" });
  const shareBox = await page.locator(".q2w-share").boundingBox();
  if (!shareBox || shareBox.width < 340 || shareBox.height < 220) {
    throw new Error(`Share component must render as a complete share sheet; got ${JSON.stringify(shareBox)}.`);
  }
  await page.locator("[data-doc-share-copy]").click();
  if ((await page.locator("[data-doc-share-copy]").textContent())?.trim() !== "Copied") {
    throw new Error("Share docs preview must show copied feedback.");
  }

  await page.goto(`${baseUrl}/docs/draw.html`, { waitUntil: "networkidle" });
  await page.locator('[data-doc-draw-tool="Polygon"]').click();
  if (!((await page.locator('[data-doc-draw-tool="Polygon"]').getAttribute("class")) || "").includes("is-active")) {
    throw new Error("Draw docs preview must update active tool state.");
  }
  if (!((await page.locator("[data-doc-draw-status]").textContent()) || "").includes("Polygon tool active")) {
    throw new Error("Draw docs preview must update status text.");
  }

  await page.goto(`${baseUrl}/docs/filter.html`, { waitUntil: "networkidle" });
  const filterBox = await page.locator(".q2w-filter").boundingBox();
  if (!filterBox || filterBox.width < 300 || filterBox.height < 260) {
    throw new Error(`Filter component must render as a substantial panel; got ${JSON.stringify(filterBox)}.`);
  }
  await page.locator('[data-doc-filter-segment="2 high"]').click();
  if ((await page.locator("[data-doc-filter-count]").textContent())?.trim() !== "2 high") {
    throw new Error("Filter segment click must update summary count.");
  }

  await page.goto(`${baseUrl}/docs/basemap.html`, { waitUntil: "networkidle" });
  const basemapBox = await page.locator(".q2w-basemap-panel").boundingBox();
  if (!basemapBox || basemapBox.height > 260) {
    throw new Error(`Basemap selector must be compact; got height ${basemapBox?.height}.`);
  }
  await page.locator('[data-doc-basemap="Esri Terrain"]').click();
  if (!((await page.locator('[data-doc-basemap="Esri Terrain"]').getAttribute("class")) || "").includes("q2w-basemap--active")) {
    throw new Error("Basemap docs preview must update active basemap state.");
  }
  if (!((await page.locator("[data-doc-basemap-label]").textContent()) || "").includes("Esri Terrain")) {
    throw new Error("Basemap docs preview must update active basemap label.");
  }
}

async function expectRealExampleChrome(page, baseUrl) {
  await page.goto(`${baseUrl}/examples/categorized-real/`, { waitUntil: "networkidle" });
  await page.waitForSelector(".q2w-header");
  if ((await page.locator(".q2w-theme-toggle").count()) !== 1) {
    throw new Error("Real categorized example must include one q2w-theme-toggle button.");
  }
  if ((await page.locator('a[title="Kembali ke beranda"]').count()) !== 1) {
    throw new Error("Real categorized example must include a back-to-home button.");
  }
  if ((await page.locator(".sp-welcome").count()) !== 1) {
    throw new Error("Real categorized example must keep its welcome dialog.");
  }
  await page.locator(".q2w-theme-toggle").click();
  const theme = await page.evaluate(() => document.documentElement.dataset.theme);
  if (!["dark", "light"].includes(theme)) {
    throw new Error("Real categorized example theme toggle must set an explicit theme.");
  }
  await page.locator(".q2w-theme-toggle").click();
  if ((await page.evaluate(() => document.documentElement.dataset.theme)) !== "light") {
    throw new Error("Real categorized example theme toggle must be able to restore explicit light mode.");
  }

  await page.locator("#welcomeStart").click().catch(() => {});
  await page.locator(".leaflet-control-layers-toggle").click();
  await page.waitForSelector(".leaflet-control-layers-expanded");
  const layerMetrics = await page.locator(".leaflet-control-layers-expanded").evaluate((el) => {
    const list = el.querySelector(".leaflet-control-layers-list");
    const hiddenRootHeader = getComputedStyle(el.querySelector(".leaflet-layerstree-header.leaflet-layerstree-nevershow")).display;
    return {
      width: el.getBoundingClientRect().width,
      listWidth: list ? list.getBoundingClientRect().width : 0,
      scrollWidth: list ? list.scrollWidth : 0,
      hiddenRootHeader,
    };
  });
  if (layerMetrics.width > 360) {
    throw new Error(`Real categorized example layer control is too wide: ${layerMetrics.width}px.`);
  }
  if (layerMetrics.scrollWidth - layerMetrics.listWidth > 8) {
    throw new Error("Real categorized example layer control must not expose a large horizontal gutter/overflow.");
  }
  if (layerMetrics.hiddenRootHeader !== "none") {
    throw new Error("Real categorized example must hide the empty qgis2web layer-tree root header.");
  }
}

let browser;
try {
  await Promise.race([
    once(server.stdout, "data"),
    new Promise((_, reject) => setTimeout(() => reject(new Error("Timed out starting preview server")), 5000)),
  ]);

  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
  if (await page.locator(".ln-nav a", { hasText: "GitHub" }).count() !== 1) {
    throw new Error("Landing navbar must show exactly one GitHub link.");
  }
  await page.locator(".theme-toggle").first().click();
  if ((await page.evaluate(() => document.documentElement.dataset.theme)) !== "dark") {
    throw new Error("Landing theme toggle did not set data-theme=dark.");
  }
  await page.locator(".theme-toggle").first().click();
  if ((await page.evaluate(() => document.documentElement.dataset.theme)) !== "light") {
    throw new Error("Landing theme toggle did not switch back to explicit light mode.");
  }
  if ((await page.evaluate(() => localStorage.getItem("q2w-theme"))) !== "light") {
    throw new Error("Landing theme toggle did not persist q2w-theme=light.");
  }

  await expectLandingRevealWorks(page, baseUrl);

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  mobile.on("pageerror", (error) => errors.push(error.message));
  await mobile.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
  const mobileToggle = mobile.locator('.ln-nav .theme-toggle');
  if (!(await mobileToggle.isVisible())) {
    throw new Error("Landing mobile theme toggle must remain visible.");
  }
  await mobileToggle.click();
  if ((await mobile.evaluate(() => document.documentElement.dataset.theme)) !== "dark") {
    throw new Error("Landing mobile theme toggle did not set data-theme=dark.");
  }
  await mobileToggle.click();
  if ((await mobile.evaluate(() => document.documentElement.dataset.theme)) !== "light") {
    throw new Error("Landing mobile theme toggle did not switch back to explicit light mode.");
  }
  await mobile.close();

  await page.goto(`${baseUrl}/docs.html`, { waitUntil: "networkidle" });
  if ((await page.evaluate(() => document.documentElement.dataset.theme)) !== "light") {
    throw new Error("Docs overview did not restore persisted light theme.");
  }
  await page.locator('.cs-theme-dot[data-theme="forest"]').first().click();
  if ((await page.evaluate(() => document.documentElement.dataset.theme)) !== "forest") {
    throw new Error("Docs forest theme dot did not set data-theme=forest.");
  }
  if ((await page.evaluate(() => localStorage.getItem("q2w-theme"))) !== "forest") {
    throw new Error("Docs forest theme dot did not persist q2w-theme=forest.");
  }
  await page.locator(".theme-toggle").first().click();
  if ((await page.evaluate(() => document.documentElement.dataset.theme)) !== "dark") {
    throw new Error("Docs overview theme toggle did not switch from preset theme to dark.");
  }
  await page.locator(".theme-toggle").first().click();
  if ((await page.evaluate(() => document.documentElement.dataset.theme)) !== "light") {
    throw new Error("Docs overview theme toggle did not switch back to explicit light.");
  }

  await expectDocsFooterStyled(page, baseUrl);
  await expectInteractiveDocs(page, baseUrl);

  await page.goto(`${baseUrl}/docs/header.html`, { waitUntil: "networkidle" });
  if ((await page.evaluate(() => document.documentElement.dataset.theme)) !== "light") {
    throw new Error("Component docs did not restore persisted light theme.");
  }
  const brandBox = await page.locator(".doc-side__brand .doc-side__icon").boundingBox();
  if (!brandBox || brandBox.width < 20 || brandBox.height < 20) {
    throw new Error("Component docs brand icon is missing or unstyled.");
  }
  await page.locator(".theme-toggle").first().click();
  if ((await page.evaluate(() => document.documentElement.dataset.theme)) !== "dark") {
    throw new Error("Component docs theme toggle did not switch to dark.");
  }
  await page.locator(".theme-toggle").first().click();
  if ((await page.evaluate(() => document.documentElement.dataset.theme)) !== "light") {
    throw new Error("Component docs theme toggle did not switch back to explicit light.");
  }

  await expectPageContains(page, "/docs/header.html", [
    ".q2w-header--bar",
    ".q2w-header--minimal",
    ".q2w-header--expressive",
    ".q2w-header--technical",
    ".q2w-header--pill-left",
  ]);

  await expectPageContains(page, "/docs/popup.html", [
    ".q2w-popup__media",
    ".q2w-tabs",
    ".q2w-popup--minimal",
    ".q2w-popup--technical",
    ".q2w-popup--expressive",
    ".q2w-popup--striped",
    ".q2w-popup--governmental",
  ]);

  await expectPageContains(page, "/docs/button.html", [
    ".q2w-btn--primary",
    ".q2w-btn--ghost",
    ".q2w-btn--icon",
    ".q2w-btn--pill",
    ".q2w-btn--loading",
    ".q2w-btn--help",
  ]);

  await expectPageContains(page, "/docs/layer.html", [
    ".q2w-panel__section",
    ".q2w-panel__section-title",
    ".q2w-panel__header--collapsible",
    ".is-collapsed",
  ]);

  await page.goto(`${baseUrl}/docs/modal.html`, { waitUntil: "networkidle" });
  await page.locator('[data-q2w-modal="docs-modal-demo"]').click();
  const modalHiddenAfterOpen = await page.locator("#docs-modal-demo").getAttribute("aria-hidden");
  if (modalHiddenAfterOpen !== "false") {
    throw new Error("Modal docs demo should open the modal.");
  }
  await page.locator("#docs-modal-demo [data-q2w-close]").first().click();
  const modalHiddenAfterClose = await page.locator("#docs-modal-demo").getAttribute("aria-hidden");
  if (modalHiddenAfterClose !== "true") {
    throw new Error("Modal docs demo should close the modal.");
  }

  await page.goto(`${baseUrl}/docs/toast.html`, { waitUntil: "networkidle" });
  await page.locator("[data-doc-toast]").first().click();
  if (await page.locator(".q2w-toast").count() < 1) {
    throw new Error("Toast docs demo should create a toast.");
  }

  await page.goto(`${baseUrl}/docs/popup.html`, { waitUntil: "networkidle" });
  await page.locator('[data-q2w-tab="history"]').click();
  const historyPanelDisplay = await page.locator('[data-q2w-panel="history"]').evaluate((el) => getComputedStyle(el).display);
  const attributesPanelDisplay = await page.locator('[data-q2w-panel="attributes"]').evaluate((el) => getComputedStyle(el).display);
  if (historyPanelDisplay === "none" || attributesPanelDisplay !== "none") {
    throw new Error("Popup docs tabs should switch rendered panels.");
  }

  await expectRealExampleChrome(page, baseUrl);

  await page.goto(`${baseUrl}/examples/choropleth.html`, { waitUntil: "networkidle" });
  if ((await page.evaluate(() => document.documentElement.dataset.theme)) !== "light") {
    throw new Error("Example page did not restore persisted light theme.");
  }
  await page.locator(".theme-toggle").first().click();
  if ((await page.evaluate(() => document.documentElement.dataset.theme)) !== "dark") {
    throw new Error("Example theme toggle did not switch to dark.");
  }
  await page.locator(".theme-toggle").first().click();
  if ((await page.evaluate(() => document.documentElement.dataset.theme)) !== "light") {
    throw new Error("Example theme toggle did not switch back to explicit light.");
  }

  if (errors.length) {
    throw new Error(`Browser page errors:\n${errors.join("\n")}`);
  }
  console.log("q2w-mapcss Playwright check passed.");
} finally {
  if (browser) await browser.close();
  server.kill();
}
