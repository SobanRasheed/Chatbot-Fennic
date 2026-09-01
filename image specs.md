# Fennic AI — image specs

Where every brand image lives, what it has to look like, and which of them are
still Kimi's. Two rules govern the whole list:

1. **Ship at 4× the CSS size.** `scripts/brand-fennic-assets.mjs` sets
   `WORDMARK_SCALE = 4` and the mark follows the same rule (28px rendered,
   112px shipped). Anything softer than 4× visibly blurs on a phone.
2. **There is no theme toggle.** `src/app/layout.tsx` deliberately omits the
   `light` class, so the palette follows `prefers-color-scheme` and you never
   know which ground an asset will land on. Every image below must be legible on
   **both** warm off-white `#F7F5F3` and deep charcoal `#1C1613`. An asset that
   only works on one of them is a bug, not a style choice.

Brand palette for all art direction: terracotta `#D8663A` (accent — `#E28353` in
dark mode), cream `#F2D6B8`, charcoal `#2C2320`, deep charcoal `#1C1613`, warm
off-white `#F7F5F3`. Shadows are always warm charcoal, never neutral black.

## Summary

| Asset | Drop path | Format | Intrinsic | Rendered | Status |
|---|---|---|---|---|---|
| Sidebar mark | `public/sites/kimi-com-185e587f/root-8a5edab2/brand/fennic-mark.png` | PNG | 112×112 | 28×28 | ✅ Fennic |
| Hero wordmark (light) | `public/sites/kimi-com-185e587f/root-8a5edab2/brand/fennic-text.png` | PNG | 664×176 | 166×44 / 139×37 | ✅ Fennic |
| Hero wordmark (dark) | `public/sites/kimi-com-185e587f/root-8a5edab2/brand/fennic-text-dark.png` | PNG | 664×176 | 166×44 / 139×37 | ✅ Fennic |
| Favicon (default) | `public/sites/favicon.ico` | ICO 16+32+48 | 48×48 max | browser tab | ⚠️ still Kimi |
| Favicon (light) | `public/sites/favicon-light.ico` | ICO 16+32+48 | 48×48 max | light-scheme tab | ⚠️ still Kimi |
| Favicon (dark) | `public/sites/favicon-dark.ico` | ICO 16+32+48 | 48×48 max | dark-scheme tab | ⚠️ still Kimi |
| Apple touch icon | `public/sites/pwa-192.png` | PNG | 192×192 | 180×180 | ⚠️ still Kimi |
| PWA maskable | `public/sites/pwa-512.png` | PNG | 512×512 | install prompt | ❌ missing |
| Social card | `public/sites/og-fennic.png` | PNG | 1200×630 | link previews | ❌ never declared |
| Explore card art | `public/sites/kimi-com-185e587f/root-8a5edab2/cards/*.png` | JPEG | 16:9, ≥1000px wide | 234×137 / 150×88 | ⚠️ Kimi content |
| Showcase icons | `public/sites/kimi-com-185e587f/root-8a5edab2/showcase/*.svg` | SVG | vector | 24×24 | ⚠️ 2 now orphaned |
| Registry icons | `public/sites/kimi-com-185e587f/root-8a5edab2/icons/*.svg` | inline SVG | vector | 18/20/28px | ✅ tokenised |
| Plugin logos | `public/sites/kimi-com-185e587f/root-8a5edab2/plugins/<slug>.svg` | SVG or PNG | 128×128 | 40×40 | ❌ monogram fallback |
| Self-growth clip | `public/sites/kimi-com-185e587f/root-8a5edab2/video/self-growth.webm` | WebM + MP4 | 1080×624 | ~540×308 | ⚠️ animated in code instead |

Masters live in `src/UI Components/` and are **not served** — they are the
sources the build script reads: `fennic ai icon.png` (1448×1086, note it is 4:3
and not square), `Fennic Text.png` (2172×724), `Fennic Text.svg` (an auto-trace
of the PNG — 2920 paths, mostly speckle; unusable, see the wordmark section).

---

## 1. Sidebar mark — live

**Path** `public/sites/kimi-com-185e587f/root-8a5edab2/brand/fennic-mark.png`
**Consumed by** `Sidebar.tsx` line 12 (`LOGO_SRC`), rendered by `next/image` at
`width={28} height={28}`.

