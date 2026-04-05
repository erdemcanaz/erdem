import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";

export async function POST(request: NextRequest) {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, content } = await request.json();

  if (!content) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }

  try {
    const { text } = await generateText({
      model: anthropic("claude-haiku-4-5"),
      system: `You extract metadata from blog posts. Respond ONLY in valid JSON, nothing else. No markdown, no explanation.`,
      prompt: `Analyze this blog post and return a JSON object with:
- "summary": a 1-2 sentence summary (max 200 chars)
- "tags": an array of 3-6 relevant single-word or short tags

Title: ${title || "Untitled"}

Content:
${content.slice(0, 4000)}

Respond with ONLY the JSON object:`,
    });

    // Parse the JSON from the response
    const cleaned = text.trim().replace(/^```json\s*/, "").replace(/\s*```$/, "");
    const parsed = JSON.parse(cleaned);

    return NextResponse.json({
      summary: parsed.summary || "",
      tags: Array.isArray(parsed.tags) ? parsed.tags : [],
    });
  } catch (error) {
    console.error("Summarize failed:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: `AI call failed: ${message}` }, { status: 500 });
  }
}
