import type { Metadata } from "next";
import PublisherModePage from "@/components/sites/kimi-com-185e587f/root-8a5edab2/PublisherModePage";
import { findMode } from "@/components/sites/kimi-com-185e587f/root-8a5edab2/publisher-modes";

// The mode is looked up rather than inlined so the registry stays the single
// source of truth for the label, placeholder, gallery and cards. A missing slug
// is a build-time throw, not a page that renders half a screen.
const MODE = findMode("deep-research")!;

export const metadata: Metadata = {
  title: MODE.label,
  description: MODE.description,
};

export default function DeepResearchPage() {
  return <PublisherModePage mode={MODE} />;
}
