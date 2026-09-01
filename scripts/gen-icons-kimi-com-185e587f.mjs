// Generates src/components/sites/kimi-com-185e587f/root-8a5edab2/icons.tsx
// from the SVGs extracted from kimi.com (public/sites/kimi-com-185e587f/root-8a5edab2/icons/).
//
// Usage: node scripts/gen-icons-kimi-com-185e587f.mjs
//
// Per docs/research/kimi-com-185e587f/root-8a5edab2/components/icons.md:
// - icon-explore-light.svg and icon-recommend-light.svg are EXCLUDED (they are
//   next/image assets used by ExploreButton, not registry icons).
// - The eight icons for products Fennic AI does not ship (Claw, Code, Work,
//   Docs, Swarm, Slides, Scheduled Tasks) are EXCLUDED too. Their source SVGs
//   stay on disk as extraction provenance; they just leave the registry.
// - On the ROOT <svg> tag only: strip width/height/class/data-*/style and inject
//   style="width:100%;height:100%;display:block". Everything inside the tag
//   (embedded <style> keyframes with #id selectors, SMIL animations) survives verbatim.
// - The one exception to "verbatim": idle-layer paths that Kimi's Vue runtime used
//   to position at render time get a static resting transform written into their
//   CSS rule. See placeIdleLayer() — without it four icons render as bare frames.
// - not-login.svg is the only icon with hardcoded paint instead of currentColor;
//   tokenizePaint() re-expresses it so the avatar survives the dark palette.

import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const ICON_DIR = path.join(here, "..", "public", "sites", "kimi-com-185e587f", "root-8a5edab2", "icons");
const OUT_FILE = path.join(
  here,
  "..",
  "src",
  "components",
  "sites",
  "kimi-com-185e587f",
  "root-8a5edab2",
  "icons.tsx",
);

const EXCLUDE = new Set([
  "icon-explore-light.svg",
  "icon-recommend-light.svg",
  "claw-more.svg",
  "docs.svg",
  "kimi-claw.svg",
  "kimi-code.svg",
  "kimi-work.svg",
  "scheduled-tasks.svg",
  "slides.svg",
  "swarm.svg",
]);
const STRIP_ATTRS = new Set(["width", "height", "class", "style"]);

/**
 * Kimi's animated icons ship two sibling layers. The `enter` layer's CSS
 * keyframes carry the transform that positions each path; the `idle` layer's
 * rules set only `transform-box`/`transform-origin` and leave the transform
 * itself to the site's Vue animation runtime, which we do not have. Every path
 * in these files is authored around the origin, so an idle path with no
 * transform lands outside the 24×24 viewBox and is clipped away entirely.
 *
 * Recover the resting pose from the matching enter keyframe's last stop — the
 * enter animation is `fill-mode: forwards`, so its 100% *is* the idle pose — and
 * write it into the idle rule. It has to go in the CSS rather than a `transform`
 * attribute because the values are percentages, which SVG attributes cannot
 * express; they resolve against `transform-box: view-box`.
 *
 * Affects deep-research, hide-sidebar, sheets and websites. Without this the
 * microscope body, the sidebar's inner panel and the browser/spreadsheet chrome
 * are all missing and the icons render as bare frames.
 */
function cssRule(svg, id) {
  const at = svg.indexOf(`#${id}{`);
  if (at < 0) return null;
  const end = svg.indexOf("}", at);
  if (end < 0) return null;
  return { text: svg.slice(at, end + 1), body: svg.slice(at + id.length + 2, end) };
}

/** The transform at the highest-percentage stop of a keyframes block. */
function restingTransform(svg, keyframes) {
  const at = svg.indexOf(`@keyframes ${keyframes}{`);
  if (at < 0) return null;
  let i = svg.indexOf("{", at);
  const open = i;
  for (let depth = 0; i < svg.length; i += 1) {
    if (svg[i] === "{") depth += 1;
    else if (svg[i] === "}" && --depth === 0) break;
  }
  let best = null;
  for (const stop of svg.slice(open + 1, i).matchAll(/([\d.]+)%\s*\{([^}]*)\}/g)) {
    const value = /transform\s*:\s*([^;}]+)/.exec(stop[2])?.[1].trim();
    if (!value) continue;
    const pct = Number(stop[1]);
    if (!best || pct >= best.pct) best = { pct, value };
  }
  return best?.value ?? null;
}

