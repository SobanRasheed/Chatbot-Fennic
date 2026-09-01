// Builds the Fennic brand assets that replace Kimi's, from the sources in
// `src/UI Components/`:
//
//   brand/fennic-mark.png — sidebar app-icon tile: the fox on its own black
//     ground, square-cropped like Kimi's dark "K" tile.
//   brand/fennic-text.png — hero wordmark: the supplied art re-inked to the
//     doodle's tone and trimmed to its ink box, sized so its ink matches
//     "KIMI" exactly.
//
// `Fennic Text.png` is the clean master: cream letterforms plus an orange dot on
// transparency, no ground and no grain. The `Fennic Text.svg` beside it is only
// a colour-quantised auto-trace of that PNG — 2920 paths, most of them speckle,
// and the grain it punched into the letterforms showed at render size — so the
// bitmap is what ships.
//
// Also writes a flat preview PNG under docs/design-references so the output can
// be eyeballed without a browser.
//
// Zero dependencies: a minimal PNG decoder/encoder built on node:zlib, because
// this project has no `sharp`/`jimp`. The decoder handles 8-bit
// greyscale/RGB/palette/alpha.
//
// Usage: node scripts/brand-fennic-assets.mjs

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { inflateSync, deflateSync } from "node:zlib";
import { dirname, resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const SRC = resolve(ROOT, "src/UI Components");
const BRAND = "public/sites/kimi-com-185e587f/root-8a5edab2/brand";
const REFS = "docs/design-references/kimi-com-185e587f/root-8a5edab2";

// Ship the wordmark at 4× its CSS size so it stays crisp on hi-DPI screens.
const WORDMARK_SCALE = 4;

// ---------------------------------------------------------------- CRC32 ----
const CRC_TABLE = new Int32Array(256);
for (let n = 0; n < 256; n += 1) {
  let c = n;
  for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  CRC_TABLE[n] = c;
}
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i += 1) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

// --------------------------------------------------------------- decode ----
const CHANNELS = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 };

function decodePng(buf) {
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error("not a PNG");
  let pos = 8;
  let ihdr = null;
  let palette = null;
  let trns = null;
  const idat = [];

  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString("ascii", pos + 4, pos + 8);
    const data = buf.subarray(pos + 8, pos + 8 + len);
    if (type === "IHDR") {
      ihdr = {
        width: data.readUInt32BE(0),
        height: data.readUInt32BE(4),
        bitDepth: data[8],
        colorType: data[9],
        interlace: data[12],
      };
    } else if (type === "PLTE") palette = Buffer.from(data);
    else if (type === "tRNS") trns = Buffer.from(data);
    else if (type === "IDAT") idat.push(Buffer.from(data));
    else if (type === "IEND") break;
    pos += 12 + len;
  }

  if (!ihdr) throw new Error("no IHDR");
  if (ihdr.bitDepth !== 8) throw new Error(`unsupported bit depth ${ihdr.bitDepth}`);
  if (ihdr.interlace !== 0) throw new Error("interlaced PNG unsupported");

  const { width, height, colorType } = ihdr;
  const ch = CHANNELS[colorType];
  if (!ch) throw new Error(`unsupported color type ${colorType}`);

  const raw = inflateSync(Buffer.concat(idat));
  const stride = width * ch;
  const out = Buffer.alloc(height * stride);

  // Reverse the per-scanline filters (PNG spec 9.2).
  for (let y = 0; y < height; y += 1) {
    const filter = raw[y * (stride + 1)];
    const src = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    const cur = out.subarray(y * stride, (y + 1) * stride);
    const prev = y > 0 ? out.subarray((y - 1) * stride, y * stride) : null;
    for (let i = 0; i < stride; i += 1) {
      const a = i >= ch ? cur[i - ch] : 0;
      const b = prev ? prev[i] : 0;
      const c = prev && i >= ch ? prev[i - ch] : 0;
      let v = src[i];
      if (filter === 1) v += a;
      else if (filter === 2) v += b;
      else if (filter === 3) v += (a + b) >> 1;
      else if (filter === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a);
        const pb = Math.abs(p - b);
        const pc = Math.abs(p - c);
        v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      }
      cur[i] = v & 0xff;
    }
  }

  // Normalise every colour type to straight RGBA.
  const rgba = Buffer.alloc(width * height * 4);
  for (let i = 0, px = 0; px < width * height; px += 1) {
    const s = px * ch;
    let r;
    let g;
    let b;
    let a = 255;
    if (colorType === 0) {
      r = g = b = out[s];
      if (trns && trns.length >= 2 && out[s] === trns.readUInt16BE(0)) a = 0;
    } else if (colorType === 4) {
      r = g = b = out[s];
      a = out[s + 1];
    } else if (colorType === 2) {
      [r, g, b] = [out[s], out[s + 1], out[s + 2]];
    } else if (colorType === 6) {
      [r, g, b, a] = [out[s], out[s + 1], out[s + 2], out[s + 3]];
    } else {
      const idx = out[s];
      r = palette[idx * 3];
      g = palette[idx * 3 + 1];
      b = palette[idx * 3 + 2];
      if (trns && idx < trns.length) a = trns[idx];
    }
    rgba[i++] = r;
    rgba[i++] = g;
    rgba[i++] = b;
    rgba[i++] = a;
  }
  return { width, height, data: rgba };
}

