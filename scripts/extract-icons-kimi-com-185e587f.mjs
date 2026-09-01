// Converts svg-inventory.json (serialized inline SVGs from the live kimi.com
// home page) into individual .svg asset files, deduplicated.
// Usage: node scripts/extract-icons-kimi-com-185e587f.mjs
import { writeFile, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";

const INV = "docs/research/kimi-com-185e587f/root-8a5edab2/svg-inventory.json";
const OUT = "public/sites/kimi-com-185e587f/root-8a5edab2/icons";

// Names keyed by DOM order index of document.querySelectorAll('svg') on the
// home page. Indices 25-31 (pill duplicates) and 33 (explore-chevron dup) are
// intentionally unnamed; they dedupe against earlier entries or are unused.
const NAMED = {
  0: "hide-sidebar", // 20x20 LeftBar (sidebar header)
  1: "new-chat", // 18x18
  2: "my-kimi",
  3: "plugins",
  4: "scheduled-tasks",
  5: "slides",
  6: "swarm", // large animated icon (~227KB)
  7: "deep-research",
  8: "collapse", // 20x20 More
  9: "collapse-chevron", // 18x18 chevron shown when nav expanded
  10: "docs",
  11: "websites",
  12: "sheets",
  13: "design",
  14: "kimi-work", // large animated icon (~132KB)
  15: "kimi-code",
  16: "kimi-claw",
  17: "claw-more", // 15x15
  18: "projects-chevron", // 14x14
  19: "new-project",
  20: "not-login", // 28x28 (Chats login prompt icon)
  21: "get-app", // 18x18
  22: "attach", // 18x18 composer toolkit trigger
  23: "model-chevron", // 16x16
  24: "send-arrow", // 28x28
  32: "explore-chevron", // 16x16 double-chevron
};

const inventory = JSON.parse(await (await import("node:fs/promises")).readFile(INV, "utf8"));

const seen = new Set();
let written = 0;
for (const [index, name] of Object.entries(NAMED)) {
  const entry = inventory[Number(index)];
  if (!entry) throw new Error(`svg-inventory.json has no index ${index} (${name})`);
  const { html } = entry;
  const hash = createHash("sha256").update(html).digest("hex").slice(0, 12);
  if (seen.has(hash)) {
    console.log(`dup ${name} (same content as an earlier icon) — skipped`);
    continue;
  }
  seen.add(hash);
  await mkdir(OUT, { recursive: true });
  await writeFile(path.join(OUT, `${name}.svg`), html);
  console.log(`ok  ${name}.svg  ${html.length}b`);
  written++;
}

console.log(`DONE ${written} unique icons`);
