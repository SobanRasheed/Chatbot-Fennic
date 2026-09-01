# KimiHomePage — page assembly (viewport-driven layout, sticky hero, lazy explore)

**Screenshots:** `../../../../design-references/kimi-com-185e587f/root-8a5edab2/` (desktop-initial.png, desktop-explore-open.png, mobile-initial.png, …)
**Output path:** `src/components/sites/kimi-com-185e587f/root-8a5edab2/KimiHomePage.tsx`
**Route:** rendered by `src/app/page.tsx` (replace the scaffold: `export default function Page() { return <KimiHomePage /> }`)

## Verified DOM tree (1440×900; every height below was measured live)

```
div.layout-container            ← AppShell's scroll container (relative, overflow-y auto)
└── div.layout-content          relative, flex column, min-h-full
    └── div.layout-content-main
        ├── div.layout-sticky-space      h 754 = 100vh − 146px   [flex column]
        │   └── div.layout-sticky-group  sticky top-0 z-[11] flex column, bg white — h 553 natural
        │       ├── div.layout-header    h 52 (grid, 3 cols, space-between)
        │       └── div.publisher-stage  flex column — h 501 natural (home-top + chat-box)
        │           ├── div.home-top     h 303 = (100vh − 294px)/2  [flex col justify-end items-center]
        │           │   └── div.home-banner   w-full flex justify-center mb-32px
        │           │       └── doodle <Image>  400×82
        │           └── div.chat-box     flex col justify-center — h 198 natural
        │               ├── <Composer />          768×130, mx-auto
        │               └── <ShortcutPills />     768×36, mt-32px mx-auto
        └── div.layout-content-body       mt −177 = calc(273px − 50vh)
            └── div.home-page             px-16px, relative, flex
                └── div.home-bottom       flex-1 flex column
                    ├── div.landing-area → div.home-explore-area   flex column
                    │   ├── div.home-explore-hero       flex col, min-h-[calc(50vh-141px)] → 309 @900
                    │   │   ├── div.home-explore-release-gap   h-48, mt-[calc(50vh-241px)] → 209 @900
                    │   │   └── div.home-explore-panel  768, mx-auto → <ExploreButton />
                    │   │       (hero min-h == gap-mt + gap-h + panel-h exactly: 209+48+52 = 309)
                    │   └── div.home-explore-list       768, mx-auto, relative, pb-[100px]
                    │       ├── div.home-explore-list-background  absolute top-0 inset-x-0 h-[223px]
                    │       │     linear-gradient(rgba(0,0,0,0.03) 13px, rgba(0,0,0,0) 223px)
                    │       │     opacity 1 pre-mount → 0 after mount (fade ~0.3s)
                    │       └── div.home-explore-list-content      ← <ExploreContent /> mounts here (lazy)
                    │           (pre-mount instead: spacer div h max(223px, (100vh − 641px)/2) —
                    │            the spacer element itself measures max(0px, (100vh − 641px)/2)
                    │            live, but the 223px gradient band floors the reserved height,
                    │            and the band is absolute so it contributes none of its own)
                    └── div.legal-footer--default   flex justify-center mb-8px opacity-70
                        └── span "AI-generated, for reference only"  12px/20px rgba(0,0,0,0.3), px-10px
[siblings inside layout-container:]
├── <FooterBar />               absolute bottom-[58px] left-4 right-4 z-10 (ICP links)
└── <FloatingChatButton />      fixed bottom-32px, left = sidebar-aware, right-6px, z-12
```

## Viewport-driven height formulas (the original sets these via JS; reproduce with CSS calc)

Container height = 100vh − 14px (main is `margin: 6px` + 1px borders top/bottom).

