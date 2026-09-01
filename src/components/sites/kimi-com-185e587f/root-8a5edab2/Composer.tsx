"use client";

// Composer — the chat editor box per
// docs/research/kimi-com-185e587f/root-8a5edab2/components/Composer.md
// Self-contained state: input value, focus, model menu, selected model.

import { useState } from "react";
import { KimiIcon } from "./icons";
import ModelMenu from "./ModelMenu";

export default function Composer() {
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const [modelOpen, setModelOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState("Instant");

  const hasText = value.length > 0;

  return (
    <div className="mx-auto w-full max-w-[337px] md:max-w-[768px]">
      <div
        className={`flex h-[130px] flex-col justify-between rounded-[24px] border bg-kimi-panel transition-[border-color,box-shadow] duration-150 ${
          focused
            ? "border-[rgba(0,0,0,0.173)] shadow-kimi-composer-focus"
            : "border-kimi-line shadow-kimi-composer"
        }`}
      >
        <textarea
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Ask anything, or task an agent..."
          aria-label="Chat message"
          className="flex-1 resize-none bg-transparent px-4 pt-3 pb-2.5 text-base leading-6 text-kimi-primary outline-none placeholder:text-kimi-tertiary"
        />
        <div className="mt-0.5 mb-2 flex h-9 items-center justify-between px-2">
          <button
            type="button"
            aria-label="Attach"
            className="flex h-9 w-9 items-center justify-center rounded-[20px] text-kimi-tertiary transition-colors duration-150 hover:bg-kimi-hover hover:text-kimi-primary"
          >
            <KimiIcon name="attach" size={18} />
          </button>
          <div className="flex items-center gap-1">
            <div className="relative">
              <button
                type="button"
                onClick={() => setModelOpen((open) => !open)}
                aria-haspopup="menu"
                aria-expanded={modelOpen}
                className="flex h-9 items-center gap-1 rounded-[20px] px-2.5 transition-colors duration-150 hover:bg-kimi-hover"
              >
                <span className="text-sm text-kimi-primary">{selectedModel}</span>
                <span className="text-sm text-kimi-tertiary">High</span>
                <KimiIcon name="model-chevron" size={16} className="text-kimi-tertiary" />
              </button>
              <ModelMenu
                open={modelOpen}
                selected={selectedModel}
                effort="High"
                onSelect={(name) => {
                  setSelectedModel(name);
                  setModelOpen(false);
                }}
                onClose={() => setModelOpen(false)}
              />
            </div>
            <button
              type="button"
              aria-label="Send"
              onClick={() => {
                if (hasText) setValue("");
              }}
              className={`flex h-9 w-9 items-center justify-center rounded-[22px] text-kimi-icon-inverse transition-colors duration-150 ${
                hasText ? "bg-kimi-send-enabled" : "bg-kimi-send-disabled"
              }`}
            >
              <KimiIcon name="send-arrow" size={28} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
