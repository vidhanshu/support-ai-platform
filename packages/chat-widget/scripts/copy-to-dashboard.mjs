import {
  copyFileSync,
  mkdirSync,
  existsSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const widgetJs = resolve(root, "dist/widget.js");
const demoSrc = resolve(root, "demo/index.html");
const demoDest = resolve(root, "dist/index.html");
const dashboardDest = resolve(
  root,
  "../../apps/dashboard/public/embed/widget.js",
);

if (!existsSync(widgetJs)) {
  console.error("Missing dist/widget.js — vite build may have failed.");
  process.exit(1);
}

mkdirSync(dirname(dashboardDest), { recursive: true });
copyFileSync(widgetJs, dashboardDest);
console.log(`Copied widget → ${dashboardDest}`);

// vite preview serves `dist/` — put the demo page there as index.html
let html = readFileSync(demoSrc, "utf8");
html = html.replace(/src="\.\/widget\.js"/, 'src="./widget.js"');
writeFileSync(demoDest, html);
console.log(`Copied demo → ${demoDest}`);
