import { NextRequest, NextResponse } from "next/server";
import { db, initDB } from "@/db";
import { aiAgents, agentRuns, postVersions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { isAuthenticated } from "@/lib/auth";
import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";

// POST /api/agents/run — run an agent on a post version
export async function POST(request: NextRequest) {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  initDB();
  const body = await request.json();
  const { postVersionId, agentId, modelName } = body;

  if (!postVersionId || !agentId) {
    return NextResponse.json({ error: "Missing postVersionId or agentId" }, { status: 400 });
  }

  // Fetch agent and post version
  const [agent] = await db.select().from(aiAgents).where(eq(aiAgents.id, agentId));
  const [version] = await db.select().from(postVersions).where(eq(postVersions.id, postVersionId));

  if (!agent || !version) {
    return NextResponse.json({ error: "Agent or version not found" }, { status: 404 });
  }

  // Build prompts
  const systemPrompt = agent.characterReadme;
  const userPrompt = `Analyze the following blog post from your perspective.

Title: ${version.title}

Content:
${version.contentMd}

${version.summary ? `Summary: ${version.summary}` : ""}

Provide your analysis in markdown format.`;

  const model = modelName || "claude-sonnet-4-20250514";

  try {
    const { text, usage } = await generateText({
      model: anthropic(model),
      system: systemPrompt,
      prompt: userPrompt,
    });

    // Upsert: delete existing run for this agent+version, then insert
    const existingRuns = await db
      .select()
      .from(agentRuns)
      .where(eq(agentRuns.postVersionId, postVersionId));

    const existingForAgent = existingRuns.find((r) => r.agentId === agentId);
    if (existingForAgent) {
      await db.delete(agentRuns).where(eq(agentRuns.id, existingForAgent.id));
    }

    const [run] = await db.insert(agentRuns).values({
      postVersionId,
      agentId,
      modelProvider: "anthropic",
      modelName: model,
      characterReadmeSnapshot: agent.characterReadme,
      systemPrompt,
      userPrompt,
      contentMd: text,
      tokenCountIn: usage ? (usage as unknown as { promptTokens?: number }).promptTokens ?? null : null,
      tokenCountOut: usage ? (usage as unknown as { completionTokens?: number }).completionTokens ?? null : null,
      generatedAt: new Date().toISOString(),
    }).returning();

    return NextResponse.json(run);
  } catch (error) {
    console.error("Agent run failed:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: `AI call failed: ${message}` }, { status: 500 });
  }
}