- **Format** PNG. It carries its own ground, so there is nothing to gain from
  SVG and the fox's shading would bloat a vector file.
- **Intrinsic** 112×112 — 4× the 28px render.
- **Transparency** None, and that is deliberate. This is a *tile*, the way
  Kimi's black "K" square was: the fox sits on its own deep-charcoal
  `#1C1613` ground with a rounded-square crop. Because the tile brings its own
  background it reads identically on both page grounds, which is why this asset
  is already both-mode safe with no variant.
- **Safe padding** Keep ≥8% of the tile (9px at 112) clear on every side. At
  28px the fox is 26px of usable art; anything tighter clips against the
  rounded corner.
- **Minimum legible size** 20px. Below that drop the fox's ear detail and ship a
  simplified silhouette instead.
- **Art direction** Fox in profile or three-quarter, terracotta `#D8663A` fur
  against the charcoal ground, one flat accent, no gradient mesh, no drop
  shadow. It must survive being 28 pixels tall — silhouette first, detail
  second.

**To replace it:** overwrite `src/UI Components/fennic ai icon.png` and re-run
`node scripts/brand-fennic-assets.mjs`. Do not hand-edit the file in `public/`;
the script square-crops the 4:3 master and re-inks it, and a hand-dropped file
will be overwritten on the next run.

## 2. Hero wordmark — live, both modes

**Paths** `…/brand/fennic-text.png` (light) and `…/brand/fennic-text-dark.png` (dark)
**Consumed by** `KimiHomePage.tsx`, wrapped in a `<picture>` whose `<source
media="(prefers-color-scheme: dark)">` carries the dark twin, at
`h-[37px] w-[139px] md:h-[44px] md:w-[166px]`, `priority`.

- **Format** PNG, and this is a decision, not laziness. `Fennic Text.svg` exists
  beside the master but is a colour-quantised auto-trace: 2920 paths, most of
  them speckle, and the grain it punched into the letterforms was visible at
  render size. The bitmap is cleaner at every size the page uses.
- **Intrinsic** 664×176 each — 4× the 166×44 desktop frame.
- **Ink box** The letterforms occupy 154×44 inside the 166×44 frame. That
  measurement comes from Kimi's original "KIMI" doodle (`inkBounds` measures it
  at 308×88 in an 800×160 file, which lands at 154×44 CSS px). The hero's optical
  centre depends on it — if you re-cut the wordmark, match the ink box rather
  than filling the frame edge to edge.
- **Transparency** Required — alpha channel, no ground. It sits directly on
  `--fennic-panel`: `#FFFDFB` in light, `#2C2320` in dark.
- **Light/dark behaviour** This is the one asset with real exposure, and it is
  handled by shipping two files rather than compromising on one tone:
  - light → charcoal `#2C2320` letterforms, i.e. `--fennic-text-primary`.
  - dark → warm off-white `#F7F5F3`, the same token in the other mode.
  - the dot stays terracotta in both. `reink()` separates it from the
    letterforms by red-minus-green (~135 on the dot, ~17 on the letters) and
    leaves those 14,936 pixels alone, so it survives untouched.

  The two files are pixel-aligned — identical crop, identical geometry — so the
  swap reads only as a change of ink. Note the ink is Fennic's, not the doodle's:
  the doodle measures `#000000`, and neutral black is exactly what this palette
  avoids. The doodle is a *geometry* reference only.

  The single-file alternative — setting the whole wordmark in terracotta
  `#D8663A` — is tempting but weaker: measured against the two grounds it gives
  3.3:1 on `#F7F5F3` and 5.0:1 on `#1C1613`. That clears the 3:1 large-text
  threshold at 44px, but not 4.5:1, and it spends the accent colour on the one
  element that does not need it.
- **Safe padding** 12px of transparent margin at 4× (3px rendered) left and
  right so the wordmark does not collide with the composer's optical edge. Top
  and bottom trim tight to the ink.
- **Minimum legible size** 96px wide. Under that the descender on the "g" fills
  in; use the mark instead of the wordmark.
- **Art direction** Lowercase geometric sans, generous aperture, the dot over the
  "i" as the single terracotta accent. No outline, no bevel, no letterpress
  texture — grain is exactly what made the traced SVG unusable.

**To replace it:** overwrite `src/UI Components/Fennic Text.png` and re-run
`node scripts/brand-fennic-assets.mjs`. It writes both modes from that one
master; do not hand-author the dark twin, or the two will drift out of
alignment.

