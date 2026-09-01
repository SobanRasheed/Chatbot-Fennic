import type { Metadata } from "next";
import WorkspacePanel from "@/components/sites/kimi-com-185e587f/root-8a5edab2/workspace/WorkspacePanel";
import {
  getActivity,
  getProfile,
  queryPlugins,
  querySkills,
} from "@/lib/workspace/catalog";
import { isWorkspaceTab } from "@/types/fennic-workspace";

export const metadata: Metadata = {
  title: "My Fennic",
  description:
    "Your Fennic companion: closeness and growth over the year, the plugins it can reach, and the skills you have taught it.",
};

// Three reasons this route is request-time rather than prerendered:
// `searchParams` is a Request-time API, the catalog's install/added flags mutate
// through POST, and a baked activity year would go stale. The other five routes
// stay static — only this one has state.
export const dynamic = "force-dynamic";

// Read the catalog directly instead of fetching our own /api/workspace/* routes.
// Same functions, same filters, one process — an internal HTTP hop would only
// add a serialise/parse round trip and a base-URL guess. The API exists for the
// client, which genuinely is across a network boundary.
export default async function MyFennicPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const requested = (await searchParams).tab;
  const tab = typeof requested === "string" && isWorkspaceTab(requested)
    ? requested
    : "my-fennic";

  return (
    <WorkspacePanel
      initialTab={tab}
      profile={{ profile: getProfile(), activity: getActivity() }}
      plugins={queryPlugins({ category: "All" })}
      skills={querySkills({ category: "Added" })}
    />
  );
}
