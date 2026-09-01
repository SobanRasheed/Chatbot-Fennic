"use client";

// FloatingChatButton — "Chat with Kimi" back-to-top pill per
// docs/research/kimi-com-185e587f/root-8a5edab2/components/FloatingChatButton.md
// Visibility is computed by the page: scrollTop >= stickySpaceEl.offsetHeight.

export interface FloatingChatButtonProps {
  visible: boolean;
  onBackToTop: () => void;
  collapsed?: boolean;
}

function UpArrowIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className="shrink-0"
    >
      <path
        d="M15 4h5v5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20 4L9 15"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17.5 19.5h-11a2 2 0 0 1-2-2v-11"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function FloatingChatButton({
  visible,
  onBackToTop,
  collapsed = false,
}: FloatingChatButtonProps) {
  return (
    <div
      className={`fixed bottom-8 left-[6px] right-[6px] z-[12] flex items-center justify-center transition-all duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] ${
        collapsed ? "" : "lg:left-[240px]"
      } ${visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0"}`}
    >
      <button
        type="button"
        onClick={onBackToTop}
        className="relative flex h-11 w-[162px] items-center justify-center gap-1.5 rounded-[28px] border border-kimi-panel bg-white/70 pr-4 pl-3 text-kimi-primary shadow-kimi-floating transition-colors duration-150 hover:bg-white/90"
      >
        <UpArrowIcon />
        <span className="text-base font-medium">Chat with Kimi</span>
        {/* inset highlight overlay */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-[1px] rounded-[28px] shadow-[inset_0.5px_0.5px_1px_0_rgba(255,255,255,0.42)]"
        />
      </button>
    </div>
  );
}