// --------------------------------------------------------------- encode ----
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function encodePng({ width, height, data }) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  const stride = width * 4;
  const raw = Buffer.alloc(height * (stride + 1));
  for (let y = 0; y < height; y += 1) {
    raw[y * (stride + 1)] = 0; // filter: none
    data.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// ----------------------------------------------------------------- utils ----
/**
 * Ink bounds = pixels that are neither transparent nor near-white, so the box
 * is correct whether the source has an alpha channel or a white matte.
 */
function inkBounds(img, { alphaMin = 12, whiteMax = 245 } = {}) {
  let minX = img.width;
  let minY = img.height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < img.height; y += 1) {
    for (let x = 0; x < img.width; x += 1) {
      const i = (y * img.width + x) * 4;
      const a = img.data[i + 3];
      if (a < alphaMin) continue;
      const [r, g, b] = [img.data[i], img.data[i + 1], img.data[i + 2]];
      if (r > whiteMax && g > whiteMax && b > whiteMax) continue;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
  if (maxX < 0) throw new Error("image is entirely blank");
  return { x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

function crop(img, box) {
  const data = Buffer.alloc(box.width * box.height * 4);
  for (let y = 0; y < box.height; y += 1) {
    const from = ((box.y + y) * img.width + box.x) * 4;
    img.data.copy(data, y * box.width * 4, from, from + box.width * 4);
  }
  return { width: box.width, height: box.height, data };
}

/** Box-filter downscale (area average) — clean edges for large reductions. */
function resize(img, w, h) {
  const data = Buffer.alloc(w * h * 4);
  const sx = img.width / w;
  const sy = img.height / h;
  for (let y = 0; y < h; y += 1) {
    const y0 = Math.floor(y * sy);
    const y1 = Math.max(y0 + 1, Math.min(img.height, Math.ceil((y + 1) * sy)));
    for (let x = 0; x < w; x += 1) {
      const x0 = Math.floor(x * sx);
      const x1 = Math.max(x0 + 1, Math.min(img.width, Math.ceil((x + 1) * sx)));
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      let n = 0;
      for (let yy = y0; yy < y1; yy += 1) {
        for (let xx = x0; xx < x1; xx += 1) {
          const i = (yy * img.width + xx) * 4;
          const al = img.data[i + 3] / 255;
          r += img.data[i] * al; // premultiply so transparent pixels
          g += img.data[i + 1] * al; // don't bleed dark fringes
          b += img.data[i + 2] * al;
          a += al;
          n += 1;
        }
      }
      const o = (y * w + x) * 4;
      if (a > 0) {
        data[o] = Math.round(r / a);
        data[o + 1] = Math.round(g / a);
        data[o + 2] = Math.round(b / a);
      }
      data[o + 3] = Math.round((a / n) * 255);
    }
  }
  return { width: w, height: h, data };
}

/** Mean colour of an image's darkest ink — a glyph's solid tone. */
function inkColor(img, { lumaMax = 110 } = {}) {
  let r = 0;
  let g = 0;
  let b = 0;
  let n = 0;
  for (let i = 0; i < img.width * img.height; i += 1) {
    const o = i * 4;
    if (img.data[o + 3] < 200) continue;
    const luma = 0.299 * img.data[o] + 0.587 * img.data[o + 1] + 0.114 * img.data[o + 2];
    if (luma > lumaMax) continue;
    r += img.data[o];
    g += img.data[o + 1];
    b += img.data[o + 2];
    n += 1;
  }
  if (!n) throw new Error("no ink pixels");
  return [Math.round(r / n), Math.round(g / n), Math.round(b / n)];
}

/**
 * Repaint the wordmark's letterforms in `ink`, leaving the orange dot alone.
 * The supplied art is cream (#FBEAD8), which is invisible on Kimi's near-white
 * panel. Only RGB changes — alpha carries the letterform, so the antialiasing
 * survives untouched. Orange separates from cream by red-minus-green: ~135 on
 * the dot (#DF582D), ~17 on the letters.
 */
function reink(img, ink, { dotMinRedGreen = 60 } = {}) {
  const data = Buffer.from(img.data);
  let letters = 0;
  let dot = 0;
  for (let i = 0; i < img.width * img.height; i += 1) {
    const o = i * 4;
    if (data[o + 3] === 0) continue;
    if (data[o] - data[o + 1] > dotMinRedGreen) {
      dot += 1;
      continue;
    }
    data[o] = ink[0];
    data[o + 1] = ink[1];
    data[o + 2] = ink[2];
    letters += 1;
  }
  return { width: img.width, height: img.height, data, letters, dot };
}

/** Paste `src` over `dst` at (dx, dy), source alpha compositing. */
function blit(dst, src, dx, dy) {
  for (let y = 0; y < src.height; y += 1) {
    const ty = dy + y;
    if (ty < 0 || ty >= dst.height) continue;
    for (let x = 0; x < src.width; x += 1) {
      const tx = dx + x;
      if (tx < 0 || tx >= dst.width) continue;
      const s = (y * src.width + x) * 4;
      const d = (ty * dst.width + tx) * 4;
      const a = src.data[s + 3] / 255;
      if (a <= 0) continue;
      for (let c = 0; c < 3; c += 1) {
        dst.data[d + c] = Math.round(dst.data[d + c] * (1 - a) + src.data[s + c] * a);
      }
      dst.data[d + 3] = Math.max(dst.data[d + 3], src.data[s + 3]);
    }
  }
}

/** A solid opaque canvas. */
function canvas(width, height, [r, g, b] = [255, 255, 255]) {
  const data = Buffer.alloc(width * height * 4);
  for (let i = 0; i < width * height; i += 1) {
    data[i * 4] = r;
    data[i * 4 + 1] = g;
    data[i * 4 + 2] = b;
    data[i * 4 + 3] = 255;
  }
  return { width, height, data };
}

function write(relPath, buf) {
  const full = resolve(ROOT, relPath);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, buf);
  console.log(`  wrote ${relPath} (${buf.length.toLocaleString()} bytes)`);
}

// ------------------------------------------------------------ art bounds ----
/**
 * Bounds of the bright art on a dark canvas, ignoring isolated speckle: a row
 * or column only counts once at least `minFrac` of it is lit.
 */
function brightBounds(img, { lumaMin = 60, minFrac = 0.012 } = {}) {
  const rows = new Int32Array(img.height);
  const cols = new Int32Array(img.width);
  for (let y = 0; y < img.height; y += 1) {
    for (let x = 0; x < img.width; x += 1) {
      const o = (y * img.width + x) * 4;
      if (img.data[o + 3] < 128) continue;
      const luma = 0.299 * img.data[o] + 0.587 * img.data[o + 1] + 0.114 * img.data[o + 2];
      if (luma < lumaMin) continue;
      rows[y] += 1;
      cols[x] += 1;
    }
  }
  const span = (counts, extent) => {
    const need = Math.max(2, Math.round(extent * minFrac));
    let lo = 0;
    let hi = counts.length - 1;
    while (lo < hi && counts[lo] < need) lo += 1;
    while (hi > lo && counts[hi] < need) hi -= 1;
    return [lo, hi];
  };
  const [y0, y1] = span(rows, img.width);
  const [x0, x1] = span(cols, img.height);
  return { x: x0, y: y0, width: x1 - x0 + 1, height: y1 - y0 + 1 };
}

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

// ------------------------------------------------------------------ main ----
// 1. Reference: how large is "KIMI" inside the original doodle, and what tone
//    is its ink? The doodle renders in a 400×82 box on desktop.
const doodle = decodePng(readFileSync(resolve(ROOT, BRAND, "kimi-doodle.png")));
const doodleInk = inkBounds(doodle);
const DOODLE_BOX = { w: 400, h: 82 };
const MOBILE = 337 / 400; // the doodle's own desktop→mobile shrink
const doodleScale = DOODLE_BOX.w / doodle.width;
const KIMI = {
  w: doodleInk.width * doodleScale,
  h: doodleInk.height * doodleScale,
};
const INK = inkColor(crop(doodle, doodleInk));
const INK_HEX = `#${INK.map((c) => c.toString(16).padStart(2, "0")).join("")}`;
console.log(`kimi-doodle.png  ${doodle.width}x${doodle.height}  ink ${doodleInk.width}x${doodleInk.height} @${doodleInk.x},${doodleInk.y}`);
console.log(`  → "KIMI" renders ${KIMI.w.toFixed(1)}x${KIMI.h.toFixed(1)} CSS px in ink ${INK_HEX}`);

// 2. Wordmark: re-ink the supplied art to the doodle's tone, re-frame it on its
//    ink box, and scale so the ink height equals "KIMI"'s.
const art = decodePng(readFileSync(resolve(SRC, "Fennic Text.png")));
const artInk = inkBounds(art);
const word = reink(crop(art, artInk), INK);
const aspect = word.width / word.height;
const desktop = { h: Math.round(KIMI.h), w: Math.round(KIMI.h * aspect) };
const mobile = {
  h: Math.round(KIMI.h * MOBILE),
  w: Math.round(KIMI.h * MOBILE * aspect),
};
const wordmark = resize(word, desktop.w * WORDMARK_SCALE, desktop.h * WORDMARK_SCALE);
write(`${BRAND}/fennic-text.png`, encodePng(wordmark));
console.log(`Fennic Text.png  ${art.width}x${art.height}  ink ${artInk.width}x${artInk.height} @${artInk.x},${artInk.y}  aspect ${aspect.toFixed(4)}`);
console.log(`  ${word.letters.toLocaleString()} letterform px re-inked ${INK_HEX}, ${word.dot.toLocaleString()} dot px left orange`);
console.log(`  → wordmark renders ${desktop.w}x${desktop.h} CSS px, shipped ${WORDMARK_SCALE}× at ${wordmark.width}x${wordmark.height}`);

// 3. Sidebar mark: Kimi's own logo is a dark rounded tile, so the fox keeps its
//    black ground — crop a square around it that leaves the fox covering about
//    as much of the tile as Kimi's "K" does. CSS rounds the corners.
const FOX_COVERAGE = 0.72;
const icon = decodePng(readFileSync(resolve(SRC, "fennic ai icon.png")));
const foxInk = brightBounds(icon);
const side = Math.min(
  Math.round(Math.max(foxInk.width, foxInk.height) / FOX_COVERAGE),
  Math.min(icon.width, icon.height),
);
const tile = crop(icon, {
  x: clamp(Math.round(foxInk.x + foxInk.width / 2 - side / 2), 0, icon.width - side),
  y: clamp(Math.round(foxInk.y + foxInk.height / 2 - side / 2), 0, icon.height - side),
  width: side,
  height: side,
});
const mark = resize(tile, 112, 112); // 28px × 4
write(`${BRAND}/fennic-mark.png`, encodePng(mark));
console.log(`fennic ai icon.png  ${icon.width}x${icon.height}  fox ${foxInk.width}x${foxInk.height} @${foxInk.x},${foxInk.y}  → ${side}px tile`);

// 4. Preview sheet: the wordmark at its render size and at 3×, the tile at both
//    sizes, and "KIMI" at its own render size for a side-by-side height check.
const sheet = canvas(760, 300, [0xf7, 0xf7, 0xf5]);
blit(sheet, resize(word, desktop.w, desktop.h), 40, 40);
blit(sheet, resize(word, desktop.w * 3, desktop.h * 3), 40, 110);
blit(sheet, resize(crop(doodle, doodleInk), Math.round(KIMI.w), Math.round(KIMI.h)), 40, 250);
blit(sheet, mark, 600, 40);
blit(sheet, resize(tile, 28, 28), 600, 180);
write(`${REFS}/fennic-brand-preview.png`, encodePng(sheet));

console.log("\nRender sizes to use in components:");
console.log(`  wordmark desktop : ${desktop.w}x${desktop.h}`);
console.log(`  wordmark mobile  : ${mobile.w}x${mobile.h} (×${MOBILE.toFixed(4)}, matching the doodle's 400→337 shrink)`);
console.log("  sidebar mark     : 28x28");
