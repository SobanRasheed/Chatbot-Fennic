"use client";

// SelfGrowthMedia — the dot-matrix orb beside "Fennic can now learn and grow on
// its own".
//
// The reference for this panel is a short looping video. There is no video file
// in the repo and no encoder available (`ffmpeg` is not installed), so rather
// than point a <video> at a 404 this ships the same motion natively: an SVG dot
// matrix whose core breathes and whose dots twinkle on a staggered delay.
//
// Pass `videoSrc` to switch to the real thing the moment you have a file —
// `image specs.md` §10 records the drop path, dimensions and art direction. The
// component keeps the animation as the poster/fallback so neither path can end
// up as an empty box.
//
// Everything is deterministic: the ramp and the per-dot delay come from index
// arithmetic, never Math.random(), because a random SVG would hydrate different
// from the server render.

import type { CSSProperties } from "react";

const COLUMNS = 19;
const ROWS = 11;
const PITCH = 28;

const WIDTH = COLUMNS * PITCH;
const HEIGHT = ROWS * PITCH;

interface Dot {
  cx: number;
  cy: number;
  /** 0 at the centre, 1 at the far corner. */
  distance: number;
  delay: number;
}

function buildDots(): Dot[] {
  const dots: Dot[] = [];
  const midX = (COLUMNS - 1) / 2;
  const midY = (ROWS - 1) / 2;
  // The pitch is square, so distance must NOT be stretched per axis — scaling dy
  // squashes the orb into a horizontal ellipse that fills the full height and
  // reads as a rectangle of confetti rather than a ball.
  //
  // Normalise against a radius slightly larger than half the height: the orb is
  // then inscribed vertically (its widest row touches the top and bottom rows)
  // while the four corners fall outside it and stay field. That is the
  // reference's structure — a rectangular field with a circular orb in it.
  const span = midY * 1.7;

  for (let row = 0; row < ROWS; row += 1) {
    for (let column = 0; column < COLUMNS; column += 1) {
      const dx = column - midX;
      const dy = row - midY;
      const distance = Math.min(1, Math.hypot(dx, dy) / span);
      dots.push({
        cx: column * PITCH + PITCH / 2,
        cy: row * PITCH + PITCH / 2,
        distance,
        // A diagonal sweep: dots on the same diagonal share a phase, so the
        // shimmer reads as a slow wave crossing the orb. Keep the amplitude low
        // (see fg-shimmer) — a big per-dot swing destroys the band structure
        // that is the only thing making the shape read as a circle.
        delay: ((column + row * 2) % 12) * 0.18,
      });
    }
  }
  return dots;
}

const DOTS = buildDots();

/**
 * Distance → paint, in five bands: a cream specular highlight, solid accent,
 * two fading accent rings, then the field.
 *
 * The field uses `--fennic-placeholder-bg` rather than a low-alpha accent, and
 * that is the whole trick. A fixed alpha cannot recede on both grounds: accent
 * at 6% is invisible on warm off-white and a clearly visible warm dot on deep
 * charcoal, so the orb dissolved in one mode and sat in a busy grid in the
 * other. `placeholder-bg` is defined per mode (6% charcoal light, 7% off-white
 * dark) precisely to be barely-there against whatever it is on.
 *
 * The cream band is kept small for the same reason in reverse: cream is a light
 * tone, so it reads as a bright core on charcoal but as a pale patch on
 * off-white. At highlight size that difference is a specular glint either way;
 * at core size the light mode would read as a hole. Radius carries the rest of
 * the depth — bigger dots inside, smaller in the field — because that works
 * identically on both grounds.
 */
function paint(distance: number): {
  fill: string;
  opacity: number;
  className: string;
  radius: number;
} {
  if (distance < 0.17)
    return { fill: "var(--fennic-cream)", opacity: 1, className: "fg-core", radius: 11 };
  if (distance < 0.46)
    return { fill: "var(--fennic-accent)", opacity: 1, className: "fg-core", radius: 11 };
  if (distance < 0.66)
    return { fill: "var(--fennic-accent)", opacity: 0.55, className: "fg-mid", radius: 10 };
  if (distance < 0.85)
    return { fill: "var(--fennic-accent)", opacity: 0.22, className: "fg-mid", radius: 9.5 };
  return { fill: "var(--fennic-placeholder-bg)", opacity: 1, className: "", radius: 8.5 };
}

export default function SelfGrowthMedia({
  videoSrc,
  className,
}: {
  /** Optional looping clip; falls back to the built-in animation when absent. */
  videoSrc?: string;
  className?: string;
}) {
  if (videoSrc) {
    return (
      <video
        src={videoSrc}
        autoPlay
        muted
        loop
        playsInline
        aria-label="Fennic learning on its own"
        className={className}
      />
    );
  }

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      role="img"
      aria-label="A field of dots pulsing around a bright core — Fennic learning on its own"
      className={className}
      style={{ display: "block", width: "100%", height: "auto" }}
    >
      <style>{`
        .fg-orb{transform-box:view-box;transform-origin:50% 50%;animation:fg-breathe 6s ease-in-out infinite}
        .fg-core{animation:fg-shimmer 3.6s ease-in-out infinite}
        .fg-mid{animation:fg-shimmer 5s ease-in-out infinite}
        @keyframes fg-breathe{0%,100%{transform:scale(1)}50%{transform:scale(1.03)}}
        @keyframes fg-shimmer{0%,100%{opacity:var(--o)}50%{opacity:calc(var(--o) * 0.82)}}
        @media (prefers-reduced-motion: reduce){
          .fg-orb,.fg-core,.fg-mid{animation:none}
        }
      `}</style>
      <g className="fg-orb">
        {DOTS.map((dot) => {
          const { fill, opacity, className: motion, radius } = paint(dot.distance);
          return (
            <circle
              key={`${dot.cx}-${dot.cy}`}
              cx={dot.cx}
              cy={dot.cy}
              r={radius}
              fill={fill}
              className={motion}
              style={
                {
                  opacity,
                  animationDelay: `${dot.delay}s`,
                  "--o": opacity,
                } as CSSProperties
              }
            />
          );
        })}
      </g>
    </svg>
  );
}
