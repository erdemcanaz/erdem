"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AGENT_COLORS } from "@/lib/constants";

interface Agent {
  id: string;
  slug: string;
  displayName: string;
  perspective: string;
  description: string | null;
  characterReadme: string;
  isActive: boolean;
}

const emptyForm = {
  slug: "",
  displayName: "",
  perspective: "",
  description: "",
  characterReadme: "",
};

export default function AdminAgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [editForm, setEditForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchAgents = async () => {
    const res = await fetch("/api/agents");
    const data = await res.json();
    setAgents(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const startEditing = (agent: Agent) => {
    setCreating(false);
    setEditingId(agent.id);
    setEditForm({
      slug: agent.slug,
      displayName: agent.displayName,
      perspective: agent.perspective,
      description: agent.description || "",
      characterReadme: agent.characterReadme,
    });
  };

  const startCreating = () => {
    setEditingId(null);
    setCreating(true);
    setEditForm(emptyForm);
  };

  const cancel = () => {
    setEditingId(null);
    setCreating(false);
  };

  const saveEdit = async () => {
    if (!editForm.displayName || !editForm.perspective || !editForm.characterReadme) return;
    setSaving(true);

    await fetch(`/api/agents/${editingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });

    setEditingId(null);
    await fetchAgents();
    setSaving(false);
  };

  const saveNew = async () => {
    if (!editForm.slug || !editForm.displayName || !editForm.perspective || !editForm.characterReadme) return;
    setSaving(true);

    await fetch("/api/agents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });

    setCreating(false);
    setEditForm(emptyForm);
    await fetchAgents();
    setSaving(false);
  };

  const deleteAgent = async (id: string) => {
    if (!confirm("Delete this agent?")) return;
    await fetch(`/api/agents/${id}`, { method: "DELETE" });
    fetchAgents();
  };

  if (loading) {
    return <div className="p-8 text-muted-foreground">Loading...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">AI Agents</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Define agent characters with README files. Each agent analyzes posts from its unique perspective.
          </p>
        </div>
        <Button variant="outline" onClick={startCreating} disabled={creating}>
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Agent
        </Button>
      </div>

      {/* New Agent Form */}
      {creating && (
        <Card className="mb-6 border-dashed border-2">
          <CardHeader>
            <CardTitle className="text-base">Create New Agent</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Display Name</Label>
                <Input
                  placeholder="e.g. Philosophy Expert"
                  value={editForm.displayName}
                  onChange={(e) => setEditForm((f) => ({ ...f, displayName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input
                  placeholder="e.g. philosophy"
                  value={editForm.slug}
                  onChange={(e) => setEditForm((f) => ({ ...f, slug: e.target.value }))}
                  className="font-mono text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Perspective Label</Label>
                <Input
                  placeholder="e.g. Philosophical Lens"
                  value={editForm.perspective}
                  onChange={(e) => setEditForm((f) => ({ ...f, perspective: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Short Description</Label>
                <Input
                  placeholder="One-line description of this agent"
                  value={editForm.description}
                  onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>Character README (Markdown)</Label>
              <Textarea
                placeholder="# Agent Name&#10;&#10;## Role&#10;You are...&#10;&#10;## How You Think&#10;- ...&#10;&#10;## Output Format&#10;..."
                value={editForm.characterReadme}
                onChange={(e) => setEditForm((f) => ({ ...f, characterReadme: e.target.value }))}
                rows={16}
                className="font-mono text-sm leading-relaxed"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={cancel}>Cancel</Button>
              <Button onClick={saveNew} disabled={saving || !editForm.slug || !editForm.displayName || !editForm.characterReadme}>
                {saving ? "Creating..." : "Create Agent"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {agents.map((agent) => {
          const borderColor = AGENT_COLORS[agent.slug] || "#3B82F6";
          const isEditing = editingId === agent.id;

          return (
            <Card
              key={agent.id}
              className="overflow-hidden"
              style={{ borderLeftWidth: "4px", borderLeftColor: borderColor }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-base">{agent.displayName}</CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      {agent.perspective}
                    </Badge>
                    {agent.isActive && (
                      <Badge className="text-xs bg-green-50 text-green-600 border-green-200">
                        Active
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {isEditing ? (
                      <>
                        <Button size="sm" variant="outline" onClick={cancel}>Cancel</Button>
                        <Button size="sm" onClick={saveEdit} disabled={saving}>
                          {saving ? "Saving..." : "Save"}
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button size="sm" variant="outline" onClick={() => startEditing(agent)}>
                          Edit README
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteAgent(agent.id)}
                          className="text-red-500 hover:text-red-600"
                        >
                          Delete
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                {!isEditing && (
                  <p className="text-xs text-muted-foreground">{agent.description}</p>
                )}
              </CardHeader>

              {isEditing && (
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Display Name</Label>
                      <Input
                        value={editForm.displayName}
                        onChange={(e) => setEditForm((f) => ({ ...f, displayName: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Perspective Label</Label>
                      <Input
                        value={editForm.perspective}
                        onChange={(e) => setEditForm((f) => ({ ...f, perspective: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Short Description</Label>
                    <Input
                      value={editForm.description}
                      onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                    />
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Label>Character README (Markdown)</Label>
                    <Textarea
                      value={editForm.characterReadme}
                      onChange={(e) => setEditForm((f) => ({ ...f, characterReadme: e.target.value }))}
                      rows={20}
                      className="font-mono text-sm leading-relaxed"
                    />
                    <p className="text-xs text-muted-foreground">
                      This README defines the agent&apos;s personality, expertise, and analysis style.
                      It will be used as the system prompt when running the agent.
                    </p>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}

        {agents.length === 0 && !creating && (
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground text-center py-8">
                No agents yet. Create your first agent to get started.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
