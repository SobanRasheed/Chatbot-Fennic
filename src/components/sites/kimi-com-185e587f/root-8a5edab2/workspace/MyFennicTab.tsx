"use client";

// MyFennicTab — the companion's standing: avatar, the days/chats/streak line,
// the Closeness↔Growth heatmap, and the self-growth offer.
//
// State here is only what the reference actually toggles: which metric the
// heatmap shows, and whether self-growth is on. The latter is a real POST to
// /api/workspace/profile, optimistically applied and rolled back if the request
// fails, so the button is never lying about what the backend thinks.

import { useCallback, useState, useTransition } from "react";
import ActivityHeatmap from "./ActivityHeatmap";
import SelfGrowthMedia from "./SelfGrowthMedia";
import { SegmentedControl } from "./workspace-ui";
import { KimiIcon } from "../icons";
import type {
  CompanionMetric,
  CompanionProfile,
  WorkspaceProfileResponse,
} from "@/types/fennic-workspace";

const METRICS = [
  { value: "closeness" as const, label: "Closeness" },
  { value: "growth" as const, label: "Growth" },
];

const CAPTION: Record<CompanionMetric, string> = {
  closeness: "The more you chat or assign tasks, the higher the intimacy",
  growth: "Every task Fennic finishes on its own adds to what it knows about your work",
};

const METRIC_NOUN: Record<CompanionMetric, string> = {
  closeness: "interactions",
  growth: "learning events",
};

export default function MyFennicTab({
  initial,
}: {
  initial: WorkspaceProfileResponse;
}) {
  const [metric, setMetric] = useState<CompanionMetric>("closeness");
  const [profile, setProfile] = useState<CompanionProfile>(initial.profile);
  const [pending, startTransition] = useTransition();

  const toggleSelfGrowth = useCallback(() => {
    const next = !profile.selfGrowthEnabled;
    const previous = profile;
    setProfile({ ...profile, selfGrowthEnabled: next });
    startTransition(async () => {
      try {
        const response = await fetch("/api/workspace/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ selfGrowthEnabled: next }),
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const body = (await response.json()) as { profile: CompanionProfile };
        setProfile(body.profile);
      } catch {
        setProfile(previous); // the server never agreed; stop pretending it did
      }
    });
  }, [profile]);

  const enabled = profile.selfGrowthEnabled;

  return (
    <div className="flex flex-col gap-8">
      {/* Header — avatar, name, the numbers, and the top-right switch */}
      <div className="flex flex-col gap-4">
        <span className="flex h-10 w-10 items-center justify-center rounded-full">
          <KimiIcon name="my-kimi" size={40} className="text-fennic-accent" />
        </span>

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-1.5">
            <h1 className="text-[22px] leading-7 font-semibold tracking-[-0.01em] text-fennic-primary">
              {profile.owner}&rsquo;s Fennic
            </h1>
            <p className="text-sm leading-5 text-fennic-tertiary">
              Fennic has been with you for{" "}
              <strong className="font-semibold text-fennic-secondary">
                {profile.daysTogether}
              </strong>{" "}
              days, chatted{" "}
              <strong className="font-semibold text-fennic-secondary">
                {profile.chatCount}
              </strong>{" "}
              times, and we&rsquo;ve met{" "}
              <strong className="font-semibold text-fennic-secondary">
                {profile.streakDays}
              </strong>{" "}
              days in a row recently
            </p>
          </div>

          <button
            type="button"
            onClick={toggleSelfGrowth}
            aria-pressed={enabled}
            disabled={pending}
            className={`inline-flex h-9 shrink-0 items-center rounded-[10px] px-3.5 text-[13px] leading-5 font-medium transition-colors duration-150 disabled:opacity-60 ${
              enabled
                ? "bg-fennic-accent text-fennic-icon-inverse hover:opacity-90"
                : "border border-fennic-line text-fennic-primary hover:bg-fennic-hover"
            }`}
          >
            {enabled ? "Self-growth on" : "Enable self-growth"}
          </button>
        </div>
      </div>

      {/* Metric toggle + heatmap */}
      <div className="flex flex-col items-start gap-4">
        <SegmentedControl
          label="Companion metric"
          options={METRICS}
          value={metric}
          onChange={setMetric}
        />
        <p className="text-sm leading-5 text-fennic-tertiary">{CAPTION[metric]}</p>
        <div className="w-full">
          <ActivityHeatmap
            days={initial.activity[metric]}
            metricLabel={METRIC_NOUN[metric]}
          />
        </div>
      </div>

      {/* Self-growth offer. Desktop: copy left, the orb absolutely placed on the
          right and bleeding off the edge. Mobile: the same orb in normal flow
          under the copy.

          One instance, repositioned — not two behind `md:hidden`/`md:flex`. The
          orb is 209 circles, and rendering it twice put 418 of them in the DOM
          to serve one visible copy. DOM order is copy-then-orb so mobile stacks
          correctly on its own; on desktop the orb is out of flow, so the layers
          are ordered by explicit z-index instead. */}
      <div className="relative overflow-hidden rounded-[16px] border border-fennic-border bg-fennic-ground">
        <div className="relative z-[2] flex max-w-[430px] flex-col items-start gap-3 p-6">
          <h2 className="text-[17px] leading-6 font-semibold text-fennic-primary">
            Fennic can now learn and grow on its own
          </h2>
          <p className="text-sm leading-5 text-fennic-secondary">
            Once enabled, Fennic keeps learning your preferences, habits, and ways
            of working, making every collaboration the start of the next one
          </p>
          <button
            type="button"
            onClick={toggleSelfGrowth}
            aria-pressed={enabled}
            disabled={pending}
            className={`mt-1 inline-flex h-10 items-center rounded-[12px] px-4 text-sm leading-5 font-medium transition-colors duration-150 disabled:opacity-60 ${
              enabled
                ? "border border-fennic-line text-fennic-primary hover:bg-fennic-hover"
                : "bg-fennic-accent text-fennic-icon-inverse hover:opacity-90"
            }`}
          >
            {enabled ? "Turn off self-growth" : "Enable self-growth"}
          </button>
        </div>

        {/* Fades the orb into the panel so it reads as bleeding off rather than
            pasted on — and, more practically, keeps the body copy off the dots.
            Desktop only: in one column there is nothing to fade behind. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[1] hidden md:block"
          style={{
            backgroundImage:
              "linear-gradient(to right, var(--fennic-ground) 46%, transparent 78%)",
          }}
        />

        <div className="pointer-events-none z-0 flex justify-end px-6 pb-6 md:absolute md:top-0 md:right-0 md:bottom-0 md:w-[52%] md:items-center md:p-0">
          <SelfGrowthMedia className="w-full md:max-w-[540px]" />
        </div>
      </div>
    </div>
  );
}
