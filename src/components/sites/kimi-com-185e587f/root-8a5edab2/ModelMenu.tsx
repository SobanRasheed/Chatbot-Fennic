"use client";

// ModelMenu — model-selection popover per
// docs/research/kimi-com-185e587f/root-8a5edab2/components/ModelMenu.md
// Rendered inside the Composer's relative wrapper around the model toggle.

import { useEffect, useRef } from "react";

export interface ModelMenuProps {
  open: boolean;
  selected: string;
  effort: string;
  onSelect: (name: string) => void;
  onClose: () => void;
}

const MODELS = [
  { name: "Instant", description: "Fast chat, quick replies" },
  { name: "K3", description: "Chat & Agent, flagship all-rounder" },
  {
    name: "K3 Parallel",
    description: "Massive search, batch processing, and more in one go",
  },
];

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden
      className="h-4 w-4 shrink-0 text-fennic-primary"
    >
      <path
        d="M3 8.5l3.2 3.2L13 5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ModelMenu({
  open,
  selected,
  effort,
  onSelect,
  onClose,
}: ModelMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    // Close on pointerdown outside the wrapper (the wrapper also holds the
    // toggle button, so clicking the toggle toggles instead of double-firing).
    const onPointerDown = (event: PointerEvent) => {
      const root = ref.current?.parentElement;
      if (root && !root.contains(event.target as Node)) onClose();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={ref}
      className="animate-in absolute right-0 top-[calc(100%_+_8px)] z-20 flex w-[274px] flex-col gap-0.5 rounded-[16px] bg-fennic-panel p-2 shadow-fennic-menu fade-in-0 duration-100"
    >
      {MODELS.map((model) => (
        <button
          key={model.name}
          type="button"
          onClick={() => onSelect(model.name)}
          className="flex w-full items-center gap-2 rounded-[10px] p-2 text-left transition-colors duration-150 hover:bg-fennic-hover"
        >
          {selected === model.name ? (
            <CheckIcon />
          ) : (
            <span className="h-4 w-4 shrink-0" aria-hidden />
          )}
          <span className="flex flex-col">
            <span className="text-sm text-fennic-primary">{model.name}</span>
            <span className="text-[13px] leading-[18px] text-fennic-tertiary">
              {model.description}
            </span>
          </span>
        </button>
      ))}
      <div className="mx-2 my-1 h-px bg-fennic-border" />
      {/* Height pinned to live: the popover measures 274×260.5, and the other
          children account for 213px, so this row is 47.5 — the spec's "~36"
          note underestimated it. */}
      <div className="flex h-[47.5px] items-center justify-between rounded-[10px] px-2">
        <span className="text-sm text-fennic-secondary">Thinking effort</span>
        <span className="text-sm text-fennic-primary">{effort}</span>
      </div>
    </div>
  );
}