| Element | Desktop ≥768px | Mobile <768px | @1440×900 | @1440×800 | @390×844 | @390×700 |
|---|---|---|---|---|---|---|
| sticky-space | `h-[calc(100vh-146px)]` | `h-[calc(100vh-130px)]` | 754 | 654 | 714 | 570 |
| home-top | `h-[calc((100vh-294px)/2)]` | `h-[calc((100vh-271px)/2)]` | 303 | 253 | 286.5 | 214.5 |
| chat-box | natural (130+32+36=198) | natural (130+24+36=190) | 198 | 198 | 190 | 190 |
| content-body mt | `mt-[calc(273px-50vh)]` | `mt-[calc(243px-50vh)]` | −177 | −127 | −179 | −107 |
| release-gap | h-48, `mt-[calc(50vh-241px)]` | h-32, `mt-[calc(50vh-211px)]` | 209 | 159 | 211 | 139 |
| hero min-height | `min-h-[calc(50vh-141px)]` | `min-h-[calc(50vh-127px)]` | 309 | 259 | 295 | 223 |
| doodle | 400×82 | 337×69 | — | — | — | — |
| pills margin-top | 32px | 24px | — | — | — | — |
| home-page padding | px-16px | px-12px | — | — | — | — |
| pre-mount list spacer | `h-[max(0px,calc((100vh-641px)/2))]` | none (0) | 129.5 | 79.5 | 0 | 0 |

The spacer row is the height of the live *element*; the reserved space around it
is floored by the 223px gradient band, so the clone renders the pre-mount
placeholder as `h-[max(223px,calc((100vh-641px)/2))]` to reproduce live's
223px pre-mount scroll depth at 1440×900.

Every vh-scaled value above was measured live at BOTH heights per breakpoint — all slope exactly 0.5 (i.e. ±50px per ±100px of viewport height), confirming the `calc(±50vh ± const)` forms. The explore panel's bottom always lands on the scroll container's bottom edge (container = 100vh − 14px): panel bottom 893 @900 / 787 @800 / 837 @844 / 687 @700.

All other heights flow naturally. Do NOT set explicit heights on sticky-group, publisher-stage, chat-box, or hero beyond the min-heights above.

## Layout header (inside the sticky group)

- `div.layout-header`: h-[52px]; `display: grid; grid-template-columns: 1fr auto 1fr` (measured 584.5/0/584.5 — i.e. space-between); align-items center; padding 0
- `.header-left` (first cell): flex items-center. Contains a trigger wrapper `div` with `padding-left: 10px` holding the toggle button:
  - **32×32, border-radius 8px, color rgba(0,0,0,0.9), hover bg rgba(0,0,0,0.03), transition 0.15s**, content `KimiIcon name="hide-sidebar" size={20}` (the original uses the same LeftBar2 design for both expand and hamburger)
  - Desktop: rendered ONLY when `collapsed` (calls `onExpand`); hidden when expanded
  - Mobile: ALWAYS rendered (calls `onOpenMobileNav`)
- center/right cells: empty (render nothing)

## Sticky behavior

- `.layout-sticky-group`: `position: sticky; top: 0; z-index: 11; background: #ffffff` (bg required so the explore content slides UNDER it cleanly). It sticks for `space − group` px (201 @900) then scrolls away with the page. Do not make it fixed.
- The sticky group must be the ONLY child (visually) of sticky-space; nothing else inside the space.
- **`layout-content` is a plain `relative min-h-full` BLOCK — not flex.** The original's flex column would flex-shrink the sticky-space when content overflows; block flow gives the exact same rendering without that trap. Skip `layout-content-main` entirely (it exists in the original only as a flex-1/overflow-visible measuring box).
- **Column width strategy:** `home-page` is `px-3` mobile / `px-4` desktop (measured live: computed padding `0 12px` @390, `0 16px` @1440); every inner column element (panel, list, composer, pills — composer/pills own their own) uses `mx-auto w-full max-w-[337px] md:max-w-[768px]`. At 390px this yields exactly 337px; at 1440px exactly 768px.

## Interaction model

INTERACTION MODEL: click-driven (explore mount + scroll, back-to-top, sidebar toggles) + scroll-driven (FAB visibility).

State (all in this component, `"use client"`):
- `collapsed: boolean` (desktop sidebar; pass to AppShell + FAB left offset)
- `mobileNavOpen: boolean` (mobile drawer)
- `exploreMounted: boolean` (false initially; once true it STAYS true)
- `fabVisible: boolean`

Scroll wiring (on the container via `onScroll` or a listener on `scrollContainerRef.current`):
- `fabVisible = scrollTop >= stickySpaceEl.offsetHeight` (754 @900; 714 @mobile). Verified: off at 754/on at 900 (900vp), off at 490/on at 500 (641vp)
- Update on every scroll event (no throttle needed)