function placeIdleLayer(svg, file) {
  const idle = /<g\b[^>]*data-animation-icon-layer="idle"[^>]*>([\s\S]*?)<\/g>/.exec(svg);
  if (!idle) return { svg, placed: 0 };
  let out = svg;
  let placed = 0;
  for (const node of idle[1].matchAll(/<(?:path|circle|rect|line|ellipse|polyline)\b([^>]*)>/g)) {
    const attrs = node[1];
    if (/\stransform\s*=/.test(attrs)) continue; // already placed by an attribute
    const id = /\bid="([^"]+)"/.exec(attrs)?.[1];
    if (!id || !id.includes("-idle-")) continue;
    const rule = cssRule(out, id);
    if (!rule || /transform\s*:/.test(rule.body)) continue; // nothing to recover
    if (!/-\d/.test(/\sd="([^"]*)"/.exec(attrs)?.[1] ?? "")) continue; // already in-frame
    const rest = restingTransform(out, id.replace("-idle-", "-enter-"));
    if (!rest)
      throw new Error(`${file}: ${id} is unplaced and has no enter keyframe to recover from`);
    out = out.replace(rule.text, `#${id}{${rule.body.replace(/;$/, "")};transform:${rest}}`);
    placed += 1;
  }
  return { svg: out, placed };
}

/**
 * `not-login.svg` is the one registry icon Kimi authored with hardcoded paint
 * rather than `currentColor`: a 5% black disc, a 15% black head-and-shoulders
 * silhouette, and two eyes knocked out in a near-white. Every other icon in the
 * set already inherits, so this is a one-file exception, not a general pass.
 *
 * On our dark ground the two black layers are black-on-black and vanish, leaving
 * only the near-white eyes — the avatar reads as two dots floating on nothing.
 * Re-express all three against the token system: the disc and silhouette follow
 * `currentColor` at their original alphas, and the knocked-out eyes follow
 * `--fennic-ground`, which is what the sidebar footer (the icon's only consumer,
 * Sidebar.tsx) actually paints behind them. Light mode is unchanged to the eye —
 * 5% charcoal reads the same as 5% black, and #F7F5F3 the same as #EEEDEB.
 *
 * Pinning an icon to a ground token invites the question "what about hover?" —
 * the footer button washes to `--fennic-hover` under the cursor. It is safe: the
 * knocked-out strokes are drawn inside the head silhouette, never over bare
 * ground, so the wash never abuts them. In dark mode the eyes go dark-on-light
 * rather than light-on-dark, which is simply what a knockout does when its
 * ground inverts.
 */
const TOKENIZE_PAINT = [
  [/fill="rgba\(0, 0, 0, 0\.051\)"/g, 'fill="currentColor" fill-opacity="0.051"'],
  [/fill="rgba\(0, 0, 0, 0\.149\)"/g, 'fill="currentColor" fill-opacity="0.149"'],
  [/stroke="rgba\(238, 237, 235, 0\.902\)"/g, 'stroke="var(--fennic-ground)"'],
];

function tokenizePaint(svg) {
  let out = svg;
  let swapped = 0;
  for (const [pattern, replacement] of TOKENIZE_PAINT) {
    out = out.replace(pattern, () => {
      swapped += 1;
      return replacement;
    });
  }
  return { svg: out, swapped };
}

