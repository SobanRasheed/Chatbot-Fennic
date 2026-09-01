#!/usr/bin/env node
// Drives the cloned kimi.com homepage in a real Chromium via Playwright.
//
//   1. npm run dev                      (leave running)
//   2. node scripts/drive-kimi-clone.mjs
//
// Env: CLONE_URL (default http://localhost:3000) · HEADED=1 to watch it run
//      SLOWMO=<ms> pacing for headed runs (default 250) · KEEP_OPEN=<seconds>
//      leaves the window up at the end so you can poke at it yourself.
// Screenshots land in temp/playwright/ (gitignored).

import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const BASE_URL = process.env.CLONE_URL ?? "http://localhost:3000";
const OUT_DIR = path.resolve("temp/playwright");
const HEADED = process.env.HEADED === "1";
const SLOWMO = HEADED ? Number(process.env.SLOWMO ?? 250) : 0;
const KEEP_OPEN = Number(process.env.KEEP_OPEN ?? 0);


const steps = [];
const consoleErrors = [];
const pageErrors = [];
const badRequests = [];
let shotIndex = 0;

async function step(name, fn) {
  try {
    const detail = await fn();
    steps.push({ name, ok: true, detail });
    console.log(`  ok    ${name}${detail ? ` — ${detail}` : ""}`);
  } catch (error) {
    const first = String(error.message).split("\n")[0];
    steps.push({ name, ok: false, detail: first });
    console.log(`  FAIL  ${name} — ${first}`);
  }
}

const rel = (file) => path.relative(process.cwd(), file).replaceAll("\\", "/");

async function shot(page, label, options = {}) {
  shotIndex += 1;
  const file = path.join(OUT_DIR, `${String(shotIndex).padStart(2, "0")}-${label}.png`);
  await page.screenshot({ path: file, ...options });
  return rel(file);
}

async function shotOf(locator, label) {
  shotIndex += 1;
  const file = path.join(OUT_DIR, `${String(shotIndex).padStart(2, "0")}-${label}.png`);
  await locator.screenshot({ path: file });
  return rel(file);
}

function watchPage(page, tag) {
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(`[${tag}] ${msg.text()}`);
  });
  page.on("pageerror", (error) => pageErrors.push(`[${tag}] ${error.message}`));
  page.on("requestfailed", (req) =>
    badRequests.push(`[${tag}] ${req.failure()?.errorText ?? "failed"} ${req.url()}`),
  );
  page.on("response", (res) => {
    if (res.status() >= 400) badRequests.push(`[${tag}] HTTP ${res.status()} ${res.url()}`);
  });
}

// The app's only scroll container is AppShell's inner div, not the document —
// window.scrollY stays 0 no matter how far the page moves. Match it on
// overscroll-contain: the sidebar's nav area is also overflow-y-auto.
const scroller = (page) => page.locator("div.overscroll-contain").first();
const scrollTop = (page) => scroller(page).evaluate((el) => Math.round(el.scrollTop));

// React attaches a fiber key to a DOM node only once hydration reaches it, so
// this is the cheapest reliable "the page is interactive now" signal. Without
// it, an early screenshot lands mid-hydration and Playwright's caret-hiding
// inline style shows up as a hydration mismatch in the console.
const hydrated = (page) =>
  page.waitForFunction(
    () => {
      const el = document.querySelector('textarea[aria-label="Chat message"]');
      return !!el && Object.keys(el).some((key) => key.startsWith("__react"));
    },
    undefined,
    { timeout: 90_000 },
  );


