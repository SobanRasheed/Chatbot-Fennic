// GET  /api/workspace/profile  → companion standing + a year of activity
// POST /api/workspace/profile  → { selfGrowthEnabled: boolean }
//
// Route handlers are uncached by default in Next 16, which is what we want here:
// the panel's numbers change as soon as a POST lands.

import { getActivity, getProfile, setSelfGrowth } from "@/lib/workspace/catalog";
import type { WorkspaceProfileResponse } from "@/types/fennic-workspace";

export async function GET(): Promise<Response> {
  const body: WorkspaceProfileResponse = {
    profile: getProfile(),
    activity: getActivity(),
  };
  return Response.json(body);
}

export async function POST(request: Request): Promise<Response> {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "expected a JSON body" }, { status: 400 });
  }

  const enabled = (payload as { selfGrowthEnabled?: unknown } | null)
    ?.selfGrowthEnabled;
  if (typeof enabled !== "boolean") {
    return Response.json(
      { error: "selfGrowthEnabled must be a boolean" },
      { status: 400 },
    );
  }

  return Response.json({ profile: setSelfGrowth(enabled) });
}
