import { NextRequest, NextResponse } from "next/server";
import { db, initDB } from "@/db";
import { posts } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  initDB();
  const slug = request.nextUrl.searchParams.get("slug");
  if (!slug) {
    return NextResponse.json({ taken: false });
  }

  const [existing] = await db.select({ id: posts.id }).from(posts).where(eq(posts.slug, slug));
  return NextResponse.json({ taken: !!existing });
}
