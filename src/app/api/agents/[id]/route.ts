import { NextRequest, NextResponse } from "next/server";
import { db, initDB } from "@/db";
import { aiAgents } from "@/db/schema";
import { eq } from "drizzle-orm";
import { isAuthenticated } from "@/lib/auth";

// PATCH /api/agents/[id] — update agent
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  initDB();
  const { id } = await params;
  const body = await request.json();

  const updateData: Record<string, unknown> = {};
  if (body.displayName !== undefined) updateData.displayName = body.displayName;
  if (body.description !== undefined) updateData.description = body.description;
  if (body.perspective !== undefined) updateData.perspective = body.perspective;
  if (body.characterReadme !== undefined) updateData.characterReadme = body.characterReadme;
  if (body.isActive !== undefined) updateData.isActive = body.isActive;

  await db.update(aiAgents).set(updateData).where(eq(aiAgents.id, id));

  const [updated] = await db.select().from(aiAgents).where(eq(aiAgents.id, id));
  return NextResponse.json(updated);
}

// DELETE /api/agents/[id] — delete agent
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  initDB();
  const { id } = await params;

  await db.delete(aiAgents).where(eq(aiAgents.id, id));
  return NextResponse.json({ success: true });
}
