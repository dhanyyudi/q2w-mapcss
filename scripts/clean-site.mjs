import { rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

rmSync(join(root, "site"), { recursive: true, force: true });
console.log("Cleaned q2w-mapcss site/.");
