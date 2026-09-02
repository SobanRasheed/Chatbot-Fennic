"use client";

// ProfileMenu — the sidebar footer's account row and the flyout it opens on
// hover, per the reference: Get App, About Us, Language, Get Help, Settings.
// (The reference also shows Plan and Gift Card — Gift Card is out of scope by
// request, and the subscription/purged products stay out of the rebrand.)
//
// Everything hangs off one `relative` footer wrapper, panels included: the
// pointer can travel from the row into the menu, into a submenu, into the QR
// panel, without ever leaving the wrapper's descendant tree — so one
// onPointerLeave on the wrapper is the whole close story, with a short grace
// timer for the diagonal moves across the 8px gaps.
//
// Hover drives it on desktop; click works too, because a touch tap never fires
// a useful pointerenter/leave pair. Conditional rendering keeps the closed
// menu out of the DOM entirely, so the sidebar's text stays just the nav.

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  Check,
  ChevronRight,
  CircleQuestionMark,
  Info,
  Languages,
  Monitor,
  Settings,
  Smartphone,
} from "lucide-react";
import { KimiIcon } from "./icons";
import {
  LANGUAGES,
  languageLabel,
  setPreferences,
  usePreferences,
} from "./preferences";

/** Which flyout is out. "qr" implies the Get App submenu too. */
type Submenu = "get-app" | "about" | "language" | "qr" | null;

const CLOSE_GRACE_MS = 160;

/* ── Rows ─────────────────────────────────────────────────────────────────── */

const ROW_CLASS =
  "flex h-9 w-full items-center gap-2 rounded-[10px] px-2 text-sm leading-5 text-fennic-secondary transition-colors duration-150 hover:bg-fennic-hover hover:text-fennic-primary";

function RowIcon({ children }: { children: React.ReactNode }) {
  return <span className="flex h-4 w-4 shrink-0 items-center justify-center">{children}</span>;
}

/* ── QR stand-in ──────────────────────────────────────────────────────────── */

/**
 * Decorative QR. The module grid is a seeded xorshift pattern — deterministic,
 * so server and client render the same cells — with the three finder squares a
 * real QR carries. It is NOT a scannable code; swap in the real asset and see
 * `image specs.md` §11 before shipping anything that downloads an app.
 */
