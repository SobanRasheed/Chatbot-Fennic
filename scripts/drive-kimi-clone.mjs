#!/usr/bin/env node
// Drives the cloned (now Fennic AI-branded) site in a real Chromium via Playwright.
//
//   1. npm run dev                      (leave running)
//   2. node scripts/drive-kimi-clone.mjs
//
// Passes: the desktop homepage, the nav purge + subpages, the profile menu and
// Settings, the My Fennic workspace panel (three tabs, all backend-fed), the
// light/dark palette, and the mobile drawer.
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
//
// Takes the selector because not every route has a composer: the workspace panel
// hydrates around its tablist, and waiting on a textarea that is not there would
// just time out.
const hydrated = (page, selector = 'textarea[aria-label="Chat message"]') =>
  page.waitForFunction(
    (target) => {
      const el = document.querySelector(target);
      return !!el && Object.keys(el).some((key) => key.startsWith("__react"));
    },
    selector,
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
    const labels = (await pills.allInnerTexts()).map((t) => t.replace(/\s+/g, " ").trim());
    const banned = labels.filter((l) => /slides|swarm|docs/i.test(l));
    if (banned.length > 0)
      throw new Error(`removed products still pilled: ${banned.join(", ")}`);
    return `${count}: ${labels.join(" / ")}`;
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
    const flagship = page.getByText("Chat & Agent, flagship all-rounder");
    await modelToggle.click();
    // Anchor on the flagship row, not a sibling's blurb — the other options'
    // copy is branding-owned and moves.
    await flagship.waitFor();
    const file = await shot(page, "model-menu-open");
    await flagship.click();
    const next = (await modelToggle.innerText()).replace(/\s+/g, " ").trim();
    if (!next.startsWith("K3")) throw new Error(`toggle still reads "${next}"`);
    if (await flagship.isVisible())
      throw new Error("menu did not close after selecting");
    return `"${label}" -> "${next}", ${file}`;
  });

  await step("explore inspiration mounts and scrolls into view", async () => {
    if ((await scrollTop(page)) !== 0) throw new Error("page was already scrolled");
    const cards = page.locator("section a");
    await page.getByRole("button", { name: /Explore inspiration/ }).click();
    // Card titles are content-owned; assert the grid filled instead of naming one.
    if (!(await until(async () => (await cards.count()) > 0, { timeout: 25_000 })))
      throw new Error("no inspiration cards mounted");
    if (!(await until(async () => (await scrollTop(page)) > 100)))
      throw new Error("scroll container never moved");
    // Let the smooth scroll and the card images settle before shooting.
    await until(async () => {
      const y = await scrollTop(page);
      await page.waitForTimeout(150);
      return (await scrollTop(page)) === y;
    });
    const titles = (await cards.allInnerTexts()).join(" ");
    if (/slides|swarm|docs/i.test(titles))
      throw new Error("removed products still appear in the explore grid");
    return `scrollTop=${await scrollTop(page)}, ${await cards.count()} cards, ${await shot(page, "explore-inspiration")}`;
  });

  await step("floating 'Chat with Fennic' pill appears, then returns to top", async () => {
    const fab = page.getByRole("button", { name: "Chat with Fennic" });
    const wrapper = fab.locator("xpath=..");
    const opacity = () => wrapper.evaluate((el) => getComputedStyle(el).opacity);
    if (!(await until(async () => (await opacity()) === "1")))
      throw new Error(`pill stayed hidden (opacity ${await opacity()})`);
    const file = await shotOf(fab, "fab-chat-with-fennic");
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

  await step("workspace panel reflows for one column", async () => {
    await page.goto(`${BASE_URL}/my-fennic?tab=plugins`, {
      waitUntil: "domcontentloaded",
    });
    await hideDevOverlay(page);
    const cards = page.locator('[role="tabpanel"] h3');
    if (!(await until(async () => (await cards.count()) >= 18, { timeout: 90_000 })))
      throw new Error(`only ${await cards.count()} plugin cards on mobile`);
    await hydrated(page, '[role="tablist"]');
    // One column: every card shares a left edge, and none overflows the viewport.
    const boxes = await cards.evaluateAll((nodes) =>
      nodes.slice(0, 4).map((node) => {
        const box = node.getBoundingClientRect();
        return { x: Math.round(box.x), right: Math.round(box.right) };
      }),
    );
    const lefts = new Set(boxes.map((box) => box.x));
    if (lefts.size !== 1)
      throw new Error(`cards did not stack: left edges ${[...lefts].join(", ")}`);
    const overflow = boxes.find((box) => box.right > 390);
    if (overflow) throw new Error(`a card overflows to x=${overflow.right}`);
    return `stacked at x=${[...lefts][0]}, ${await shot(page, "mobile-workspace")}`;
  });

  await context.close();
}

// Every product removed from the site. Any of these surfacing in the sidebar,
// the pills or the explore grid is a regression, so the check is shared.
const BANNED =
  /kimi claw|kimi code|kimi work|\bdocs\b|\bswarm\b|\bslides\b|scheduled tasks/i;

// Routes that render a document: a heading, sections, prose.
const CONTENT_ROUTES = [
  { path: "/my-fennic", title: "My Fennic" },
  { path: "/plugins", title: "Plugins" },
  { path: "/help", title: "Help Center" },
  { path: "/features", title: "Features" },
  { path: "/about", title: "About Us" },
  { path: "/terms", title: "Terms of Service" },
  { path: "/privacy", title: "Privacy Policy" },
];

// Publisher modes. These are NOT content pages — they are the new-chat screen in
// a mode, so they have no h1 and no <main>: the wordmark is an image and the
// composer is the point. Asserting a heading here (as the old shared loop did)
// would fail on a page that is working exactly as intended.
const MODE_ROUTES = [
  {
    path: "/deep-research",
    label: "Deep Research",
    placeholder: "Ask Fennic to get an in-depth research report",
    caption: "Featured Deep Research cases",
  },
  {
    path: "/websites",
    label: "Websites",
    placeholder: "Beautiful design, real backend. Just describe your site",
    tabs: ["All", "Game", "Visualization", "Dashboard", "Tool", "Landing Page"],
  },
  {
    path: "/sheets",
    label: "Sheets",
    placeholder: "Describe the spreadsheet or dashboard you need",
    caption: "Featured Sheets cases",
  },
  {
    path: "/design",
    label: "Design",
    placeholder: "Describe an image, mockup or brand asset",
    caption: "Featured Design cases",
  },
];

// Read a palette token straight off :root — cheaper and less brittle than
// comparing computed background colours on a nested element.
const token = (page, name) =>
  page.evaluate(
    (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim(),
    name,
  );

// The wordmark's file, polled instead of sampled: currentSrc is empty until the
// browser finishes loading the img, and the preferences store swaps the
// <picture> for a bare next/image a beat after hydration — a single read can
// land in either gap. Falls back to the src attribute, which names the file
// even while loading, and keeps polling until it matches `expectFile` (so a
// pre-swap light read in a dark context doesn't pass for an answer). Returns
// the last src seen, for the error message, when the timeout runs out.
const wordmarkSrc = async (page, expectFile, { timeout = 15_000 } = {}) => {
  const deadline = Date.now() + timeout;
  let saw = null;
  for (;;) {
    const src = await page.locator('img[alt="Fennic"]').evaluateAll((els) =>
      els.map((el) => el.currentSrc || el.src).find((s) => s.includes("fennic-text")),
    );
    if (src) {
      saw = src;
      if (src.includes(expectFile)) return src;
    }
    if (Date.now() > deadline) return saw;
    await page.waitForTimeout(250);
  }
};


async function navPass(browser) {
  console.log("\nnav purge + routes — 1440x900");
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  watchPage(page, "nav");
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
  await hideDevOverlay(page);
  await page.getByRole("textbox", { name: "Chat message" }).waitFor({ timeout: 90_000 });
  await hydrated(page);

  await step("sidebar carries no removed product", async () => {
    const aside = page.locator("aside").first();
    const collapsed = (await aside.innerText()).replace(/\s+/g, " ");
    // MORE_ITEMS sit behind a toggle; expand it so the full list is in scope.
    const toggle = aside.getByRole("button", { name: /more|expand|collapse/i }).first();
    if (await toggle.count()) await toggle.click().catch(() => {});
    await page.waitForTimeout(200);
    const expanded = (await aside.innerText()).replace(/\s+/g, " ");
    const hit = BANNED.exec(collapsed) ?? BANNED.exec(expanded);
    if (hit) throw new Error(`sidebar still shows "${hit[0]}"`);
    const links = await aside.getByRole("link").allInnerTexts();
    return `${links.length} links: ${links.map((l) => l.replace(/\s+/g, " ").trim()).join(" / ")}`;
  });

  for (const route of CONTENT_ROUTES) {
    await step(`${route.path} renders`, async () => {
      const response = await page.goto(`${BASE_URL}${route.path}`, {
        waitUntil: "domcontentloaded",
      });
      if (response && response.status() >= 400)
        throw new Error(`HTTP ${response.status()}`);
      await hideDevOverlay(page);
      const heading = page.getByRole("heading", { level: 1 });
      await heading.first().waitFor({ timeout: 90_000 });
      const body = (await page.locator("main").innerText()).replace(/\s+/g, " ");
      const hit = BANNED.exec(body);
      if (hit) throw new Error(`page mentions removed product "${hit[0]}"`);
      const sections = await page.getByRole("heading", { level: 2 }).count();
      return `h1="${(await heading.first().innerText()).trim()}", ${sections} sections, ${await shot(
        page,
        `route${route.path.replace(/\//g, "-")}`,
      )}`;
    });
  }

  for (const route of MODE_ROUTES) {
    await step(`${route.path} opens the composer in ${route.label} mode`, async () => {
      const response = await page.goto(`${BASE_URL}${route.path}`, {
        waitUntil: "domcontentloaded",
      });
      if (response && response.status() >= 400)
        throw new Error(`HTTP ${response.status()}`);
      await hideDevOverlay(page);
      const composer = page.getByRole("textbox", { name: "Chat message" });
      await composer.waitFor({ timeout: 90_000 });
      await hydrated(page);

      // The mode's own prompt, verbatim — a shared placeholder would mean the
      // mode never actually reached the composer.
      const placeholder = await composer.getAttribute("placeholder");
      if (placeholder !== route.placeholder)
        throw new Error(`placeholder is "${placeholder}"`);

      // The mode named inside the composer box, not merely linked in the page.
      const box = page.locator('div:has(> textarea[aria-label="Chat message"])');
      const chip = (await box.innerText()).replace(/\s+/g, " ");
      if (!chip.includes(route.label))
        throw new Error(`composer toolbar does not name ${route.label}: "${chip}"`);

      // The wordmark is still the hero, and still the right ink for the scheme.
      await page.getByRole("img", { name: "Fennic" }).first().waitFor();

      const cards = page.locator("a[target=_blank], a[href^='/replay']");
      const count = await cards.count();
      if (count === 0) throw new Error("the gallery is empty");

      const galleryTabs = page.getByRole("tablist", { name: "Website categories" });
      let detail = `${count} cards`;
      if (route.tabs) {
        const labels = (await galleryTabs.getByRole("tab").allInnerTexts()).map((t) =>
          t.trim(),
        );
        if (labels.join("|") !== route.tabs.join("|"))
          throw new Error(`tabs are ${labels.join(" / ")}`);
        // Filtering must actually shrink the grid, or the tabs are decoration.
        await galleryTabs.getByRole("tab", { name: "Game", exact: true }).click();
        if (!(await until(async () => (await cards.count()) < count)))
          throw new Error(`the Game tab left all ${count} cards in place`);
        detail = `${count} cards, tabs ${labels.join(" / ")}, Game → ${await cards.count()}`;
        await galleryTabs.getByRole("tab", { name: "All", exact: true }).click();
      } else {
        const caption = page.getByRole("heading", { level: 2, name: route.caption });
        if (!(await caption.isVisible()))
          throw new Error(`the "${route.caption}" caption is missing`);
        detail = `${count} cards, "${route.caption}"`;
      }

      // The sidebar has to say where you are.
      const current = page.locator('aside a[aria-current="page"]');
      const marked = (await current.count()) === 1 ? (await current.innerText()).trim() : null;
      if (marked !== route.label)
        throw new Error(`sidebar marks "${marked}" as current, expected ${route.label}`);

      const body = (await page.locator("aside").innerText()).replace(/\s+/g, " ");
      const hit = BANNED.exec(body);
      if (hit) throw new Error(`sidebar mentions removed product "${hit[0]}"`);

      return `${detail}, ${await shot(page, `mode${route.path.replace(/\//g, "-")}`)}`;
    });
  }

  await context.close();
}

// The profile menu (hover off the sidebar footer) and the Settings screen it
// ends in. Every submenu the reference shows gets opened, the language choice
// is proven to survive a reload, and the theme pin is proven to re-paint the
// page — a dead segmented control would pass a visibility check.
async function accountPass(browser) {
  console.log("\naccount menu + settings — 1440x900");
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  watchPage(page, "account");
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
  await hideDevOverlay(page);
  await page.getByRole("textbox", { name: "Chat message" }).waitFor({ timeout: 90_000 });
  await hydrated(page);

  const accountMenu = page.getByRole("menu", { name: "Account" });

  await step("hovering the profile row opens the account menu", async () => {
    // The menu must be absent before the hover — conditional rendering is what
    // keeps its links out of the sidebar's nav assertions.
    if ((await accountMenu.count()) !== 0)
      throw new Error("the menu is in the DOM before any hover");
    await page.getByRole("button", { name: "Titumama" }).hover();
    await accountMenu.waitFor();
    const labels = (await accountMenu.getByRole("menuitem").allInnerTexts()).map((t) =>
      t.replace(/\s+/g, " ").trim(),
    );
    // Gift Card is out of scope by request; the purged products stay out.
    if (labels.join("|") !== "Get App|About Us|Language English|Get Help|Settings")
      throw new Error(`menu shows: ${labels.join(" / ")}`);
    return `${labels.map((l) => l.split(" ")[0]).join(" / ")}, ${await shot(page, "profile-menu")}`;
  });

  await step("About Us opens Terms / Privacy / Features and routes", async () => {
    await accountMenu.getByRole("menuitem", { name: /^About Us/ }).hover();
    const sub = page.getByRole("menu", { name: "About Us" });
    await sub.waitFor();
    const labels = (await sub.getByRole("menuitem").allInnerTexts()).map((t) => t.trim());
    if (labels.join("|") !== "Terms of Service|Privacy Policy|Features")
      throw new Error(`About Us shows: ${labels.join(" / ")}`);
    await shot(page, "menu-about-us");
    await sub.getByRole("menuitem", { name: "Terms of Service" }).click();
    await page.waitForURL("**/terms", { timeout: 30_000 });
    return "Terms of Service route reached";
  });

  await step("Language selects, shows the choice, and survives a reload", async () => {
    // The About Us step routed to /terms, which has no composer — and the
    // reload below asserts on one. Come home first so the reload means
    // something.
    await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
    await hideDevOverlay(page);
    await page.getByRole("textbox", { name: "Chat message" }).waitFor({ timeout: 90_000 });
    await hydrated(page);
    await page.getByRole("button", { name: "Titumama" }).hover();
    await accountMenu.waitFor();
    await accountMenu.getByRole("menuitem", { name: /^Language/ }).hover();
    const sub = page.getByRole("menu", { name: "Language" });
    await sub.waitFor();
    await sub.getByRole("menuitemradio", { name: "简体中文" }).click();
    if (
      !(await until(async () =>
        sub.getByRole("menuitemradio", { name: "简体中文", checked: true }).isVisible(),
      ))
    )
      throw new Error("the check never moved to 简体中文");
    const row = (
      await accountMenu.getByRole("menuitem", { name: /^Language/ }).innerText()
    ).replace(/\s+/g, " ").trim();
    if (!row.includes("简体中文")) throw new Error(`Language row still reads "${row}"`);
    // Reload: the choice has to come back from localStorage via the store.
    await page.reload({ waitUntil: "domcontentloaded" });
    await hideDevOverlay(page);
    await page.getByRole("textbox", { name: "Chat message" }).waitFor({ timeout: 90_000 });
    await hydrated(page);
    await page.getByRole("button", { name: "Titumama" }).hover();
    await accountMenu.waitFor();
    const restored = (
      await accountMenu.getByRole("menuitem", { name: /^Language/ }).innerText()
    ).replace(/\s+/g, " ").trim();
    if (!restored.includes("简体中文"))
      throw new Error(`after reload the Language row reads "${restored}"`);
    // Put it back so later passes start from English.
    await accountMenu.getByRole("menuitem", { name: /^Language/ }).hover();
    await page.getByRole("menu", { name: "Language" }).waitFor();
    await page
      .getByRole("menu", { name: "Language" })
      .getByRole("menuitemradio", { name: "English" })
      .click();
    // Close before the next step — its footer Get App trigger is only unique
    // while the menu (with its own Get App item) is not in the DOM.
    await page.keyboard.press("Escape");
    if (!(await until(async () => (await accountMenu.count()) === 0)))
      throw new Error("Escape did not close the language menu");
    return "English → 简体中文 → reload → 简体中文 → English";
  });

  await step("Get App opens Mobile App + Windows, and Mobile App shows a QR", async () => {
    // The footer icon button — the menu is closed at this point, so the only
    // "Get App" button on the page is the footer trigger.
    await page.getByRole("button", { name: "Get App" }).click();
    const sub = page.getByRole("menu", { name: "Get App" });
    await sub.waitFor();
    const labels = (await sub.getByRole("menuitem").allInnerTexts()).map((t) =>
      t.replace(/\s+/g, " ").trim(),
    );
    if (labels.join("|") !== "Mobile App|Windows Download")
      throw new Error(`Get App shows: ${labels.join(" / ")}`);
    await sub.getByRole("menuitem", { name: /^Mobile App/ }).hover();
    // The QR is decorative by design (image specs.md §11); assert the panel
    // painted with its caption, not that it scans.
    await sub.getByText("Scan to download the").waitFor();
    const modules = await sub.locator("svg[aria-hidden] rect").count();
    if (modules < 40) throw new Error(`the QR only drew ${modules} modules`);
    const file = await shot(page, "menu-get-app-qr");
    await page.keyboard.press("Escape");
    if (!(await until(async () => (await accountMenu.count()) === 0)))
      throw new Error("Escape did not close the menu");
    return `${modules} QR modules, Escape closes, ${file}`;
  });

  await step("Settings opens with the account on top", async () => {
    await page.getByRole("button", { name: "Titumama" }).hover();
    await accountMenu.getByRole("menuitem", { name: "Settings" }).click();
    await page.waitForURL("**/settings", { timeout: 30_000 });
    await page.getByText("Titumama").first().waitFor({ timeout: 90_000 });
    // No composer on this route — hydrate on the Notifications switch.
    await hydrated(page, '[role="switch"]');
    const sections = (await page.getByRole("heading", { level: 2 }).allInnerTexts())
      .map((t) => t.trim());
    if (sections.join("|") !== "General|Personalization|Get Help")
      throw new Error(`settings sections are: ${sections.join(" / ")}`);
    const rows = ["Theme", "Notifications", "Chat Presets", "Expand Sidebar on Search", "Language", "Memory"];
    for (const row of rows) {
      if (!(await page.getByText(row, { exact: true }).first().isVisible()))
        throw new Error(`the "${row}" row is missing`);
    }
    return `${sections.join(" / ")}, ${await shot(page, "settings")}`;
  });

  await step("pinning Dark re-paints the page, System gives it back", async () => {
    // This context is colourScheme-light, so System means light and a working
    // pin must flip every token and the wordmark with it.
    const theme = page.getByRole("tablist", { name: "Theme" });
    await theme.getByRole("tab", { name: "Dark" }).click();
    if (
      !(await until(async () => (await token(page, "--fennic-ground")) === "#1c1613"))
    )
      throw new Error(`pinning Dark left the ground at ${await token(page, "--fennic-ground")}`);
    const cls = await page.evaluate(() => document.documentElement.className);
    if (!/(^|\s)dark(\s|$)/.test(cls)) throw new Error(`html class is "${cls}", expected dark`);
    await shot(page, "settings-theme-dark");
    // The wordmark is on the home hero, not here — the pin rides along in
    // localStorage, so go look where the wordmark actually is.
    await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
    await hideDevOverlay(page);
    await page.getByRole("textbox", { name: "Chat message" }).waitFor({ timeout: 90_000 });
    await hydrated(page);
    const wordmark = await wordmarkSrc(page, "fennic-text-dark.png");
    if (!wordmark || !wordmark.includes("fennic-text-dark"))
      throw new Error(`the wordmark did not follow the pin (${wordmark ?? "not found"})`);
    await shot(page, "home-theme-dark");
    // Back to the tablist to give the page its System ground again.
    await page.goto(`${BASE_URL}/settings`, { waitUntil: "domcontentloaded" });
    await hideDevOverlay(page);
    await page.getByRole("tablist", { name: "Theme" }).waitFor({ timeout: 90_000 });
    await theme.getByRole("tab", { name: "System" }).click();
    if (
      !(await until(async () => (await token(page, "--fennic-ground")) === "#f7f5f3"))
    )
      throw new Error(`System left the ground at ${await token(page, "--fennic-ground")}`);
    return "tokens + wordmark flip on Dark, back on System";
  });

  await context.close();
}

async function themePass(browser) {
  console.log("\ntheme — light vs dark");
  for (const [scheme, ground, accent, wordmark] of [
    ["light", "#f7f5f3", "#d8663a", "fennic-text.png"],
    ["dark", "#1c1613", "#e28353", "fennic-text-dark.png"],
  ]) {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      colorScheme: scheme,
    });
    const page = await context.newPage();
    watchPage(page, scheme);
    await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
    await hideDevOverlay(page);
    await page.getByRole("textbox", { name: "Chat message" }).waitFor({ timeout: 90_000 });
    await hydrated(page);

    await step(`${scheme} palette resolves from prefers-color-scheme`, async () => {
      const got = {
        ground: await token(page, "--fennic-ground"),
        accent: await token(page, "--fennic-accent"),
      };
      if (got.ground.toLowerCase() !== ground)
        throw new Error(`--fennic-ground is ${got.ground}, expected ${ground}`);
      if (got.accent.toLowerCase() !== accent)
        throw new Error(`--fennic-accent is ${got.accent}, expected ${accent}`);
      return `ground ${got.ground} · accent ${got.accent}, ${await shot(page, `home-${scheme}`)}`;
    });

    await step(`${scheme} hero wordmark resolves to the right ink`, async () => {
      // The wordmark is the only Fennic image whose source is a fennic-text*
      // file — the sidebar logo is the mark — so match on that rather than
      // position: after the preferences store hydrates, the <picture> is
      // replaced by a bare next/image, so "picture img" is not a stable hook.
      // wordmarkSrc polls rather than sampling once: currentSrc stays empty
      // until the browser loads the file, and the swap lands a beat after
      // hydration.
      const src = await wordmarkSrc(page, wordmark);
      if (!src) throw new Error("no wordmark image found");
      const file = /fennic-text(-dark)?\.png/.exec(decodeURIComponent(src))?.[0];
      if (!src.includes(wordmark))
        throw new Error(`wordmark resolved to ${file ?? src}, expected ${wordmark}`);
      return file;
    });

    await step(`${scheme} self-growth orb reads as an orb, not a grid`, async () => {
      await page.goto(`${BASE_URL}/my-fennic`, { waitUntil: "domcontentloaded" });
      await hideDevOverlay(page);
      await page.getByRole("heading", { level: 1 }).waitFor({ timeout: 90_000 });
      await hydrated(page, '[role="tablist"]');
      // The orb is legible only because its bands differ, and a fixed alpha reads
      // very differently on the two grounds — that is what made the first cut a
      // rectangle of confetti in light mode and a busy grid in dark. So assert
      // the structure per scheme rather than trusting one visual check.
      const bands = await page.evaluate(() => {
        const dots = [...document.querySelectorAll("svg circle")];
        if (dots.length === 0) return null;
        const paints = new Set(
          dots.map((dot) => {
            const style = getComputedStyle(dot);
            return `${style.fill}@${dot.getAttribute("r")}`;
          }),
        );
        return { dots: dots.length, paints: paints.size };
      });
      if (!bands) throw new Error("no orb dots rendered");
      if (bands.dots !== 209)
        throw new Error(`orb has ${bands.dots} dots, expected 209 (19x11)`);
      if (bands.paints < 4)
        throw new Error(`only ${bands.paints} distinct dot paints — the bands collapsed`);
      const promo = page.locator("h2", { hasText: "learn and grow on its own" });
      return `${bands.dots} dots, ${bands.paints} paints, ${await shotOf(
        promo.locator("xpath=../.."),
        `orb-${scheme}`,
      )}`;
    });

    await context.close();
  }
}

// The My Fennic workspace panel: three tabs, all three fed by
// /api/workspace/*. This pass is the only one that exercises a mutation, so it
// puts the catalog back the way it found it before it leaves.
async function workspacePass(browser) {
  console.log("\nworkspace panel — 1440x900");
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  watchPage(page, "workspace");
  await page.goto(`${BASE_URL}/my-fennic`, { waitUntil: "domcontentloaded" });
  await hideDevOverlay(page);

  const tab = (name) => page.getByRole("tab", { name, exact: true });
  const heading = page.getByRole("heading", { level: 1 });

  await step("my-fennic tab paints heatmap + stats", async () => {
    await heading.waitFor({ timeout: 90_000 });
    await hydrated(page, '[role="tablist"]');
    const title = (await heading.innerText()).trim();
    if (!/’s Fennic$/.test(title)) throw new Error(`h1 reads "${title}"`);
    const stats = await page.getByText(/Fennic has been with you for/).innerText();
    const numbers = stats.match(/\d+/g) ?? [];
    if (numbers.length < 3) throw new Error(`stats line has no numbers: "${stats}"`);
    if (numbers.includes("0")) throw new Error(`a stat rendered as 0: "${stats}"`);
    const cells = await page
      .locator('[role="img"][aria-label*="oldest first"] span[title]')
      .count();
    if (cells !== 371) throw new Error(`heatmap has ${cells} cells, expected 371`);
    // All five buckets must be on screen, or a shade of the palette is dead.
    const shades = await page.evaluate(() => {
      const grid = document.querySelector('[role="img"][aria-label*="oldest first"]');
      const seen = new Set();
      for (const cell of grid.querySelectorAll("span[title]")) {
        const style = getComputedStyle(cell);
        seen.add(`${style.backgroundColor}@${style.opacity}`);
      }
      return [...seen];
    });
    if (shades.length < 5)
      throw new Error(`only ${shades.length} heatmap shades render: ${shades.join(", ")}`);
    return `${cells} cells, ${shades.length} shades, ${await shot(page, "workspace-my-fennic")}`;
  });

  await step("Growth switches the series", async () => {
    const first = await page
      .locator('[role="img"][aria-label*="oldest first"] span[title]')
      .first()
      .getAttribute("title");
    await page.getByRole("tab", { name: "Growth" }).click();
    if (!(await until(async () => {
      const next = await page
        .locator('[role="img"][aria-label*="oldest first"] span[title]')
        .first()
        .getAttribute("title");
      return next !== first;
    })))
      throw new Error("the grid did not change when Growth was selected");
    const caption = await page.getByText(/adds to what it knows/).isVisible();
    if (!caption) throw new Error("growth caption did not swap in");
    await page.getByRole("tab", { name: "Closeness" }).click();
    return "closeness ⇄ growth";
  });

  await step("self-growth toggle round-trips through the API", async () => {
    const button = page.getByRole("button", { name: "Enable self-growth" }).first();
    await button.click();
    const on = page.getByRole("button", { name: "Self-growth on" });
    if (!(await until(() => on.isVisible(), { timeout: 8000 })))
      throw new Error("button never flipped to the enabled state");
    const persisted = await page.evaluate(async () => {
      const res = await fetch("/api/workspace/profile");
      return (await res.json()).profile.selfGrowthEnabled;
    });
    if (persisted !== true) throw new Error("the server did not record the change");
    // Put it back so a re-run starts from the same state.
    await page.getByRole("button", { name: "Turn off self-growth" }).click();
    await until(async () =>
      (await page.getByRole("button", { name: "Enable self-growth" }).count()) > 0,
    );
    return "off → on → off, server agreed";
  });

  await step("plugins tab lists the catalog and filters server-side", async () => {
    await tab("Plugins").click();
    const cards = page.locator('[role="tabpanel"] h3');
    if (!(await until(async () => (await cards.count()) >= 18, { timeout: 25_000 })))
      throw new Error(`only ${await cards.count()} plugins rendered`);
    const all = await cards.count();
    await page.getByRole("tab", { name: "Finance", exact: true }).click();
    if (!(await until(async () => (await cards.count()) < all && (await cards.count()) > 0)))
      throw new Error(`Finance filter left ${await cards.count()} of ${all}`);
    const names = (await cards.allInnerTexts()).join(" / ");
    const file = await shot(page, "workspace-plugins");
    await page.getByRole("tab", { name: "All", exact: true }).click();
    await until(async () => (await cards.count()) === all);
    return `${all} total, Finance → ${names}, ${file}`;
  });

  await step("plugin search narrows the grid", async () => {
    const cards = page.locator('[role="tabpanel"] h3');
    await page.getByPlaceholder("Search the directory").fill("biomedical");
    if (!(await until(async () => (await cards.count()) === 1, { timeout: 10_000 })))
      throw new Error(`search returned ${await cards.count()} results, expected 1`);
    const hit = (await cards.first().innerText()).trim();
    await page.getByPlaceholder("Search the directory").fill("");
    return `"biomedical" → ${hit}`;
  });

  await step("installing a plugin persists and shows under Installed", async () => {
    const cards = page.locator('[role="tabpanel"] h3');
    await page.getByRole("button", { name: /^Install GitHub$/ }).click();
    if (!(await until(async () => {
      const state = await page.evaluate(async () => {
        const res = await fetch("/api/workspace/plugins?category=Installed");
        return (await res.json()).plugins.map((p) => p.slug);
      });
      return state.includes("github");
    }, { timeout: 10_000 })))
      throw new Error("the install never reached the server");
    await page.getByRole("tab", { name: "Installed", exact: true }).click();
    if (!(await until(async () => (await cards.count()) === 1)))
      throw new Error(`Installed shows ${await cards.count()} rows, expected 1`);
    const file = await shot(page, "workspace-plugins-installed");
    // Restore.
    await page.getByRole("button", { name: /^Remove GitHub$/ }).click();
    await until(async () => (await cards.count()) === 0, { timeout: 10_000 });
    await page.getByRole("tab", { name: "All", exact: true }).click();
    return file;
  });

  await step("skills tab opens on the Added empty state", async () => {
    await tab("Skills").click();
    const empty = page.getByText("You have not added a skill yet");
    if (!(await until(() => empty.isVisible(), { timeout: 25_000 })))
      throw new Error("the Added empty state did not render");
    if (!(await page.getByText("Document to skills").isVisible()))
      throw new Error("the upload promo is missing");
    return shot(page, "workspace-skills");
  });

  await step("Featured fills the skills grid", async () => {
    const cards = page.locator('[role="tabpanel"] h3');
    await page.getByRole("tab", { name: "Featured", exact: true }).click();
    if (!(await until(async () => (await cards.count()) > 0, { timeout: 10_000 })))
      throw new Error("Featured returned nothing");
    const count = await cards.count();
    const file = await shot(page, "workspace-skills-featured");
    await page.getByRole("tab", { name: "Added", exact: true }).click();
    return `${count} skills, ${file}`;
  });

  await step("Customize menu opens and dismisses on Escape", async () => {
    const trigger = page.getByRole("button", { name: /^Customize$/ });
    await trigger.click();
    const item = page.getByRole("menuitem", { name: /Create a skill/ });
    await item.waitFor({ timeout: 5000 });
    const file = await shot(page, "workspace-skills-customize");
    await page.keyboard.press("Escape");
    if (!(await until(async () => (await item.count()) === 0)))
      throw new Error("Escape did not close the menu");
    return file;
  });

  await step("?tab= deep-links a tab, and the tab row keeps the URL honest", async () => {
    await page.goto(`${BASE_URL}/my-fennic?tab=skills`, { waitUntil: "domcontentloaded" });
    await hideDevOverlay(page);
    const active = page.locator('[role="tab"][aria-selected="true"]').first();
    await active.waitFor({ timeout: 90_000 });
    await hydrated(page, '[role="tablist"]');
    if ((await active.innerText()).trim() !== "Skills")
      throw new Error(`?tab=skills selected "${(await active.innerText()).trim()}"`);
    await tab("Plugins").click();
    if (!(await until(async () => new URL(page.url()).searchParams.get("tab") === "plugins")))
      throw new Error(`URL stayed at ${page.url()}`);
    return new URL(page.url()).search;
  });

  await step("close returns to the composer", async () => {
    await page.getByRole("button", { name: "Close workspace" }).click();
    await page.getByRole("textbox", { name: "Chat message" }).waitFor({ timeout: 90_000 });
    return new URL(page.url()).pathname;
  });

  await context.close();
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  console.log(`driving ${BASE_URL} -> ${rel(OUT_DIR)}`);
  const browser = await chromium.launch({ headless: !HEADED, slowMo: SLOWMO });
  try {
    await desktopPass(browser);
    await navPass(browser);
    await accountPass(browser);
    await workspacePass(browser);
    await themePass(browser);
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
