# Composer — the chat editor box (hero centerpiece)

**Screenshots:**
- `../../../../design-references/kimi-com-185e587f/root-8a5edab2/desktop-composer-resting.png`
- `../../../../design-references/kimi-com-185e587f/root-8a5edab2/desktop-composer-focused.png`
- `../../../../design-references/kimi-com-185e587f/root-8a5edab2/mobile-composer.png`

**Output path:** `src/components/sites/kimi-com-185e587f/root-8a5edab2/Composer.tsx`

## Structure (from the live DOM)

```
<div class="chat-editor">                     768x130 desktop / 337x130 mobile
├── .chat-editor-content                      the rounded box
│   └── <textarea>                            Ask anything, or task an agent...
└── .chat-editor-action                       36px bottom bar
    ├── left:  attach button 36x36
    └── right: model toggle 118x36  +  send button 36x36
```

## Exact CSS values

`.chat-editor` — width 768px (max-width 100%), no outer margin.

`.chat-editor-content` (the box)
- background: `#ffffff`; border-radius: **24px**; height 130px; display flex; flex-direction: column; justify-content: space-between
- **Resting:** border 1px solid `rgba(0,0,0,0.13)` (`border-kimi-line`); box-shadow `rgba(0,0,0,0.07) 0px 5px 16px -4px` (`shadow-kimi-composer`)
- **Focused:** border-color `rgba(0,0,0,0.173)`; box-shadow `rgba(0,0,0,0.03) 0px 4px 12px 0px, rgba(0,0,0,0.07) 0px 5px 16px -4px` (`shadow-kimi-composer-focus`)
- transition: border-color 0.15s, box-shadow 0.15s

`<textarea>`
- flex: 1; padding `12px 16px 10px`; background transparent; border: none; outline: none; resize: none
- font: **16px / 24px**, color `rgba(0,0,0,0.9)`
- placeholder: `Ask anything, or task an agent...` — color `rgba(0,0,0,0.45)` (use `::placeholder` styling)

`.chat-editor-action` (bottom bar)
- height 36px; padding `0 8px`; display flex; align-items center; justify-content space-between; margin `2px 0 8px` (measured — 2px above, 8px below)

Left — attach/toolkit button
- 36×36, border-radius **20px**, background transparent, color `rgba(0,0,0,0.45)`; hover: bg `rgba(0,0,0,0.03)`, color `rgba(0,0,0,0.9)`; transition 0.15s
- content: `KimiIcon name="attach" size={18}`

Right group — flex align-center gap 4px:

`.current-model` (model toggle, a button) 118×36
- border-radius **20px**; padding `0 10px`; display flex; align-items center; gap 4px
- name (e.g. "Instant"): 14px, color `rgba(0,0,0,0.9)`
- effort (e.g. "High"): 14px, color `rgba(0,0,0,0.45)`
- chevron: `KimiIcon name="model-chevron" size={16}` color `rgba(0,0,0,0.45)`
- hover: bg `rgba(0,0,0,0.03)`; transition 0.15s
- onClick → opens `ModelMenu` (see that spec; contract: `{ open, selected, effort, onSelect, onClose }` — Composer holds the state and renders ModelMenu in a wrapper below the toggle)

Send button 36×36
- border-radius: **22px**; flex center; content `KimiIcon name="send-arrow" size={28}`
- **Disabled (empty input):** background `rgba(0,0,0,0.15)` (`bg-kimi-send-disabled`), icon color `rgba(255,255,255,0.9)`
- **Enabled (has text):** background `rgba(0,0,0,0.9)` (`bg-kimi-send-enabled`), icon color `rgba(255,255,255,0.9)`
- transition: background-color 0.15s
- onClick in the clone: clears the textarea (no real send).

## Interaction model

INTERACTION MODEL: click + focus-driven.
- Focus/blur of the textarea toggles the focused border+shadow state.
- Typing toggles send button disabled/enabled.
- Model toggle click opens/closes the ModelMenu popover (anchored below the toggle, right-aligned); selection updates the toggle's name/effort text and closes the menu; clicking outside closes it (invisible overlay or `onBlur` capture; keep it simple and reliable).
- Attach button: inert (no menu in the clone).

## Responsive behavior

- Root: `mx-auto w-full max-w-[337px] md:max-w-[768px]` (mobile column 337px, desktop 768px — the page centers it inside the chat-box).
- Mobile: same heights/radius. The bottom bar is identical.

## Implementation notes

- Client component. No props — self-contained state (value, focused, model open, selected model, effort).
- Export the component as `Composer`.
- Model options come from a local const typed `KimiModelOption[]` (from `@/types/kimi-com-185e587f`):
  - `{ name: "Instant", description: "Fast chat, quick replies" }` (default selected)
  - `{ name: "K3", description: "Chat & Agent, flagship all-rounder" }`
  - `{ name: "K3 Swarm", description: "Massive search, batch processing, and more in one go" }`
  - effort: `"High"` for all.
- Do not render ModelMenu inside this file — import from `./ModelMenu`.
