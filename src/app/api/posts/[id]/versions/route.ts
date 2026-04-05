import { NextRequest, NextResponse } from "next/server";
import { db, initDB } from "@/db";
import { posts, postVersions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { isAuthenticated } from "@/lib/auth";

// POST /api/posts/[id]/versions — create a new version
export async function POST(
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
  const { title, contentMd, summary, changeNote } = body;

  if (!contentMd) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }

  // Get latest version number
  const [latest] = await db
    .select()
    .from(postVersions)
    .where(eq(postVersions.postId, id))
    .orderBy(desc(postVersions.versionNumber))
    .limit(1);

  const nextVersion = (latest?.versionNumber || 0) + 1;
  const now = new Date().toISOString();

  // Get post for title fallback
  const [post] = await db.select().from(posts).where(eq(posts.id, id));
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const [version] = await db.insert(postVersions).values({
    postId: id,
    versionNumber: nextVersion,
    title: title || post.title,
    contentMd,
    summary: summary || null,
    changeNote: changeNote || null,
    publishedAt: now,
  }).returning();

  // Update post's updatedAt
  await db.update(posts).set({ updatedAt: now }).where(eq(posts.id, id));

  return NextResponse.json(version, { status: 201 });
}
