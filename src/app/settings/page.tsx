import type { Metadata } from "next";
import SettingsPanel from "@/components/sites/kimi-com-185e587f/root-8a5edab2/SettingsPanel";

export const metadata: Metadata = {
  title: "Settings",
  description:
    "Theme, notifications, chat presets and language — the account-level choices for your Fennic workspace.",
};

export default function SettingsPage() {
  return <SettingsPanel />;
}