`onExplore` (ExploreButton click):
1. `setExploreMounted(true)` (first time) — the list-background fades to opacity 0 (~0.3s transition)
2. After the content is in the DOM (`requestAnimationFrame` twice or `setTimeout(…, 50)`), smooth-scroll: `container.scrollTo({ top: stickySpaceEl.offsetHeight + 80, behavior: "smooth" })` (verified 754+80 = 834 @900)
- Subsequent clicks just re-run the smooth scroll

`onBackToTop` (FAB click): `container.scrollTo({ top: 0, behavior: "smooth" })`

## FloatingChatButton placement

- Rendered as a sibling of `layout-content` (inside AppShell children), `fixed bottom-[32px] right-[6px]`, `left` = 240px (desktop expanded) / 6px (desktop collapsed) / 6px (mobile) — pass `collapsed` through and switch with `lg:` variants. z-12.

## Assets

- Doodle (original, kept for reference): `/sites/kimi-com-185e587f/root-8a5edab2/brand/kimi-doodle.png` (source 800×160, rendered 400×82 desktop / 337×69 mobile — hard-set both dimensions)
- **Shipped wordmark: `/sites/kimi-com-185e587f/root-8a5edab2/brand/fennic-text.png`**, rendered **166×44 desktop / 139×37 mobile** (`w-[139px] h-[37px]` / `md:w-[166px] md:h-[44px]`). Its ink height matches the doodle's measured 154×44 "KIMI" ink box, and the mobile step reuses the doodle's own 400→337 (×0.8425) shrink. Built by `scripts/brand-fennic-assets.mjs` from the `src/UI Components/Fennic Text.png` master — cream letterforms re-inked to the doodle's `#000000`, orange dot left alone, shipped 4× (664×176) so `next/image` has hi-DPI headroom. It replaced a traced SVG of the same art whose 2920 auto-traced paths carried grain into the letterforms at render size.
- Explore icons: `icons/icon-explore-light.svg`, `icons/icon-recommend-light.svg` (see ExploreButton.md)

## Responsive behavior

- `< 768px` (`< md:`): mobile column (mobile formulas above), sidebar = AppShell drawer, header hamburger, composer/pills/panel/list width 337px (100% minus home-page padding)
- `≥ 768px`: desktop formulas; widths 768px with `max-w-full mx-auto`

## Implementation notes

- `"use client"` — this component owns ALL page state and the scroll wiring.
- Imports: `AppShell`, `Composer`, `ShortcutPills`, `ExploreButton`, `ExploreContent` (from InspirationSection.tsx), `FloatingChatButton`, `FooterBar` — all from the same site directory.
- The gradient band div: `style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.03) 13px, rgba(0,0,0,0) 223px)" }}` + Tailwind for position/size; opacity from `exploreMounted ? "opacity-0" : "opacity-100"` with `transition-opacity duration-300`.
- `src/app/page.tsx` becomes a thin server wrapper: `import KimiHomePage from "@/components/sites/kimi-com-185e587f/root-8a5edab2/KimiHomePage"; export default function Page() { return <KimiHomePage />; }`
- Verify with `npx tsc --noEmit`.
- **Tailwind radius warning:** this project's shadcn base overrides the radius scale — `rounded-lg`=10px, `rounded-xl`=14px, `rounded-2xl`=18px, `rounded-3xl`=22px. ALWAYS use arbitrary values (`rounded-[12px]`, `rounded-[16px]`, `rounded-[24px]`) for Kimi radii.
- **Pre-mount scroll depth (resolved):** the original scrolls 223px pre-mount (before the first explore click). Reserving only the spacer's own live height (129.5 @1440×900) left the clone ~95px short, because the 223px gradient band is what actually floors the live reserved space while being absolutely positioned — it contributes no height of its own. The placeholder therefore reserves `max(223px, (100vh − 641px)/2)`, which reproduces 223px at 1440×900 and keeps the verified slope-0.5 spacer formula for viewports tall enough to exceed the band. Post-mount depths already matched exactly and are unaffected.
