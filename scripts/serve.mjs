import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { createServer } from "node:http";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "site");
const port = Number(process.env.PORT || 4173);
const host = "127.0.0.1";

const types = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};

function resolvePath(url) {
  const clean = decodeURIComponent(url.split("?")[0]);
  const safe = normalize(clean).replace(/^(\.\.[/\\])+/, "");
  let path = join(root, safe);
  if (!existsSync(path)) {
    return null;
  }
  if (statSync(path).isDirectory()) {
    path = join(path, "index.html");
  }
  return path;
}

createServer((req, res) => {
  const path = resolvePath(req.url === "/" ? "/index.html" : req.url);
  if (!path || !existsSync(path)) {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end("Not found");
    return;
  }
  res.writeHead(200, { "content-type": types[extname(path)] || "application/octet-stream" });
  createReadStream(path).pipe(res);
}).listen(port, host, () => {
  console.log(`q2w-mapcss preview: http://${host}:${port}`);
});
