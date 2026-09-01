# Sidebar — the 240px aside (shell, header, New Chat row, footer)

**Screenshots:**
- `../../../../design-references/kimi-com-185e587f/root-8a5edab2/desktop-sidebar.png`
- `../../../../design-references/kimi-com-185e587f/root-8a5edab2/desktop-initial.png`

**Output path:** `src/components/sites/kimi-com-185e587f/root-8a5edab2/Sidebar.tsx`

## Structure (from the live DOM)

```
<aside class="sidebar-slot">            width 240, bg #fbfaf9, flex column
├── .sidebar-header        240x56, padding 15px 10px 9px 16px, flex align-center
│   ├── <a> logo link     32x32 (image 28x28 inside), href "/"
│   └── hide-sidebar btn  32x32, radius 8px, color rgba(0,0,0,0.9)
├── .sidebar-new-chat      240x52, padding 6px 8px 0
│   └── <a class="new-chat-btn"> 224x46 — see below
├── .sidebar-nav           flex-1, overflow-y-auto (renders <SidebarNav />)
└── .next-sidebar__footer  240x60 — see below
```

## Exact CSS values

`aside`
- width: 240px; flex-shrink: 0; background: `#fbfaf9` (`bg-kimi-ground`); border: none; display: flex; flex-direction: column; height: 100%
- Do NOT add the slide/collapse transform here — AppShell owns it (aside translated x=−240 when collapsed).

`.sidebar-header` — 240×56, padding `15px 10px 9px 16px`, display flex, align-items center, justify-content space-between
- Logo link: 32×32 flex center, contains `next/image` of the brand mark (28×28). Original: `brand/kimi-logo.png` (124×124, a dark rounded app-icon tile). **Shipped: `brand/fennic-mark.png`** — a 112×112 square crop of `src/UI Components/fennic ai icon.png` keeping the fox's own black ground (fox at ~72% coverage, matching how much of Kimi's tile its "K" fills), corners rounded in CSS with `rounded-[8px]`. Built by `scripts/brand-fennic-assets.mjs`.
- Hide Sidebar button: 32×32, border-radius 8px, background transparent, color `rgba(0,0,0,0.9)`; **hover: bg `rgba(0,0,0,0.03)`** (`bg-kimi-hover`), transition background-color 0.15s; content = `KimiIcon name="hide-sidebar" size={20}`. Calls `props.onCollapse()`.

`.sidebar-new-chat` — 240×52, padding `6px 8px 0`

`a.new-chat-btn` (224×46)
- border-radius: 12px; background: `#ffffff`; color: `rgba(0,0,0,0.9)`; font: 14px/400
- transition: `box-shadow 0.15s, background-color 0.15s`; hover: background `rgba(0,0,0,0.03)` + box-shadow `rgba(0,0,0,0.05) 0px 2px 8px 0px`
- Inner content span (222×44): padding `12px 8px`, display flex, align-items center, justify-content space-between
  - Left `.action-label`: flex align-center gap 6px → `KimiIcon name="new-chat" size={18}` + text "New Chat" (14px, weight **500**, line-height 20px, color rgba(0,0,0,0.9))
  - Right `.action-opts`: flex align-center — two kbd chips:
    - "Ctrl" chip 30×20, "K" chip 20×20; both: padding `0 4px`, border-radius 4px, background `rgba(0,0,0,0.05)`, color `rgba(0,0,0,0.45)`, font 14px/400, line-height 20px, display inline-flex, align-items center, justify-content center

`.next-sidebar__footer` (240×60)
- `.footer-content`: 240×60, padding 8px, bg `#fbfaf9`; inside it `.user-area` 224×44 flex align-center
- **Log in button** `button.user-info-container` 180×44: padding 8px, border-radius 12px, flex `1 1 0%`, align-items center, background transparent, color `rgba(0,0,0,0.9)`; hover bg `rgba(0,0,0,0.03)` (verified), transition background-color 0.15s
  - `.user-info` 164×28: flex align-center gap 8px
    - `span.not-login-icon` 28×28, border-radius 50% (circle), flex center → `KimiIcon name="not-login" size={28}` (this SVG contains SMIL `<animate>` elements — it is animated in the original; keep the raw markup so animation survives)
    - `span.user-name` "Log in": 14px / weight 500, line-height 20px, color `rgba(0,0,0,0.9)`
- **Get App button** `button.user-icon-button` 44×44: padding 13px, border-radius 12px, color `rgba(0,0,0,0.45)`, flex center → `KimiIcon name="get-app" size={18}`

## Content

Real labels: "New Chat", "Ctrl", "K", "Log in", logo alt "Fennic" (the original's is "Kimi").

## Interaction model

INTERACTION MODEL: click-driven (hide-sidebar button → `onCollapse()`; all other elements are inert links/buttons — New Chat and Log In render as buttons/links without navigation in the clone).

## Responsive behavior

- At < 1024px the aside is off-canvas via AppShell CSS — no internal changes.

## Implementation notes

- Client component (`"use client"`), props: `{ onCollapse: () => void }`.
- Import `SidebarNav` from `./SidebarNav` for the scrollable middle region; it takes no props.
- `.sidebar-nav` middle region: flex 1, overflow-y auto, min-height 0 (so the 100vh column layout scrolls only here).
- No mask/gradient overlays needed — `.top-mask` renders 0-height in the original.
