import type { Metadata } from "next";
import PublisherModePage from "@/components/sites/kimi-com-185e587f/root-8a5edab2/PublisherModePage";
import { findMode } from "@/components/sites/kimi-com-185e587f/root-8a5edab2/publisher-modes";

// This route is new. Sheets was linked from the sidebar, the shortcut pills and
// four subpages but had no page, so every one of those links 404'd.
const MODE = findMode("sheets")!;

export const metadata: Metadata = {
  title: MODE.label,
  description: MODE.description,
};

export default function SheetsPage() {
  return <PublisherModePage mode={MODE} />;
}