function QrArt({ size = 148 }: { size?: number }) {
  const N = 21;
  let seed = 0x66456e6e; // "fenn"
  const next = () => {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    return (seed >>> 0) / 0xffffffff;
  };
  const cells: React.ReactNode[] = [];
  for (let y = 0; y < N; y += 1) {
    for (let x = 0; x < N; x += 1) {
      const inFinder =
        (x < 7 && y < 7) || (x >= N - 7 && y < 7) || (x < 7 && y >= N - 7);
      if (!inFinder && next() < 0.44) {
        cells.push(<rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} />);
      }
    }
  }
  const finder = (fx: number, fy: number) => (
    <g key={`finder-${fx}-${fy}`}>
      <rect x={fx} y={fy} width={7} height={7} />
      {/* style, not the fill attribute: var() does not resolve in SVG
          presentation attributes, and a transparent knockout would flatten
          the finder into a solid square. */}
      <rect x={fx + 1} y={fy + 1} width={5} height={5} style={{ fill: "var(--fennic-panel)" }} />
      <rect x={fx + 2} y={fy + 2} width={3} height={3} />
    </g>
  );
  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${N} ${N}`}
      width={size}
      height={size}
      shapeRendering="crispEdges"
      className="text-fennic-primary"
    >
      <rect width={N} height={N} rx={1.5} style={{ fill: "var(--fennic-panel)" }} />
      <g fill="currentColor">
        {cells}
        {finder(0, 0)}
        {finder(N - 7, 0)}
        {finder(0, N - 7)}
      </g>
    </svg>
  );
}

/* ── The footer row + its flyouts ─────────────────────────────────────────── */

export default function ProfileMenu() {
  const { language } = usePreferences();
  const [open, setOpen] = useState(false);
  const [sub, setSub] = useState<Submenu>(null);
  const closeTimer = useRef<number | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const cancelClose = () => {
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = window.setTimeout(() => {
      setOpen(false);
      setSub(null);
    }, CLOSE_GRACE_MS);
  };

  // A tap that opened the menu should close on Escape, or on a tap anywhere
  // outside it — hover handles the desktop case, but a touch screen never
  // fires the pointerleave that would otherwise do this.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        cancelClose();
        setOpen(false);
        setSub(null);
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        cancelClose();
        setOpen(false);
        setSub(null);
      }
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  useEffect(() => cancelClose, []);

  const openMenu = (withSub: Submenu = null) => {
    cancelClose();
    setOpen(true);
    setSub(withSub);
  };

  const closeAll = () => {
    cancelClose();
    setOpen(false);
    setSub(null);
  };

  const getAppBundle = sub === "get-app" || sub === "qr";

  return (
    <div
      ref={wrapperRef}
      className="relative h-[60px] shrink-0 bg-fennic-ground p-2"
      onPointerEnter={() => openMenu()}
      onPointerLeave={scheduleClose}
    >
      <div className="flex h-11 items-center">
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={() => (open ? closeAll() : openMenu())}
          className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-[12px] p-2 text-fennic-primary transition-colors duration-150 hover:bg-fennic-hover"
        >
          <span
            aria-hidden
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-fennic-accent-soft text-[11px] font-semibold tracking-[0.02em] text-fennic-accent"
          >
            T
          </span>
          <span className="truncate text-sm leading-5 font-medium">Titumama</span>
        </button>
        <button
          type="button"
          aria-label="Get App"
          onClick={() => (open && sub === "get-app" ? closeAll() : openMenu("get-app"))}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] p-[13px] text-fennic-tertiary transition-colors duration-150 hover:bg-fennic-hover hover:text-fennic-primary"
        >
          <KimiIcon name="get-app" size={18} />
        </button>
      </div>

      {open ? (
        <div
          role="menu"
          aria-label="Account"
          className="absolute bottom-full left-2 z-40 mb-1 w-[220px] rounded-[16px] border border-fennic-border bg-fennic-panel p-1.5 shadow-fennic-menu"
        >
          <button
            type="button"
            role="menuitem"
            aria-haspopup="menu"
            aria-expanded={getAppBundle}
            onPointerEnter={() => setSub("get-app")}
            onFocus={() => setSub("get-app")}
            onClick={() => setSub("get-app")}
            className={ROW_CLASS}
          >
            <RowIcon>
              <KimiIcon name="get-app" size={16} />
            </RowIcon>
            <span className="flex-1 text-left">Get App</span>
            <ChevronRight size={14} className="text-fennic-faint" />
          </button>

          <button
            type="button"
            role="menuitem"
            aria-haspopup="menu"
            aria-expanded={sub === "about"}
            onPointerEnter={() => setSub("about")}
            onFocus={() => setSub("about")}
            onClick={() => setSub("about")}
            className={ROW_CLASS}
          >
            <RowIcon>
              <Info size={16} />
            </RowIcon>
            <span className="flex-1 text-left">About Us</span>
            <ChevronRight size={14} className="text-fennic-faint" />
          </button>

          <button
            type="button"
            role="menuitem"
            aria-haspopup="menu"
            aria-expanded={sub === "language"}
            onPointerEnter={() => setSub("language")}
            onFocus={() => setSub("language")}
            onClick={() => setSub("language")}
            className={ROW_CLASS}
          >
            <RowIcon>
              <Languages size={16} />
            </RowIcon>
            <span className="flex-1 text-left">Language</span>
            <span className="text-[13px] text-fennic-faint">{languageLabel(language)}</span>
            <ChevronRight size={14} className="text-fennic-faint" />
          </button>

          <Link
            href="/help"
            role="menuitem"
            onPointerEnter={() => setSub(null)}
            onClick={closeAll}
            className={ROW_CLASS}
          >
            <RowIcon>
              <CircleQuestionMark size={16} />
            </RowIcon>
            <span className="flex-1 text-left">Get Help</span>
          </Link>

          <Link
            href="/settings"
            role="menuitem"
            onPointerEnter={() => setSub(null)}
            onClick={closeAll}
            className={ROW_CLASS}
          >
            <RowIcon>
              <Settings size={16} />
            </RowIcon>
            <span className="flex-1 text-left">Settings</span>
          </Link>

          {/* ── Get App ── */}
          {getAppBundle ? (
            <div
              role="menu"
              aria-label="Get App"
              className="absolute bottom-0 left-full z-40 ml-2 w-[190px] rounded-[16px] border border-fennic-border bg-fennic-panel p-1.5 shadow-fennic-menu"
            >
              <button
                type="button"
                role="menuitem"
                onPointerEnter={() => setSub("qr")}
                onFocus={() => setSub("qr")}
                onClick={() => setSub("qr")}
                className={ROW_CLASS}
              >
                <RowIcon>
                  <Smartphone size={16} />
                </RowIcon>
                <span className="flex-1 text-left">Mobile App</span>
                <ChevronRight size={14} className="text-fennic-faint" />
              </button>
              <a
                href="#windows-download"
                role="menuitem"
                onPointerEnter={() => setSub("get-app")}
                onClick={closeAll}
                className={ROW_CLASS}
              >
                <RowIcon>
                  <Monitor size={16} />
                </RowIcon>
                <span className="flex-1 text-left">Windows</span>
                <span className="text-[13px] text-fennic-faint">Download</span>
              </a>

              {/* ── Mobile App → QR ── */}
              {sub === "qr" ? (
                <div className="absolute bottom-0 left-full z-40 ml-2 flex w-[232px] flex-col items-center gap-3 rounded-[16px] border border-fennic-border bg-fennic-panel p-4 shadow-fennic-menu">
                  <span className="rounded-[12px] border border-fennic-border p-2">
                    <QrArt />
                  </span>
                  <p className="text-center text-sm leading-5 text-fennic-secondary">
                    Scan to download the
                    <br />
                    Fennic mobile app
                  </p>
                </div>
              ) : null}
            </div>
          ) : null}

          {/* ── About Us ── */}
          {sub === "about" ? (
            <div
              role="menu"
              aria-label="About Us"
              className="absolute bottom-0 left-full z-40 ml-2 w-[190px] rounded-[16px] border border-fennic-border bg-fennic-panel p-1.5 shadow-fennic-menu"
            >
              <Link href="/terms" role="menuitem" onClick={closeAll} className={ROW_CLASS}>
                <span className="flex-1 text-left">Terms of Service</span>
              </Link>
              <Link href="/privacy" role="menuitem" onClick={closeAll} className={ROW_CLASS}>
                <span className="flex-1 text-left">Privacy Policy</span>
              </Link>
              <Link href="/features" role="menuitem" onClick={closeAll} className={ROW_CLASS}>
                <span className="flex-1 text-left">Features</span>
              </Link>
            </div>
          ) : null}

          {/* ── Language ── */}
          {sub === "language" ? (
            <div
              role="menu"
              aria-label="Language"
              className="absolute bottom-0 left-full z-40 ml-2 w-[190px] rounded-[16px] border border-fennic-border bg-fennic-panel p-1.5 shadow-fennic-menu"
            >
              {LANGUAGES.map((entry) => (
                <button
                  key={entry.code}
                  type="button"
                  role="menuitemradio"
                  aria-checked={entry.code === language}
                  onClick={() => setPreferences({ language: entry.code })}
                  className={ROW_CLASS}
                >
                  <span className="flex-1 text-left">{entry.label}</span>
                  {entry.code === language ? (
                    <Check size={15} className="text-fennic-accent" />
                  ) : null}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
