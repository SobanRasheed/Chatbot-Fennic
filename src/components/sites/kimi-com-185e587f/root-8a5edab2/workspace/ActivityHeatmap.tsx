"use client";

// ActivityHeatmap — the contribution grid on the My Fennic tab.
//
// Geometry follows the reference: 7 weekday rows, one column per week, a full
// rolling year, month labels *below* the grid rather than above it. Kimi paints
// the buckets in its blue; ours walks the terracotta accent through four
// opacity steps, which keeps the whole thing on `--fennic-accent` and so
// correct in both colour schemes with no second palette to maintain.
//
// The grid overflows on narrow viewports instead of shrinking the cells — a
// year of days cannot be legible at phone width, and a scroll is honest about
// that where a squeeze is not.

import type { ActivityDay } from "@/types/fennic-workspace";

const CELL = 11;
const GAP = 3;

/** Level → Tailwind classes. Level 0 is the empty well, 1–4 walk the accent. */
const LEVEL_CLASS: Record<ActivityDay["level"], string> = {
  0: "bg-fennic-placeholder-bg",
  1: "bg-fennic-accent opacity-30",
  2: "bg-fennic-accent opacity-50",
  3: "bg-fennic-accent opacity-75",
  4: "bg-fennic-accent",
};

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const;

interface Column {
  /** 7 slots, Sunday first. `null` pads the partial first and last weeks. */
  days: (ActivityDay | null)[];
}

/** Split the flat day list into weekday-aligned columns. */
function toColumns(days: readonly ActivityDay[]): Column[] {
  if (days.length === 0) return [];
  const lead = new Date(`${days[0].date}T00:00:00Z`).getUTCDay();
  const slots: (ActivityDay | null)[] = [...Array<null>(lead).fill(null), ...days];
  while (slots.length % 7 !== 0) slots.push(null);
  const columns: Column[] = [];
  for (let i = 0; i < slots.length; i += 7) {
    columns.push({ days: slots.slice(i, i + 7) });
  }
  return columns;
}

/** One label per month, spanning the columns that month occupies. */
function toMonthLabels(columns: readonly Column[]) {
  const labels: { key: string; label: string; start: number; span: number }[] = [];
  columns.forEach((column, index) => {
    const first = column.days.find((day) => day !== null);
    if (!first) return;
    const date = new Date(`${first.date}T00:00:00Z`);
    const label = MONTHS[date.getUTCMonth()];
    const key = `${date.getUTCFullYear()}-${date.getUTCMonth()}`;
    const previous = labels.at(-1);
    if (previous?.key === key) {
      previous.span += 1;
      return;
    }
    labels.push({ key, label, start: index + 1, span: 1 });
  });
  // A month clipped to one or two columns at either end has no room for its
  // name; drop it rather than let the text collide with its neighbour.
  return labels.filter((entry) => entry.span >= 3);
}

export default function ActivityHeatmap({
  days,
  metricLabel,
}: {
  days: readonly ActivityDay[];
  /** Used in each cell's tooltip, e.g. "chats". */
  metricLabel: string;
}) {
  const columns = toColumns(days);
  const labels = toMonthLabels(columns);
  const track = {
    gridTemplateColumns: `repeat(${columns.length}, ${CELL}px)`,
    columnGap: `${GAP}px`,
  } as const;

  return (
    <div className="-mx-1 overflow-x-auto px-1 pb-1">
      <div className="inline-flex min-w-full flex-col gap-2">
        <div
          role="img"
          aria-label={`${days.length} days of ${metricLabel}, oldest first`}
          className="grid"
          style={{ ...track, gridTemplateRows: `repeat(7, ${CELL}px)`, gridAutoFlow: "column", rowGap: `${GAP}px` }}
        >
          {columns.flatMap((column, columnIndex) =>
            column.days.map((day, rowIndex) =>
              day ? (
                <span
                  key={day.date}
                  title={`${day.count} ${metricLabel} on ${day.date}`}
                  className={`rounded-[2px] ${LEVEL_CLASS[day.level]}`}
                />
              ) : (
                <span key={`pad-${columnIndex}-${rowIndex}`} aria-hidden />
              ),
            ),
          )}
        </div>

        <div className="grid" style={track}>
          {labels.map((entry) => (
            <span
              key={entry.key}
              style={{ gridColumn: `${entry.start} / span ${entry.span}` }}
              className="text-center text-[12px] leading-4 text-fennic-faint"
            >
              {entry.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
