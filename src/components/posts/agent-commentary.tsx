"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { AGENT_COLORS } from "@/lib/constants";

interface AgentRun {
  id: string;
  agentId: string;
  contentMd: string;
  modelName: string;
  generatedAt: string;
  systemPrompt: string;
  userPrompt: string;
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
  // Summary agent should be first and open
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
  const [showPrompt, setShowPrompt] = useState(false);
  const borderColor = AGENT_COLORS[agent.slug] || "#3B82F6";

  return (
    <div
      className="bg-card border border-border rounded-xl overflow-hidden"
      style={{ borderLeftWidth: "4px", borderLeftColor: borderColor }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-accent/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="font-medium text-foreground">{agent.displayName}</span>
          <Badge variant="secondary" className="text-xs">
            {agent.perspective}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {run.modelName}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {new Date(run.generatedAt).toLocaleDateString()}
          </span>
        </div>
        <svg
          className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {open && (
        <div className="px-4 pb-4">
          <div className="prose text-sm whitespace-pre-wrap leading-relaxed">
            {run.contentMd}
          </div>

          <button
            onClick={() => setShowPrompt(!showPrompt)}
            className="mt-4 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPrompt ? "Hide prompt" : "Show prompt used"}
          </button>

          {showPrompt && (
            <div className="mt-2 bg-muted rounded-lg p-3 space-y-2">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">System Prompt:</p>
                <pre className="text-xs font-mono whitespace-pre-wrap text-foreground/70">
                  {run.systemPrompt}
                </pre>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">User Prompt:</p>
                <pre className="text-xs font-mono whitespace-pre-wrap text-foreground/70">
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
