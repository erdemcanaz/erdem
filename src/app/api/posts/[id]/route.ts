import { NextRequest, NextResponse } from "next/server";
import { db, initDB } from "@/db";
import { posts, postVersions, agentRuns } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { isAuthenticated } from "@/lib/auth";

// GET /api/posts/[id] — get post with all versions
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  initDB();
  const { id } = await params;

  const [post] = await db.select().from(posts).where(eq(posts.id, id));
  if (!post) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const versions = await db
    .select()
    .from(postVersions)
    .where(eq(postVersions.postId, id))
    .orderBy(desc(postVersions.versionNumber));

  return NextResponse.json({
    ...post,
    tags: post.tags ? JSON.parse(post.tags) : [],
    versions,
  });
}

// PATCH /api/posts/[id] — update post metadata
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

  const updateData: Record<string, unknown> = {
    updatedAt: new Date().toISOString(),
  };

  if (body.title !== undefined) updateData.title = body.title;
  if (body.isPublished !== undefined) updateData.isPublished = body.isPublished;
  if (body.tags !== undefined) updateData.tags = JSON.stringify(body.tags);

  await db.update(posts).set(updateData).where(eq(posts.id, id));

  const [updated] = await db.select().from(posts).where(eq(posts.id, id));
  return NextResponse.json(updated);
}

// DELETE /api/posts/[id] — delete post entirely
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

  await db.delete(posts).where(eq(posts.id, id));
  return NextResponse.json({ success: true });
}