## 3. Favicons — still Kimi's

**Paths** `public/sites/favicon.ico`, `favicon-light.ico`, `favicon-dark.ico`
**Consumed by** `src/app/layout.tsx` → `metadata.icons.icon`, which declares all
three with `media` queries for light and dark.

Measured on disk: each `.ico` packs three images (48×48, 32×32, 16×16) in 15,086
bytes. `favicon.ico` and `favicon-light.ico` are **byte-identical** (md5
`2c4c68a5b2e924b7b8aeb109b1d11e31`); `favicon-dark.ico` is genuinely different
(`8609b35334407fad3745b91461951180`). All three are Kimi's, so the browser tab
still shows Kimi's mark on a Fennic site. Nothing 404s, which is why they were
left working rather than deleted.

- **Format** ICO with all three sizes embedded. Do not ship a lone 16×16 —
  Windows taskbar pinning and macOS bookmark lists both reach for 48.
- **Intrinsic** 16×16, 32×32 and 48×48 in one container. Author each size by
  hand; automatic downsampling of a detailed 48 turns the 16 into mush.
- **Transparency** Alpha, no ground. The browser chrome supplies the background
  and it is not one of our colours.
- **Light/dark behaviour** This is why there are three files. `favicon-light.ico`
  is shown against light browser chrome, so it wants the charcoal `#2C2320` fox.
  `favicon-dark.ico` faces dark chrome, so it wants warm off-white `#F7F5F3`.
  `favicon.ico` is the fallback for browsers that ignore `media` — make that one
  terracotta `#D8663A`, which holds against either.
- **Minimum legible size** 16px is the floor and it is brutal. At that size ship
  the head silhouette only — two ears and a snout. Whiskers, eyes and fur all
  disappear.
- **Art direction** The most reduced form of the mark you can draw. If you cannot
  tell it is a fox at 16px, cut detail until you can.

## 4. Apple touch icon / PWA — one stale, one missing

**Path** `public/sites/pwa-192.png` — exists, verified 192×192, Kimi's.
**Also needed** `public/sites/pwa-512.png` — does not exist.
**Consumed by** `metadata.icons.apple` in `layout.tsx`. There is no
`webmanifest` in the project, so the 512 has nothing pointing at it yet: add the
file first, then the manifest.

- **Format** PNG, opaque.
- **Intrinsic** 192×192 and 512×512. iOS renders the touch icon at 180×180, so
  192 is the smallest source that avoids upscaling.
- **Transparency** **None.** iOS composites transparent touch icons onto black
  and the result looks broken. Give it the deep-charcoal `#1C1613` ground, same
  as the sidebar tile.
- **Safe padding** For the 512, keep all art inside the centre 80%. Android
  masks to a circle, a squircle or a rounded square depending on the launcher,
  and the corners get eaten.
- **Light/dark behaviour** Irrelevant — both are opaque tiles on a home screen.
- **Art direction** The sidebar tile scaled up, with the fur detail the 28px
  version cannot afford. This is the only place the mark is ever large.

## 5. Social card — never declared

**Path to create** `public/sites/og-fennic.png`
**Consumed by** nothing yet. There is no `openGraph` or `twitter` key anywhere in
`src/app/`, so every Slack, iMessage and X preview of this site is currently a
bare rectangle with the title and no image.

- **Format** PNG. JPEG is smaller, but banding across a flat terracotta field
  looks worse than the extra couple of hundred KB.
- **Intrinsic** 1200×630 (1.91:1). One file serves both `og:image` and
  `twitter:image` with `card: "summary_large_image"`.
- **Transparency** None — cards composite onto unknown backgrounds.
- **Safe padding** 80px on every edge. Some surfaces crop to 2:1, which takes
  ~45px off the top and bottom.
- **Light/dark behaviour** Pick one and commit; there is no media-query hook for
  OG images. Recommended: deep charcoal `#1C1613` ground, warm off-white
  wordmark, terracotta accent. Dark cards read as deliberate in both light and
  dark clients, whereas light cards look washed out in dark ones.
- **Minimum legible size** Any type on it must survive being shown ~360px wide in
  a mobile chat thread — so ≥48px type at 1200 wide.