/** Transform the root <svg> tag only; leave the tag's children untouched. */
function transformRootTag(svg) {
  const match = svg.match(/<svg\b[^>]*>/);
  if (!match) throw new Error("missing <svg> root tag");
  const tag = match[0];
  const attrRe = /([:A-Za-z_][-\w:.]*)(\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'>]+))?/g;
  const kept = [];
  for (const attr of tag.matchAll(attrRe)) {
    const name = attr[1];
    if (name === "svg") continue; // the tag name itself matches the attr regex
    if (STRIP_ATTRS.has(name.toLowerCase())) continue;
    if (/^data-/i.test(name)) continue;
    kept.push(attr[0].trim());
  }
  const rebuilt = `<svg ${kept.join(" ")} style="width:100%;height:100%;display:block">`;
  return svg.replace(tag, rebuilt);
}

const files = (await readdir(ICON_DIR))
  .filter((f) => f.endsWith(".svg") && !EXCLUDE.has(f))
  .sort();

if (files.length !== 18) {
  throw new Error(`expected 18 registry icons, found ${files.length}: ${files.join(", ")}`);
}

const names = files.map((f) => f.replace(/\.svg$/, ""));
const entries = [];
let totalPlaced = 0;
let totalSwapped = 0;
for (const file of files) {
  const raw = await readFile(path.join(ICON_DIR, file), "utf8");
  const { svg, placed } = placeIdleLayer(raw.trim(), file);
  if (placed > 0) {
    totalPlaced += placed;
    console.log(`  ${file}: placed ${placed} idle path${placed === 1 ? "" : "s"} from its enter keyframes`);
  }
  const { svg: painted, swapped } = tokenizePaint(svg);
  if (swapped > 0) {
    totalSwapped += swapped;
    console.log(`  ${file}: tokenized ${swapped} hardcoded paint value${swapped === 1 ? "" : "s"}`);
  }
  const transformed = transformRootTag(painted);
  if (!transformed.startsWith("<svg") || !transformed.endsWith("</svg>")) {
    throw new Error(`${file}: unexpected SVG shape after transform`);
  }
  entries.push(`  "${file.replace(/\.svg$/, "")}": ${JSON.stringify(transformed)},`);
}

// not-login.svg is the only icon carrying hardcoded paint, and it carries each
// of its five paths twice (once per animation layer): 2 discs, 4 head/shoulder
// fills, 4 eye strokes. Assert the total so a re-scrape that reformats the
// attributes fails here rather than silently shipping a black-on-black avatar.
if (totalSwapped !== 10) {
  throw new Error(
    `expected 10 hardcoded paint values to tokenize, swapped ${totalSwapped} — did not-login.svg change?`,
  );
}

const source = `// AUTO-GENERATED by scripts/gen-icons-kimi-com-185e587f.mjs — DO NOT EDIT BY HAND.
// The SVG markup below is static content extracted from the live kimi.com site
// (public/sites/kimi-com-185e587f/root-8a5edab2/icons/), which is why
// dangerouslySetInnerHTML is acceptable here. Re-run the script to regenerate.
// Embedded <style> keyframes and SMIL animations are preserved verbatim and the
// SVGs use currentColor, so callers control color via text-* utilities.

import type { JSX } from "react";

export type KimiIconName =
${names.map((n) => `  | "${n}"`).join("\n")};

const SOURCES: Record<KimiIconName, string> = {
${entries.join("\n")}
};

export function KimiIcon({
  name,
  size = 18,
  className,
}: {
  name: KimiIconName;
  size?: number;
  className?: string;
}): JSX.Element {
  return (
    <span
      className={className}
      style={{
        width: size,
        height: size,
        display: "inline-flex",
        flexShrink: 0,
        lineHeight: 0,
      }}
      dangerouslySetInnerHTML={{ __html: SOURCES[name] }}
    />
  );
}

// The Kimi logo is NOT an inline SVG — it is
// public/sites/kimi-com-185e587f/root-8a5edab2/brand/kimi-logo.png (124×124 PNG
// displayed at 28px). Consumers use next/image directly; no registry entry.
`;

await writeFile(OUT_FILE, source, "utf8");
console.log(
  `wrote ${OUT_FILE} (${names.length} icons, ${totalPlaced} idle paths placed, ${totalSwapped} paint values tokenized)`,
);
