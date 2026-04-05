import { NextResponse } from "next/server";
import { db, initDB } from "@/db";
import { quotes } from "@/db/schema";
import { asc } from "drizzle-orm";

export const dynamic = "force-dynamic";

// GET all quotes
export async function GET() {
  initDB();
  const allQuotes = await db.select().from(quotes).orderBy(asc(quotes.sortOrder));
  return NextResponse.json(allQuotes);
}

// POST create a new quote
export async function POST(request: Request) {
  initDB();
  const body = await request.json();
  const { text, author, translationEn } = body;

  if (!text || !author) {
    return NextResponse.json({ error: "text and author are required" }, { status: 400 });
  }

  const [maxOrder] = await db
    .select({ maxSort: quotes.sortOrder })
    .from(quotes)
    .orderBy(asc(quotes.sortOrder))
    .limit(1);

  const newQuote = {
    text,
    author,
    translationEn: translationEn || null,
    sortOrder: (maxOrder?.maxSort ?? -1) + 1,
  };

  const [created] = await db.insert(quotes).values(newQuote).returning();
  return NextResponse.json(created, { status: 201 });
}
