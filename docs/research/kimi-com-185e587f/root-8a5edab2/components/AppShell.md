# AppShell — application frame (sidebar slot + main panel + scroll container)

**Screenshots:**
- `../../../../design-references/kimi-com-185e587f/root-8a5edab2/desktop-initial.png` (expanded, desktop)
- `../../../../design-references/kimi-com-185e587f/root-8a5edab2/desktop-sidebar-collapsed.png` (collapsed)

**Output path:** `src/components/sites/kimi-com-185e587f/root-8a5edab2/AppShell.tsx`

## Structure (verified live chain, 1440×900)

```
div.app                                 flex, height 100vh, bg #fbfaf9
├── aside.sidebar-slot (<Sidebar />)    FIXED inset-y-0 left-0, w 240px, z-30 — NOT in flow
│                                       (main's margin-left: 240px reserves its space;
│                                        measured main starts at x=240, so the aside
│                                        cannot be an in-flow sibling)
└── div.main                            flex, relative, margin 6px 6px 6px 240px (collapsed: 6px)
    └── div.layout-container            relative, flex, THE ONLY SCROLL CONTAINER (overflow-y auto)
        └── {children}                  the page renders everything else inside
```

Live chain: `div.app > div.main [margin 6px 6px 6px 240px, h 888] > div.layout-container [relative, h 886] > …page content…`

The aside slides via `transform: translateX(-100%)` when hidden — the SAME mechanism serves desktop collapse and the mobile drawer:
- Desktop (≥1024px): expanded = `translate-x-0`; collapsed = `-translate-x-full`; main's `margin-left` animates 240px → 6px (both 0.3s ease-in-out)
- Mobile (<1024px): `-translate-x-full` by default; `translate-x-0` when `mobileNavOpen`; main margin stays 6px

**IMPORTANT — the 52px `layout-header` is NOT part of the shell.** It lives inside the page's sticky group (`div.layout-sticky-group`, sticky top 0) inside the scroll container, so it scrolls away with the hero. See `KimiHomePage.md` for the header.

## Exact CSS values

`.app`
- display flex; height 100vh (`h-screen`); background `#fbfaf9` (`bg-kimi-ground`)

`aside.sidebar-slot`
- `position: fixed; top: 0; bottom: 0; left: 0; width: 240px; z-index: 30; background: #fbfaf9`
- `transition: transform 0.3s ease-in-out`
- Visible/hidden via translate-x only (never unmount — keeps scroll position and animations)
- Mobile (<1024px): backdrop when open — `position: fixed; inset: 0; z-index: 29; background: rgba(0,0,0,0.3)`, opacity-fades with the same 0.3s ease-in-out; click closes. Render it always (opacity-0 + pointer-events-none when closed) so the fade plays both ways. Hidden entirely at ≥1024px.

`.main`
- flex 1; `min-width: 0`; `overflow: hidden` (so the 12px radius clips the scroll container); background `#ffffff` (`bg-kimi-panel`); border-radius 12px; border 1px solid `rgba(0,0,0,0.05)` (`border-kimi-border`)
- margin: `6px 6px 6px 240px` (desktop expanded); **collapsed: `margin-left: 6px`**; **transition: margin-left 0.3s ease-in-out**
- Mobile: margin `6px` all around, always (no sidebar inset)

`.layout-container`
- flex `1 1 0%`; `overflow-y: auto`; **`position: relative`** (the ICP footer `.home-legal-info` is absolutely positioned against it — see FooterBar.md)
- No padding, no border. `overscroll-behavior: contain` is a safe addition
- **This is the ONLY scroll container** — the document itself never scrolls

## Interaction model

INTERACTION MODEL: click-driven (sidebar collapse + mobile drawer) + native scroll (children).

- Props: `{ collapsed: boolean; onCollapse: () => void; mobileNavOpen: boolean; onCloseMobileNav: () => void; scrollContainerRef: React.RefObject<HTMLDivElement | null>; children: React.ReactNode }`
- `onCollapse` is passed to `<Sidebar onCollapse={…} />` (desktop hide-sidebar button)
- `mobileNavOpen` drives the mobile drawer + backdrop; `onCloseMobileNav` is wired to the backdrop click and to Sidebar's collapse on mobile
- `scrollContainerRef` is attached to `.layout-container` so the page can read scrollTop, drive smooth scrolls, and compute the FAB threshold

## Responsive behavior

- `< 1024px` (`< lg:`): aside off-canvas drawer (closed by default), main margin 6px, backdrop when open
- `≥ 1024px` (`lg:`): aside in-flow 240px, collapse state user-togglable via Sidebar's hide-sidebar button

## Implementation notes

- Client component (`"use client"`).
- Import `Sidebar` from `./Sidebar` (its spec: `Sidebar.md`).
- Font stack and body background are already global (`src/app/layout.tsx` + `globals.css` tokens) — do not re-declare.
- Do NOT render any header, footer, or page content here — children only. The header/FAB/footer all belong to the page (see `KimiHomePage.md`).
