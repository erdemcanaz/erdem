import { NextRequest, NextResponse } from "next/server";
import { db, initDB } from "@/db";
import { posts, postVersions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { isAuthenticated } from "@/lib/auth";

// GET /api/posts — list all posts
export async function GET() {
  initDB();

  const allPosts = await db
    .select()
    .from(posts)
    .orderBy(desc(posts.updatedAt));

  // Get latest version number for each post
  const postsWithVersions = await Promise.all(
    allPosts.map(async (post) => {
      const versions = await db
        .select()
        .from(postVersions)
        .where(eq(postVersions.postId, post.id))
        .orderBy(desc(postVersions.versionNumber));

      return {
        ...post,
        tags: post.tags ? JSON.parse(post.tags) : [],
        currentVersion: versions[0]?.versionNumber || 0,
        versionCount: versions.length,
      };
    })
  );

  return NextResponse.json(postsWithVersions);
}

// POST /api/posts — create a new post with v1
export async function POST(request: NextRequest) {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  initDB();

  const body = await request.json();
  const { title, slug, category, summary, contentMd, tags, isPublished, references } = body;

  if (!title || !slug || !category || !contentMd) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const now = new Date().toISOString();

  // Create post
  const [post] = await db.insert(posts).values({
    title,
    slug,
    category,
    tags: tags ? JSON.stringify(tags) : null,
    isPublished: isPublished ?? false,
    createdAt: now,
    updatedAt: now,
  }).returning();

  // Create version 1
  const [version] = await db.insert(postVersions).values({
    postId: post.id,
    versionNumber: 1,
    title,
    contentMd,
    summary: summary || null,
    references: references ? JSON.stringify(references) : null,
    publishedAt: now,
  }).returning();

  return NextResponse.json({ post, version }, { status: 201 });
}
