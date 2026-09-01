# FloatingChatButton — "Chat with Kimi" pill (back-to-publisher)

**Screenshot:** `../../../../design-references/kimi-com-185e587f/root-8a5edab2/desktop-floating-button.png`
**Output path:** `src/components/sites/kimi-com-185e587f/root-8a5edab2/FloatingChatButton.tsx`

## Structure (from the live DOM, mounted state)

```
div.home-back-to-publisher-wrap     fixed, bottom 32px, left 240px, right 6px, z-index 12
└── button                          162x44, centered in the wrap
    ├── svg Up_c arrow              20x20
    ├── span "Chat with Kimi"       16px / 500
    └── span highlight overlay      160x42, inset highlight
```

## Exact CSS values

`.home-back-to-publisher-wrap`
- position: **fixed**; bottom: **32px**; left: **240px** (sidebar width — the desktop non-collapsed value); right: **6px**; z-index: **12**
- display flex; align-items center; justify-content center
- The page controls `left`: it must match the main panel's left edge (240px expanded / 6px collapsed / 6px mobile) — accept it as a prop or handle via CSS (see notes).
- **Visibility: visible when the scroll container's scrollTop ≥ the sticky-space element's height** (754px at 1440×900 — the formula is container height − 132; measured: off at 754, on at 900 at 900vp; off at 490, on at 500 at 641vp). The page computes this and passes `visible`. Transition in/out: fade + translateY, ~0.2s `cubic-bezier(0.23,1,0.32,1)` (`opacity` + `translateY(8px → 0)`).

`button`
- width **162px**; height **44px**; border-radius **28px**
- padding: `0 16px 0 12px`; display flex; align-items center; justify-content center; gap **6px**
- background: `rgba(255,255,255,0.7)`; border: 1px solid `#ffffff`
- box-shadow: `rgba(0,0,0,0.15) 0px 4px 15px 2px`
- color: `rgba(0,0,0,0.9)`
- hover: background `rgba(255,255,255,0.9)` (brightens); transition background-color 0.15s

Contents
- arrow icon: an inline SVG (drawn directly, 20×20, `currentColor`, stroke-width ~1.8) — an "up-left arrow in a rounded square" shape:
  ```html
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M15 4h5v5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M20 4L9 15" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M17.5 19.5h-11a2 2 0 0 1-2-2v-11" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
  ```
- label "Chat with Kimi": 16px / weight **500**
- highlight overlay span: absolutely positioned inset ~1px (160×42), border-radius 28px, box-shadow `rgba(255,255,255,0.42) 0.5px 0.5px 1px 0px inset`, pointer-events none

## Interaction model

INTERACTION MODEL: click-driven scroll trigger + scroll-driven visibility.
- Visible when `props.visible` is true (page computes: `scrollTop >= stickySpaceEl.offsetHeight`).
- Click calls `props.onBackToTop()` — the page smooth-scrolls the container back to top (`scrollTo({ top: 0, behavior: "smooth" })`).

## Responsive behavior

- Mobile: same button; the wrapper's left/right are 6px (no sidebar inset). The visibility threshold follows the mobile sticky-space height (714px at 390×844).

## Implementation notes

- Client component. Props: `{ visible: boolean; onBackToTop: () => void; collapsed?: boolean }`.
- When `!visible`, keep the element mounted but hidden (`opacity-0 pointer-events-none translate-y-2`) so the transition plays both ways — the original unmounts, but the transitioned version is visually identical and simpler.
- `left` offset — the FIXED contract: the wrap is `fixed bottom-8 left-[6px] right-[6px] z-[12] flex items-center justify-center`, plus `lg:left-[240px]` when NOT collapsed (i.e. `collapsed ? "" : "lg:left-[240px]"`). This tracks the sidebar exactly like AppShell's main-panel margin (240 expanded / 6 collapsed / 6 mobile). Do not invent other approaches.
