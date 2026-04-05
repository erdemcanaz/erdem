"use client";

import { useState, useEffect } from "react";
import { use } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AGENT_COLORS } from "@/lib/constants";
import Link from "next/link";

const supportedModels = [
  { name: "claude-sonnet-4-20250514", label: "Claude Sonnet 4" },
  { name: "claude-haiku-4-5-20251001", label: "Claude Haiku 4.5" },
];

interface Agent {
  id: string;
  slug: string;
  displayName: string;
  perspective: string;
  description: string | null;
  isActive: boolean;
}

interface AgentRun {
  id: string;
  agentId: string;
  contentMd: string;
  modelName: string;
  generatedAt: string;
}

export default function PostAgentsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [post, setPost] = useState<{ versions: { id: string; versionNumber: number }[] } | null>(null);
  const [runs, setRuns] = useState<AgentRun[]>([]);
  const [selectedModels, setSelectedModels] = useState<Record<string, string>>({});
  const [runningAgents, setRunningAgents] = useState<Set<string>>(new Set());
  const [runningAll, setRunningAll] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/agents").then((r) => r.json()),
      fetch(`/api/posts/${id}`).then((r) => r.json()),
    ]).then(([agentsData, postData]) => {
      setAgents(agentsData);
      setPost(postData);
      const defaults: Record<string, string> = {};
      agentsData.forEach((a: Agent) => {
        defaults[a.id] = "claude-sonnet-4-20250514";
      });
      setSelectedModels(defaults);
    });
  }, [id]);

  const latestVersionId = post?.versions?.[0]?.id;

  const handleRunAgent = async (agentId: string) => {
    if (!latestVersionId) return;
    setRunningAgents((prev) => new Set(prev).add(agentId));
    setError("");

    try {
      const res = await fetch("/api/agents/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postVersionId: latestVersionId,
          agentId,
          modelName: selectedModels[agentId],
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Agent run failed");
      } else {
        const run = await res.json();
        setRuns((prev) => [...prev.filter((r) => r.agentId !== agentId), run]);
      }
    } catch {
      setError("Failed to run agent. Check your ANTHROPIC_API_KEY in .env.local");
    }

    setRunningAgents((prev) => {
      const next = new Set(prev);
      next.delete(agentId);
      return next;
    });
  };

  const handleRunAll = async () => {
    setRunningAll(true);
    const perspectiveAgents = agents.filter((a) => a.slug !== "summary");
    for (const agent of perspectiveAgents) {
      await handleRunAgent(agent.id);
    }
    const summaryAgent = agents.find((a) => a.slug === "summary");
    if (summaryAgent) {
      await handleRunAgent(summaryAgent.id);
    }
    setRunningAll(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/admin/posts" className="text-sm text-muted-foreground hover:text-foreground">Posts</Link>
            <span className="text-muted-foreground">/</span>
            <Link href={`/admin/posts/${id}`} className="text-sm text-muted-foreground hover:text-foreground">Edit</Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-sm font-medium text-foreground">Agents</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">AI Agent Commentary</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Run AI agents to analyze this post (requires ANTHROPIC_API_KEY)
          </p>
        </div>
        <Button onClick={handleRunAll} disabled={runningAll || !latestVersionId}>
          {runningAll ? "Running All..." : "Run All Agents"}
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-6">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        {agents.map((agent) => {
          const isRunning = runningAgents.has(agent.id);
          const borderColor = AGENT_COLORS[agent.slug] || "#3B82F6";
          const run = runs.find((r) => r.agentId === agent.id);

          return (
            <Card key={agent.id} style={{ borderLeftWidth: "4px", borderLeftColor: borderColor }}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-base">{agent.displayName}</CardTitle>
                    <Badge variant="secondary" className="text-xs">{agent.perspective}</Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <Select
                      value={selectedModels[agent.id] || "claude-sonnet-4-20250514"}
                      onValueChange={(value) => {
                        if (value) setSelectedModels((prev) => ({ ...prev, [agent.id]: value }));
                      }}
                    >
                      <SelectTrigger className="w-[180px] h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {supportedModels.map((model) => (
                          <SelectItem key={model.name} value={model.name}>{model.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button size="sm" variant="outline" onClick={() => handleRunAgent(agent.id)} disabled={isRunning}>
                      {isRunning ? "Running..." : "Run"}
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{agent.description}</p>
              </CardHeader>

              {run && (
                <CardContent className="pt-0">
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline" className="text-xs">{run.modelName}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(run.generatedAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="prose text-sm whitespace-pre-wrap">{run.contentMd}</div>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
