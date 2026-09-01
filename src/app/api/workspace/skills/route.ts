// GET  /api/workspace/skills?category=Finance&q=model  → filtered catalog
// POST /api/workspace/skills                           → { slug, added }

import { querySkills, setSkillAdded } from "@/lib/workspace/catalog";
import { SKILL_CATEGORIES } from "@/types/fennic-workspace";
import type { SkillCategory } from "@/types/fennic-workspace";

const isCategory = (value: string): value is SkillCategory =>
  (SKILL_CATEGORIES as readonly string[]).includes(value);

export async function GET(request: Request): Promise<Response> {
  const params = new URL(request.url).searchParams;
  const category = params.get("category") ?? "Added";
  const q = params.get("q") ?? "";

  if (!isCategory(category)) {
    return Response.json(
      { error: `unknown category "${category}"` },
      { status: 400 },
    );
  }

  return Response.json(querySkills({ category, q }));
}

export async function POST(request: Request): Promise<Response> {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "expected a JSON body" }, { status: 400 });
  }

  const { slug, added } = (payload ?? {}) as { slug?: unknown; added?: unknown };
  if (typeof slug !== "string" || typeof added !== "boolean") {
    return Response.json(
      { error: "expected { slug: string, added: boolean }" },
      { status: 400 },
    );
  }

  const skill = setSkillAdded(slug, added);
  if (!skill) {
    return Response.json({ error: `no skill "${slug}"` }, { status: 404 });
  }
  return Response.json({ skill });
}
