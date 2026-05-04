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