- **Art direction** Wordmark upper-left, one line of positioning copy, generous
  empty space, the fox at low opacity bleeding off the right edge. Not a
  screenshot of the app; that is unreadable at preview size.

Once the file exists, add to the `metadata` export in `src/app/layout.tsx`:

```ts
openGraph: {
  title: "Fennic AI",
  description: "…",
  url: "https://fennic.ai",
  images: [{ url: "/sites/og-fennic.png", width: 1200, height: 630 }],
},
twitter: {
  card: "summary_large_image",
  images: ["/sites/og-fennic.png"],
},
```

## 6. Explore card artwork — Kimi's content

**Path** `public/sites/kimi-com-185e587f/root-8a5edab2/cards/*.png` — 21 files.
**Consumed by** `explore-data.ts` → `InspirationSection.tsx`, in an
`aspect-[233/136]` box with `sizes="(min-width: 768px) 234px, 150px"`.

- **Format** A trap worth knowing: these carry a `.png` extension but the bytes
  are **JPEG** (`ffd8ffe0…` JFIF). That is how Kimi's CDN served them and the
  scrape preserved the URL verbatim. `next/image` re-encodes either way so
  nothing breaks — just don't trust the extension when you write tooling.
- **Intrinsic** 16:9, measured across the set as 1000×563 (7 files), 1280×720
  (9), 1920×1080 (4) and 1200×675 (1). Target 1280×720 for new art.
- **Rendered** 234×137 desktop, 150×88 mobile. The 233:136 box is a hair taller
  than 16:9, so a few pixels come off the sides — keep the subject centred.
- **Transparency** None. The box supplies its own `--fennic-placeholder-bg` fill
  and a `--fennic-line` border.
- **Light/dark behaviour** Frame and hover state are tokenised and adapt on their
  own; the art does not. Favour mid-tone images so a card doesn't read as a
  bright hole in dark mode or a dark blot in light mode.
- **Art direction** These are meant to be *outputs* — a screenshot of something
  Fennic actually made — not marketing illustration. Replace them as real work
  accumulates rather than commissioning art up front.

## 7. Showcase section icons — two now orphaned

**Path** `public/sites/kimi-com-185e587f/root-8a5edab2/showcase/*.svg`
**Consumed by** the `icon` field on each `EXPLORE_SECTIONS` entry, at 24×24.

Five files on disk: `deep-research.svg`, `doc.svg`, `swarm.svg`, `website.svg`,
`xlsx.svg`. Three are live. `doc.svg` and `swarm.svg` belonged to the Docs and
Agent Swarm sections this work removed from `explore-data.ts`, so they are now
unreferenced — kept as extraction provenance, same as the eight de-registered
icons under `icons/`.

- **Format** SVG, using `currentColor` so the token system can drive the fill.
- **Rendered** 24×24 beside the section heading.
- **Light/dark behaviour** Anything on `currentColor` inherits correctly.
  Hardcoded fills in the Kimi-era files will not adapt — worth converting the
  next time you touch one. The registry icons under `icons/` have already had
  this done: `not-login.svg` was the only one of the 18 painted in literal
  `rgba()` rather than `currentColor`, and `tokenizePaint()` in
  `scripts/gen-icons-kimi-com-185e587f.mjs` now re-expresses it. See section 8.
- **Art direction** Single-weight line icons, 1.5px stroke at 24px, matching the
  18 icons already in the registry. Don't mix in filled glyphs.

## 8. Registry icons — tokenised, no drop path

**Path** `public/sites/kimi-com-185e587f/root-8a5edab2/icons/*.svg` → compiled
into `icons.tsx` by `scripts/gen-icons-kimi-com-185e587f.mjs`.

Not images in the `public/` sense — inline SVG, 18 of the 28 scraped files. They
are listed here because two of them needed brand work that is invisible in a
passing build, and both fixes live in the generator, never in `icons.tsx` (which
is stamped DO NOT EDIT BY HAND and overwritten on every run).

- **Paint** All 18 now resolve through the token system. `not-login.svg` was the
  sole exception — a 5.1% black disc, a 14.9% black head-and-shoulders, and two
  eyes knocked out in `rgba(238, 237, 235, 0.902)`. On `#1C1613` the two black
  layers were black-on-black and the avatar collapsed to two floating dots. The
  disc and silhouette now take `fill="currentColor"` with their original alphas
  as `fill-opacity`; the eyes take `stroke="var(--fennic-ground)"`, the ground
  the sidebar footer actually paints. `fill-opacity` rather than
  `color-mix(in srgb, currentColor 5.1%, transparent)` because presentation-
  attribute support for `color-mix()` is a browser-version question and
  `fill-opacity` is universal.
