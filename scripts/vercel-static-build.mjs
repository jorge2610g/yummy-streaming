import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";

const out = "dist";
const excluded = new Set([
  ".git",
  ".github",
  ".gitignore",
  ".staging-deploy",
  "_config.yml",
  "CNAME",
  "DOCUMENTACION.md",
  "DOCUMENTACION_TECNICA.md",
  "README.md",
  "STREAMING_BASE.md",
  "docs",
  "node_modules",
  "package.json",
  "package-lock.json",
  "playwright.config.js",
  "scripts",
  "supabase",
  "tests",
  "vercel.json",
  out
]);

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

for (const entry of readdirSync(".")) {
  if (excluded.has(entry)) continue;
  if (!existsSync(entry)) continue;
  cpSync(entry, join(out, entry), { recursive: true });
}

console.log("Static staging build ready in dist/");
