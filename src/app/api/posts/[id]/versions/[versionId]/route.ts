import { NextRequest, NextResponse } from "next/server";
import { db, initDB } from "@/db";
import { postVersions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { isAuthenticated } from "@/lib/auth";

// PATCH /api/posts/[id]/versions/[versionId] — soft delete a version
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; versionId: string }> }
) {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  initDB();
  const { versionId } = await params;
  const body = await request.json();

  if (body.isDeleted !== undefined) {
    await db
      .update(postVersions)
      .set({ isDeleted: body.isDeleted })
      .where(eq(postVersions.id, versionId));
  }

  const [updated] = await db
    .select()
    .from(postVersions)
    .where(eq(postVersions.id, versionId));

  return NextResponse.json(updated);
}