- **Geometry** Kimi's animated icons ship an `idle` and an `enter` layer; the
  idle CSS rules set `transform-box`/`transform-origin` but leave the transform
  itself to a Vue runtime we do not have, so paths authored around the origin
  fell outside the 24×24 viewBox and were clipped. `placeIdleLayer()` recovers
  the resting pose from the matching enter keyframe's last stop (the enter
  animation is `fill-mode: forwards`, so its 100% *is* the idle pose). Affects
  Deep Research, Websites, Sheets and Hide sidebar — 9 paths across 4 icons,
  which without the fix render as bare frames.
- **Light/dark behaviour** `currentColor` throughout, so callers control colour
  with `text-*` utilities and both modes follow automatically.
- **If you re-scrape** the generator asserts 18 registry files and exactly 10
  paint values to tokenize (each of not-login's five paths appears twice, once
  per animation layer). A re-scrape that reformats those attributes fails the
  build loudly rather than silently shipping a black-on-black avatar.

## 9. Plugin logos — not shipped, monogram fallback in place

**Path to create** `public/sites/kimi-com-185e587f/root-8a5edab2/plugins/<slug>.svg`
**Consumed by** the `logo` field on each entry in `src/lib/workspace/catalog.ts`,
rendered by `PluginCard` in the workspace panel's Plugins tab at 40×40.

No entry sets `logo` today, so all eighteen render `MonogramTile` — two initials
on the accent wash. That is deliberate, not a stub: these are third-party brands
(GitHub, Figma, Stripe, Wind, Caixin, PubMed …) and inventing a mark for someone
else's company is worse than plainly not having one. Add real files only where
you have the right to use them.

- **Format** SVG where the vendor publishes one; PNG at 128×128 otherwise. Most
  brand kits ship SVG.
- **Intrinsic** 128×128 — 3.2× the 40px render, which covers a 3× phone.
- **Transparency** Required. The card supplies the tile: `--fennic-border` ring
  on `--fennic-accent-soft`. A logo with its own white square will read as a
  bright patch in dark mode.
- **Safe padding** Keep the mark inside the centre 80% (≈13px of the 128 clear on
  each side). The tile has a 10px radius at render size and corners get clipped.
- **Light/dark behaviour** This is the trap. Vendor logos are usually authored
  for light backgrounds and a monochrome black mark vanishes on `#1C1613`.
  Options, best first: (a) use the vendor's own light-on-dark variant and ship
  both as `<slug>.svg` / `<slug>-dark.svg`, (b) use a full-colour mark that
  clears both, (c) leave it on the monogram, which is already correct in both.
- **Minimum legible size** 24px. Below that the tile is more legible than any
  logo, so keep the monogram for compact lists.
- **Art direction** None to apply — these are other people's marks, used as
  published. Do not re-tint them to the Fennic palette; that misrepresents them.

## 10. Self-growth clip — animated in code, not shipped

**Paths to create** `…/root-8a5edab2/video/self-growth.webm` and `…/self-growth.mp4`
**Consumed by** `SelfGrowthMedia`'s optional `videoSrc` prop, on the My Fennic
tab beside "Fennic can now learn and grow on its own".

The reference for this panel is a short looping video of a dot matrix pulsing
around a bright core. There is no clip in the repo and no encoder on this machine
(`ffmpeg` is absent), so rather than point a `<video>` at a 404 the component
draws the same motion natively: 209 SVG circles in five distance bands, a 6s
breathe on the group and a low-amplitude shimmer on the inner bands. It is
deterministic (index arithmetic, never `Math.random()`) so it cannot hydrate
differently from the server render.

**To switch to a real clip:** drop the files in and pass the prop —

```tsx
<SelfGrowthMedia videoSrc="/sites/kimi-com-185e587f/root-8a5edab2/video/self-growth.webm" />
```

in `MyFennicTab.tsx`. The component keeps the drawn animation as the zero-config
path, so neither branch can render an empty box.

