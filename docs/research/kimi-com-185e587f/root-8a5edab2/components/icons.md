# KimiIcons — icon registry

**Screenshots:** `../../../../design-references/kimi-com-185e587f/root-8a5edab2/desktop-initial.png` (icons in situ)
**Output path:** `src/components/sites/kimi-com-185e587f/root-8a5edab2/icons.tsx`

## Goal

A single registry component that renders every inline SVG icon extracted from kimi.com, preserving `currentColor` inheritance and embedded CSS animations. 26 icons were extracted to `public/sites/kimi-com-185e587f/root-8a5edab2/icons/*.svg` — including two large animated ones (`swarm.svg` ~227KB, `kimi-work.svg` ~132KB).

## Approach — generate, don't hand-copy

Write a one-off generation script `scripts/gen-icons-kimi-com-185e587f.mjs` (commit it) that reads every `.svg` in `public/sites/kimi-com-185e587f/root-8a5edab2/icons/` **EXCEPT `icon-explore-light.svg` and `icon-recommend-light.svg`** (those two are images rendered via `next/image` by the ExploreButton, not registry icons) and emits `icons.tsx` containing a record of raw SVG strings. For each SVG string the script must, on the ROOT `<svg>` tag only:

1. Remove the `width="…"` and `height="…"` attributes (keep `viewBox`).
2. Remove any `class="…"` / `data-*` / `style` attributes on the root tag.
3. Inject `style="width:100%;height:100%;display:block"` into the root tag.

Do NOT touch anything inside the tag (embedded `<style>` blocks contain scoped keyframe animations with `#id` selectors — they must survive verbatim).

The component:

```tsx
export type KimiIconName = "hide-sidebar" | "new-chat" | ... // all 26, derived from filenames
export function KimiIcon({ name, size = 18, className }: {
  name: KimiIconName; size?: number; className?: string;
}): JSX.Element
```

Render: a `<span>` with `style={{ width: size, height: size, display: "inline-flex", flexShrink: 0, lineHeight: 0 }}` and `dangerouslySetInnerHTML={{ __html: SOURCES[name] }}` plus the passed `className` (callers add `text-kimi-secondary` etc. to control color — the SVGs use `currentColor`).

The SVG markup is static content extracted by us from the live site — `dangerouslySetInnerHTML` is acceptable here. Add a short comment in the file saying exactly that and pointing at the generator script.

## Icon inventory (name → where it is used, default render size)

| name | used by | size |
|---|---|---|
| hide-sidebar | sidebar header collapse button | 20 |
| new-chat | sidebar "New Chat" row | 18 |
| my-kimi, plugins, scheduled-tasks, slides, swarm, deep-research, docs, websites, sheets, design | sidebar nav links | 18 |
| kimi-work (animated) | sidebar nav "Kimi Work" (Beta) | 18 |
| kimi-code | sidebar nav "Kimi Code" | 18 |
| kimi-claw, claw-more | sidebar "Kimi Claw" row | 18 / 15 |
| projects-chevron | sidebar Projects section expander | 14 |
| new-project | sidebar "New project" button row | 18 |
| collapse | sidebar "Collapse" more-row | 20 |
| collapse-chevron | chevron beside Collapse when expanded | 18 |
| not-login | "Log in to sync chat history" prompt icon | 28 |
| get-app | sidebar footer "Get App" | 18 |
| attach | composer toolkit button | 18 |
| model-chevron | composer model toggle | 16 |
| send-arrow | composer send button | 28 |
| explore-chevron | explore button double-chevron | 16 |

The logo is NOT an inline SVG and gets no registry entry — consumers use `next/image` directly. The original is `public/sites/kimi-com-185e587f/root-8a5edab2/brand/kimi-logo.png` (124×124, displayed at 28px); the clone ships `brand/fennic-mark.png` in its place (see Sidebar.md).

## Acceptance

- `npx tsc --noEmit` passes.
- `KimiIcon` renders at requested size with color inherited from the parent's text color.
- The two animated icons animate (their embedded keyframes run) when rendered.
- No icon markup is hand-edited — byte-identical (post root-tag transform) to the extracted files.
