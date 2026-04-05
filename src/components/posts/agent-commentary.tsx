"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Markdown } from "@/components/ui/markdown";
import { AGENT_COLORS } from "@/lib/constants";

interface AgentRun {
  id: string;
  agentId: string;
  contentMd: string;
  modelName: string;
  generatedAt: string;
  systemPrompt: string;
  userPrompt: string;
  characterReadmeSnapshot: string;
}

interface Agent {
  id: string;
  slug: string;
  displayName: string;
  perspective: string;
}

export function AgentCommentarySection({
  runs,
  agents,
}: {
  runs: AgentRun[];
  agents: Agent[];
}) {
  const sortedAgents = [...agents].sort((a, b) => {
    if (a.slug === "summary") return -1;
    if (b.slug === "summary") return 1;
    return 0;
  });

  return (
    <div className="mt-12">
      <h2 className="text-xl font-semibold text-foreground mb-6">
        AI Perspectives
      </h2>
      <div className="space-y-3">
        {sortedAgents.map((agent) => {
          const run = runs.find((r) => r.agentId === agent.id);
          if (!run) return null;
          return (
            <AgentCard
              key={agent.id}
              agent={agent}
              run={run}
              defaultOpen={agent.slug === "summary"}
            />
          );
        })}
      </div>
    </div>
  );
}

function AgentCard({
  agent,
  run,
  defaultOpen,
}: {
  agent: Agent;
  run: AgentRun;
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [showMeta, setShowMeta] = useState<"none" | "readme" | "prompt">("none");
  const borderColor = AGENT_COLORS[agent.slug] || "#3B82F6";

  return (
    <div
      className="bg-card border border-border rounded-xl overflow-hidden"
      style={{ borderLeftWidth: "4px", borderLeftColor: borderColor }}
    >
      {/* Header — always visible */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-accent/30 transition-colors"
      >
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-medium text-foreground">{agent.displayName}</span>
          <Badge variant="secondary" className="text-xs">{agent.perspective}</Badge>
          <Badge variant="outline" className="text-xs">{run.modelName}</Badge>
          <span className="text-xs text-muted-foreground">
            {new Date(run.generatedAt).toLocaleDateString()}
          </span>
        </div>
        <svg
          className={`w-4 h-4 text-muted-foreground transition-transform duration-200 flex-shrink-0 ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {/* Expanded content */}
      {open && (
        <div className="px-4 pb-4">
          {/* Agent response — rendered as markdown */}
          <Markdown content={run.contentMd} />

          {/* Meta toggles */}
          <div className="mt-4 pt-3 border-t border-border flex gap-3">
            <button
              onClick={() => setShowMeta(showMeta === "readme" ? "none" : "readme")}
              className={`text-xs transition-colors ${showMeta === "readme" ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"}`}
            >
              {showMeta === "readme" ? "Hide agent character" : "View agent character"}
            </button>
            <span className="text-xs text-border">|</span>
            <button
              onClick={() => setShowMeta(showMeta === "prompt" ? "none" : "prompt")}
              className={`text-xs transition-colors ${showMeta === "prompt" ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"}`}
            >
              {showMeta === "prompt" ? "Hide prompts" : "View prompts used"}
            </button>
          </div>

          {/* Agent Character README snapshot */}
          {showMeta === "readme" && (
            <div className="mt-3 bg-muted/50 rounded-lg p-4">
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Agent Character README (snapshot at time of generation)
              </p>
              <Markdown content={run.characterReadmeSnapshot} className="text-xs opacity-80" />
            </div>
          )}

          {/* Prompts used */}
          {showMeta === "prompt" && (
            <div className="mt-3 bg-muted/50 rounded-lg p-4 space-y-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">System Prompt</p>
                <pre className="text-xs font-mono whitespace-pre-wrap text-foreground/70 bg-muted rounded p-2">
                  {run.systemPrompt}
                </pre>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">User Prompt</p>
                <pre className="text-xs font-mono whitespace-pre-wrap text-foreground/70 bg-muted rounded p-2">
                  {run.userPrompt}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
