import { NextRequest, NextResponse } from "next/server";
import { db, initDB } from "@/db";
import { aiAgents } from "@/db/schema";
import { eq } from "drizzle-orm";
import { isAuthenticated } from "@/lib/auth";
import { seedAgents } from "@/db/seed";

// GET /api/agents — list all agents
export async function GET() {
  initDB();
  await seedAgents();

  const agents = await db
    .select()
    .from(aiAgents)
    .orderBy(aiAgents.sortOrder);

  return NextResponse.json(agents);
}

// POST /api/agents — create a new agent
export async function POST(request: NextRequest) {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  initDB();
  const body = await request.json();

  const [agent] = await db.insert(aiAgents).values({
    slug: body.slug,
    displayName: body.displayName,
    description: body.description || null,
    perspective: body.perspective,
    characterReadme: body.characterReadme,
    icon: body.icon || null,
    sortOrder: body.sortOrder || 0,
  }).returning();

  return NextResponse.json(agent, { status: 201 });
}
