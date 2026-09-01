// GET  /api/workspace/plugins?category=Finance&q=market  → filtered catalog
// POST /api/workspace/plugins                            → { slug, installed }
//
// The category vocabulary is the same union the chips render from, so a typo in
// the client is a 400 here rather than a silently empty grid.

import { queryPlugins, setPluginInstalled } from "@/lib/workspace/catalog";
import { PLUGIN_CATEGORIES } from "@/types/fennic-workspace";
import type { PluginCategory } from "@/types/fennic-workspace";

const isCategory = (value: string): value is PluginCategory =>
  (PLUGIN_CATEGORIES as readonly string[]).includes(value);

export async function GET(request: Request): Promise<Response> {
  const params = new URL(request.url).searchParams;
  const category = params.get("category") ?? "All";
  const q = params.get("q") ?? "";

  if (!isCategory(category)) {
    return Response.json(
      { error: `unknown category "${category}"` },
      { status: 400 },
    );
  }

  return Response.json(queryPlugins({ category, q }));
}

export async function POST(request: Request): Promise<Response> {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "expected a JSON body" }, { status: 400 });
  }

  const { slug, installed } = (payload ?? {}) as {
    slug?: unknown;
    installed?: unknown;
  };
  if (typeof slug !== "string" || typeof installed !== "boolean") {
    return Response.json(
      { error: "expected { slug: string, installed: boolean }" },
      { status: 400 },
    );
  }

  const plugin = setPluginInstalled(slug, installed);
  if (!plugin) {
    return Response.json({ error: `no plugin "${slug}"` }, { status: 404 });
  }
  return Response.json({ plugin });
}