- **Format** WebM (VP9) as the primary, MP4 (H.264 High) as the fallback — Safari
  still wants MP4. Ship both; the component takes one `src`, so widen it to a
  `<source>` pair when you add the second file.
- **Intrinsic** 1080×624 (the drawn version's 532×308 viewBox at 2×). Loop length
  4–8s, seamless — a visible cut is worse than no motion.
- **Weight** Keep each under 400 KB. It autoplays on a settings-ish panel; it is
  not worth a megabyte.
- **Attributes** `autoPlay muted loop playsInline` — all four. Without `muted`
  and `playsInline`, iOS refuses to autoplay and shows a play button instead.
- **Transparency** None; encode the ground in. But then it is ground-specific,
  which is the catch below.
- **Light/dark behaviour** The real problem with using a video here. A clip bakes
  its background, and this panel is `--fennic-ground` — `#F7F5F3` in light,
  `#1C1613` in dark. One clip cannot serve both: on the wrong ground it reads as
  a rectangle pasted onto the card. So either ship two files and pick with a
  `matchMedia("(prefers-color-scheme: dark)")` read, or keep the drawn version,
  which follows the tokens for free. The drawn version is recommended for exactly
  this reason.
- **Reduced motion** Honour it. The drawn version already does, via
  `@media (prefers-reduced-motion: reduce)`. A video needs the same treatment —
  drop `autoPlay` and show the poster frame.
- **Art direction** Terracotta accent body, a small cream specular highlight
  off-centre, and an outer field that recedes to almost nothing so the shape
  reads as a ball rather than a grid. Getting that falloff wrong was the one real
  defect in the drawn version: a fixed low alpha is invisible on off-white and
  clearly visible on charcoal, so the field uses `--fennic-placeholder-bg`, which
  is defined per mode to be barely-there on either.

---

## Do this next

Ordered by what is most visibly wrong today.

1. **Social card** — `public/sites/og-fennic.png` at 1200×630, then the
   `openGraph` + `twitter` block in `layout.tsx`. Highest impact: right now every
   share of this site previews as nothing at all.
2. **Favicons** — three `.ico` files, each packing 16/32/48. The browser tab is
   the most-seen surface still carrying Kimi's mark.
3. **Apple touch / PWA** — replace `pwa-192.png`, add `pwa-512.png` inside the
   80% maskable safe area, then a `webmanifest` to point at it.
4. **Explore card art** — swap Kimi's 21 screenshots for Fennic outputs as they
   exist. Cosmetic until the site is public.
5. **Plugin logos** — §9. Optional: the monogram tiles are correct in both modes,
   so this is a polish item, and only for vendors whose marks you may use.
6. **Self-growth clip** — §10. Also optional, and arguably a downgrade: a video
   bakes its background and this panel's ground flips with the colour scheme.

Done: the dark-mode wordmark. It shipped as `fennic-text-dark.png` plus the
`<picture>` swap described in section 2, and `scripts/drive-kimi-clone.mjs`
asserts the resolved `currentSrc` per colour scheme so a regression fails the
driver instead of waiting to be noticed.

## Known Kimi-era leftovers

Files still on disk that are no longer Fennic's, listed so nobody mistakes them
for live brand assets:

- `…/brand/kimi-logo.png` — 112×112, Kimi's black "K" tile. Superseded by
  `fennic-mark.png`; nothing imports it.
- `…/brand/kimi-doodle.png` — 800×160, the original "KIMI" hero doodle.
  Superseded by `fennic-text.png`. Worth keeping: its 154×44 ink box is the
  measurement the Fennic wordmark is matched against.
- `public/sites/favicon*.ico` and `public/sites/pwa-192.png` — Kimi's, still
  referenced by `layout.tsx`. Left in place deliberately so nothing 404s; items
  2 and 3 above replace them.
- `…/icons/` — still holds all 28 scraped SVGs, including the eight
  de-registered ones (`claw-more`, `docs`, `kimi-claw`, `kimi-code`, `kimi-work`,
  `scheduled-tasks`, `slides`, `swarm`). They are listed in `EXCLUDE` in
  `scripts/gen-icons-kimi-com-185e587f.mjs` and no longer compiled into
  `icons.tsx`, so they cost nothing at runtime.

The directory names (`kimi-com-185e587f/root-8a5edab2/`) and the `Kimi*`
component and type identifiers are intentional and should stay — they key the
clone to its `docs/research/` provenance.
