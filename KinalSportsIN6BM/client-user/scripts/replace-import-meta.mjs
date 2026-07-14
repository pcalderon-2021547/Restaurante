import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { fileURLToPath, join } from "path";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const dir = join(__dirname, "..", "dist");

function walk(d) {
  for (const entry of readdirSync(d)) {
    const p = join(d, entry);
    if (statSync(p).isDirectory()) {
      walk(p);
    } else if (p.endsWith(".js")) {
      const content = readFileSync(p, "utf8");
      const updated = content.replace(/import\.meta\.env/g, "({})");
      if (updated !== content) {
        writeFileSync(p, updated);
      }
    }
  }
}

walk(dir);
