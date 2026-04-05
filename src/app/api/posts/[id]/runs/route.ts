import { NextRequest, NextResponse } from "next/server";
import { db, initDB } from "@/db";
import { agentRuns, postVersions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

// GET /api/posts/[id]/runs — get all agent runs for latest version
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  initDB();
  const { id } = await params;

  // Get latest version
  const [latestVersion] = await db
    .select()
    .from(postVersions)
    .where(eq(postVersions.postId, id))
    .orderBy(desc(postVersions.versionNumber))
    .limit(1);

  if (!latestVersion) {
    return NextResponse.json([]);
  }

  const runs = await db
    .select()
    .from(agentRuns)
    .where(eq(agentRuns.postVersionId, latestVersion.id));

  return NextResponse.json(runs);
}
