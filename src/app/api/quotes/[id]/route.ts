import { NextResponse } from "next/server";
import { db, initDB } from "@/db";
import { quotes } from "@/db/schema";
import { eq } from "drizzle-orm";

// PUT update a quote
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  initDB();
  const { id } = await params;
  const body = await request.json();
  const { text, author, translationEn } = body;

  const [updated] = await db
    .update(quotes)
    .set({
      ...(text !== undefined && { text }),
      ...(author !== undefined && { author }),
      ...(translationEn !== undefined && { translationEn: translationEn || null }),
    })
    .where(eq(quotes.id, id))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Quote not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}

// DELETE a quote
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  initDB();
  const { id } = await params;
  const [deleted] = await db.delete(quotes).where(eq(quotes.id, id)).returning();

  if (!deleted) {
    return NextResponse.json({ error: "Quote not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
