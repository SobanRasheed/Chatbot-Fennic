# ModelMenu — the model-selection popover

**Screenshot:** `../../../../design-references/kimi-com-185e587f/root-8a5edab2/desktop-model-menu.png`
**Output path:** `src/components/sites/kimi-com-185e587f/root-8a5edab2/ModelMenu.tsx`

## Structure (from the live DOM, open state: 274×260.5 at x≈886, y≈487 — below-right of the toggle)

```
.kimi-menu                     274px popover
├── item: Instant    (checked)
├── item: K3
├── item: K3 Swarm
├── separator (1px)
└── row: "Thinking effort" + "High"
```

## Exact CSS values

`.kimi-menu` (popover)
- width: **274px**; background: `#ffffff`; border-radius: **16px**; padding: **8px**
- box-shadow: `rgba(0,0,0,0.13) 0px 0px 0px 0.5px inset, rgba(0,0,0,0.1) 0px 4px 16px 0px` (`shadow-kimi-menu` token)
- display: flex; flex-direction: column; gap 2px

Menu item (button) 258×~44
- width 258px (fills); border-radius: **10px**; padding: **8px**; display flex; align-items center; gap 8px; text-align left
- background transparent; hover: bg `rgba(0,0,0,0.03)`
- name: 14px/400, color `rgba(0,0,0,0.9)`
- description: 13px, color `rgba(0,0,0,0.45)`, line-height ~18px
- **Selected item:** shows a check mark at the left — a 16×16 check icon in `rgba(0,0,0,0.9)`; unselected items reserve the space (16px flex-shrink-0 empty span) so text aligns. (No extracted check SVG exists in the icon set — draw one inline: `<svg viewBox="0 0 16 16"><path d="M3 8.5l3.2 3.2L13 5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>`.)
- Layout per item: [check 16×16] [column: name over description]

Separator — height 1px, background `rgba(0,0,0,0.05)`, margin 4px 8px

"Thinking effort" row 258×**47.5**
- padding 0 8px with the row height pinned to 47.5px; border-radius 10px; flex align-center justify-space-between
- label "Thinking effort": 14px, color `rgba(0,0,0,0.6)`
- value "High": 14px, color `rgba(0,0,0,0.9)`
- static (not interactive in the clone)
- **Height reconciliation:** the popover's measured 274×260.5 is exact (`getBoundingClientRect`), and the other children are each pinned to measured CSS: padding 16 + items 54 + 54 + 72 (the K3 Swarm description wraps to two lines in a 218px text column) + four 2px gaps + separator 9 = 213. The residual 47.5 is this row, so the earlier "~36" note (which assumed bare 8px padding around a single 20px line) understated it. Setting it to 47.5 makes the clone's popover exactly 274×260.5.

## Content (real, exact)

- Instant — "Fast chat, quick replies" (selected by default)
- K3 — "Chat & Agent, flagship all-rounder"
- K3 Swarm — "Massive search, batch processing, and more in one go"
- Thinking effort · High

## Interaction model

INTERACTION MODEL: click-driven.
- Renders ONLY when `props.open` is true (Composer controls it).
- Clicking an item calls `props.onSelect(name)`; Composer updates state and closes.
- Click-outside closes: the menu wrapper listens for outside pointerdown when open.
- **Escape closes** while open (document `keydown`), alongside the outside-pointerdown listener; both are torn down when the menu closes.
- Enter animation: fade + slight translateY (original uses ~0.12s ease; `animate-in fade-in-0 zoom-in-[0.98]` style or a simple CSS keyframe is acceptable — keep it subtle).

## Responsive behavior

- Identical on mobile (274px popover, right-aligned to the toggle).

## Implementation notes

- Client component. Props contract:
  ```ts
  { open: boolean; selected: string; effort: string; onSelect: (name: string) => void; onClose: () => void }
  ```
- Position with `absolute right-0 top-[calc(100%+8px)]` inside a `relative` wrapper that Composer provides around the toggle. `z-20`.
- Return `null` when `!open`.
