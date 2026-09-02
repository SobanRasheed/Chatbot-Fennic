import type { Metadata } from "next";
import PublisherModePage from "@/components/sites/kimi-com-185e587f/root-8a5edab2/PublisherModePage";
import { findMode } from "@/components/sites/kimi-com-185e587f/root-8a5edab2/publisher-modes";

const MODE = findMode("design")!;

export const metadata: Metadata = {
  title: MODE.label,
  description: MODE.description,
};

export default function DesignPage() {
  return <PublisherModePage mode={MODE} />;
}
