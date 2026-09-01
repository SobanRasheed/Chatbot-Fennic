// Downloads all static assets for the kimi.com home clone.
// Usage: node scripts/download-assets-kimi-com-185e587f-root-8a5edab2.mjs
import { mkdir, writeFile, readFile } from "node:fs/promises";
import path from "node:path";

const ROOT = "public/sites/kimi-com-185e587f/root-8a5edab2";

const CARD_QUERY =
  "?x-tos-process=image%2Fauto-orient%2C1%2Fstrip%2Cresize%2Cw_480%2Ch_480%2Cm_mfit%2Cignore-error%2C1";

const cards = [
  // Inspiration (no heading)
  ["balckhole-gargantua", "2026-07-21/1d9fq62hl51jas5c3r3h0"],
  ["open-sea", "2026-07-21/1d9fq692av1fc64628i70"],
  ["global-market-dashboard", "2026-07-30/1d9lgt4qav1fc646cabi0"],
  ["3d-vintage-typewriter", "2026-07-28/1d9kcu576rtp4tq8808tg"],
  ["cyberpunk", "2026-07-21/1d9fq6dmdcmosb3rvj1hg"],
  ["3d-jet-engine-lab", "2026-08-20/1da3g45mdcmosb3sqfa10"],
  // Agent Swarm
  ["200-papers-citespace", "2026-05-29/1d8cnsjedcmosb3p7of70"],
  ["30-la-storefront-websites", "2026-05-22/1d8828n7f2ena6259hao0"],
  ["earth-radio", "2026-05-29/1d8clsbn6rtp4tqd7kvrg"],
  // Deep Research
  ["42-years-of-silicon", "2026-07-20/1d9f3eiqav1fc6460jpf0"],
  ["shipping-not-one-cycle", "2026-07-20/1d9f3dvedcmosb3rtu0fg"],
  ["the-interactive-paper", "2026-07-20/1d9f3ci1l51jas5c260vg"],
  // Websites
  ["4-surfaces-of-nature", "2026-04-20/1d7ipouvf2ena623kjiv0"],
  ["british-museum-review", "2026-04-20/1d7iujmmdcmosb3v7rmn0"],
  ["smoke-amber-ritual", "2026-04-20/1d7ipiiiav1fc6419r32g"],
  // Docs
  ["tesla-tear-sheet", "2026-05-15/1d83e7pl3v89kkejdgfjg"],
  ["portfolio-hedging-toolkit", "2026-05-15/1d83e82v6rtp4tqcga8s0"],
  ["summer-dress-design", "2026-05-15/1d83e7umdcmosb3og7l9g"],
  // Sheets
  ["hermes-20-year-panorama", "2026-05-15/1d83gi3udcmosb3ogeka0"],
  ["bibliometric-knowledge-graph", "2026-05-15/1d83gi1d3v89kkejdne9g"],
  ["personal-health-dashboard", "2026-05-15/1d83ghtvf2ena624tsncg"],
];

const images = cards.map(([slug, p]) => ({
  url: `https://kimi-file.kimi.ai/prod-chat-kimi/kfs/4/2/${p}${CARD_QUERY}`,
  file: `cards/${slug}.png`,
}));

// Section heading icons — kept in showcase/ to avoid colliding with the
// extracted inline nav icons (icons/swarm.svg etc. from svg-inventory.json)
const staticAssets = [
  ["https://statics.kimi.ai/kimi-showcase/swarm.svg", "showcase/swarm.svg"],
  ["https://statics.kimi.ai/kimi-showcase/deep-research.svg", "showcase/deep-research.svg"],
  ["https://statics.kimi.ai/kimi-showcase/website.svg", "showcase/website.svg"],
  ["https://statics.kimi.ai/kimi-showcase/doc.svg", "showcase/doc.svg"],
  ["https://statics.kimi.ai/kimi-showcase/xlsx.svg", "showcase/xlsx.svg"],
  // Explore button icon stack
  ["https://statics.moonshot.cn/kimi-web-seo/assets/icon-explore-light-DSMfyoMX.svg", "icons/icon-explore-light.svg"],
  ["https://statics.moonshot.cn/kimi-web-seo/assets/icon-recommend-light-CfSWeE2h.svg", "icons/icon-recommend-light.svg"],
].map(([url, file]) => ({ url, file }));

const favicons = [
  ["https://www.kimi.com/favicon.ico", "favicon.ico"],
  ["https://www.kimi.com/favicon-light.ico", "favicon-light.ico"],
  ["https://www.kimi.com/favicon-dark.ico", "favicon-dark.ico"],
  ["https://www.kimi.com/pwa-192.png", "pwa-192.png"],
].map(([url, file]) => ({ url, file: `../../${file}` })); // -> public/

// Kimi Doodle logo (data URI extracted from the live page, 800x160 PNG)
const researchDir = "../docs/research/kimi-com-185e587f/root-8a5edab2";
await mkdir(path.join(ROOT, "brand"), { recursive: true });
const doodleDataUri = JSON.parse(
  await readFile(new URL(`${researchDir}/doodle-datauri.txt`, import.meta.url), "utf8")
);
await writeFile(path.join(ROOT, "brand/kimi-doodle.png"), Buffer.from(doodleDataUri.replace(/^data:image\/png;base64,/, ""), "base64"));
console.log("ok  brand/kimi-doodle.png");

// Sidebar logo (124x124 PNG data URI; displayed at 28px inside a 32px box).
// logo-datauri.txt is double-JSON-stringified, so after one JSON.parse the
// value still carries literal quotes — strip everything through "base64,"
// and any non-base64 characters before decoding.
const logoDataUri = JSON.parse(
  await readFile(new URL(`${researchDir}/logo-datauri.txt`, import.meta.url), "utf8")
);
const logoBuf = Buffer.from(
  logoDataUri.replace(/^.*?base64,/, "").replace(/[^A-Za-z0-9+/=]/g, ""),
  "base64"
);
if (logoBuf.subarray(0, 4).toString("hex") !== "89504e47") {
  throw new Error("brand/kimi-logo.png: decoded bytes are not a PNG");
}
await writeFile(path.join(ROOT, "brand/kimi-logo.png"), logoBuf);
console.log(`ok  brand/kimi-logo.png  ${logoBuf.length}b`);

async function download(url, file) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const out = path.join(ROOT, file);
  await mkdir(path.dirname(out), { recursive: true });
  await writeFile(out, buf);
  console.log(`ok  ${file}  ${buf.length}b`);
}

const all = [...images, ...staticAssets, ...favicons];
let failed = 0;
for (const { url, file } of all) {
  try {
    await download(url, file);
  } catch (err) {
    failed++;
    console.error(`FAIL ${file}: ${err.message}`);
  }
}

console.log(failed ? `DONE with ${failed} failures` : "DONE all ok");