async function until(check, { timeout = 6000, interval = 50 } = {}) {
  const deadline = Date.now() + timeout;
  for (;;) {
    if (await check()) return true;
    if (Date.now() > deadline) return false;
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
}

const asideX = async (page) =>
  Math.round((await page.locator("aside").first().boundingBox())?.x ?? NaN);

// Next's dev-tools badge is a fixed bottom-left circle that sits on top of the
// sidebar's "Log in" row — hide it so screenshots show the app, not the toolbar.
const hideDevOverlay = (page) =>
  page.addStyleTag({ content: "nextjs-portal{display:none!important}" }).catch(() => {});

async function desktopPass(browser) {
  console.log("\ndesktop — 1440x900");
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  watchPage(page, "desktop");
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
  await hideDevOverlay(page);

  const composer = page.getByRole("textbox", { name: "Chat message" });
  const send = page.getByRole("button", { name: "Send" });
  // Scope to the composer box: Next's dev overlay also has aria-haspopup="menu"
  // buttons, and Playwright's CSS engine pierces its shadow root.
  const composerBox = page.locator('div:has(> textarea[aria-label="Chat message"])');
  const modelToggle = composerBox.locator('button[aria-haspopup="menu"]');
  const sendColor = () => send.evaluate((el) => getComputedStyle(el).backgroundColor);

  await step("hero paints (wordmark + composer)", async () => {
    // First nav compiles the route in Turbopack, so allow a long first paint.
    await composer.waitFor({ state: "visible", timeout: 90_000 });
    await page.getByRole("img", { name: "Fennic" }).first().waitFor({ state: "visible" });
    await hydrated(page);
    return shot(page, "home-desktop");
  });

  await step("shortcut pills render", async () => {
    const pills = page.getByLabel("Publisher shortcuts").getByRole("link");
    const count = await pills.count();
    if (count === 0) throw new Error("no shortcut pills found");
    return `${count}: ${(await pills.allInnerTexts()).join(" / ").replace(/\n/g, " ")}`;
  });

  await step("typing arms the send button", async () => {
    const before = await sendColor();
    await composer.fill("Model a black hole accretion disk in WebGL");
    if (!(await until(async () => (await sendColor()) !== before)))
      throw new Error(`send button stayed ${before} after typing`);
    return `${before} -> ${await sendColor()}, ${await shot(page, "composer-typed")}`;
  });

  await step("model menu opens and switches model", async () => {
    const label = (await modelToggle.innerText()).replace(/\s+/g, " ").trim();
    await modelToggle.click();
    await page.getByText("Massive search, batch processing, and more in one go").waitFor();
    const file = await shot(page, "model-menu-open");
    await page.getByText("Chat & Agent, flagship all-rounder").click();
    const next = (await modelToggle.innerText()).replace(/\s+/g, " ").trim();
    if (!next.startsWith("K3")) throw new Error(`toggle still reads "${next}"`);
    if (await page.getByText("Chat & Agent, flagship all-rounder").isVisible())
      throw new Error("menu did not close after selecting");
    return `"${label}" -> "${next}", ${file}`;
  });

  await step("explore inspiration mounts and scrolls into view", async () => {
    if ((await scrollTop(page)) !== 0) throw new Error("page was already scrolled");
    await page.getByRole("button", { name: /Explore inspiration/ }).click();
    await page.getByText("Open Sea", { exact: true }).first().waitFor({ timeout: 20_000 });
    if (!(await until(async () => (await scrollTop(page)) > 100)))
      throw new Error("scroll container never moved");
    // Let the smooth scroll and the card images settle before shooting.
    await until(async () => {
      const y = await scrollTop(page);
      await page.waitForTimeout(150);
      return (await scrollTop(page)) === y;
    });
    const cards = await page.locator("section a").count();
    return `scrollTop=${await scrollTop(page)}, ${cards} cards, ${await shot(page, "explore-inspiration")}`;
  });

  await step("floating 'Chat with Kimi' pill appears, then returns to top", async () => {
    const fab = page.getByRole("button", { name: "Chat with Kimi" });
    const wrapper = fab.locator("xpath=..");
    const opacity = () => wrapper.evaluate((el) => getComputedStyle(el).opacity);
    if (!(await until(async () => (await opacity()) === "1")))
      throw new Error(`pill stayed hidden (opacity ${await opacity()})`);
    const file = await shotOf(fab, "fab-chat-with-kimi");
    await fab.click();
    if (!(await until(async () => (await scrollTop(page)) === 0)))
      throw new Error(`back-to-top left scrollTop at ${await scrollTop(page)}`);
    if (!(await until(async () => (await opacity()) === "0")))
      throw new Error("pill did not fade out at the top");
    return file;
  });

  await step("sidebar collapses off-screen and reopens", async () => {
    const open = await asideX(page);
    if (open !== 0) throw new Error(`sidebar did not start docked (x=${open})`);
    await page.getByRole("button", { name: "Hide sidebar" }).click();
    if (!(await until(async () => (await asideX(page)) <= -240)))
      throw new Error(`sidebar did not slide out (x=${await asideX(page)})`);
    const file = await shot(page, "sidebar-collapsed");
    await page.getByRole("button", { name: "Open sidebar" }).click();
    if (!(await until(async () => (await asideX(page)) === 0)))
      throw new Error(`sidebar did not return (x=${await asideX(page)})`);
    return file;
  });

  await step("explore grid renders to the bottom of the scroller", async () => {
    await scroller(page).evaluate((el) => el.scrollTo({ top: el.scrollHeight }));
    await page.waitForTimeout(600);
    return shot(page, "explore-bottom");
  });

  await context.close();
}

async function mobilePass(browser) {
  console.log("\nmobile — 390x844");
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  watchPage(page, "mobile");
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
  await hideDevOverlay(page);

  await step("mobile home paints", async () => {
    await page.getByRole("textbox", { name: "Chat message" }).waitFor({ timeout: 60_000 });
    await hydrated(page);
    if ((await asideX(page)) > -240) throw new Error("drawer is open on first paint");
    return shot(page, "home-mobile");
  });

  await step("header trigger opens the mobile drawer", async () => {
    await page.getByRole("button", { name: "Open sidebar" }).click();
    if (!(await until(async () => (await asideX(page)) === 0)))
      throw new Error(`drawer did not slide in (x=${await asideX(page)})`);
    return shot(page, "mobile-drawer-open");
  });

  await step("backdrop tap closes the drawer", async () => {
    await page.locator("div.z-\\[29\\]").click({ position: { x: 340, y: 400 } });
    if (!(await until(async () => (await asideX(page)) <= -240)))
      throw new Error(`drawer stayed open (x=${await asideX(page)})`);
    return `x=${await asideX(page)}`;
  });

  await context.close();
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  console.log(`driving ${BASE_URL} -> ${rel(OUT_DIR)}`);
  const browser = await chromium.launch({ headless: !HEADED, slowMo: SLOWMO });
  try {
    await desktopPass(browser);
    await mobilePass(browser);
    if (KEEP_OPEN > 0) {
      const page = await (await browser.newContext({ viewport: null })).newPage();
      await page.goto(BASE_URL);
      await hideDevOverlay(page);
      console.log(`
holding the window open for ${KEEP_OPEN}s — have a click around`);
      await page.waitForTimeout(KEEP_OPEN * 1000);
    }
  } finally {
    await browser.close();
  }

  const failed = steps.filter((s) => !s.ok);
  const report = (title, lines) => {
    if (lines.length === 0) return;
    console.log(`\n${title} (${lines.length}):`);
    for (const line of [...new Set(lines)].slice(0, 15)) console.log(`  - ${line}`);
  };
  console.log(`\n${steps.length - failed.length}/${steps.length} steps passed`);
  report("page errors", pageErrors);
  report("console errors", consoleErrors);
  report("failed / 4xx-5xx requests", badRequests);
  if (failed.length > 0 || pageErrors.length > 0) process.exitCode = 1;
}

await main();
