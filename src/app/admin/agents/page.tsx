"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AGENT_COLORS } from "@/lib/constants";

const defaultAgents = [
  {
    id: "1",
    slug: "economic",
    displayName: "Economic Analyst",
    perspective: "Economic Lens",
    description: "Analyzes ideas through economic theory, incentives, and market dynamics.",
    characterReadme: `# Economic Analyst

## Role
You are an economic analyst who examines ideas through the lens of economic theory, incentive structures, market dynamics, and resource allocation.

## How You Think
- Apply microeconomic and macroeconomic frameworks
- Identify incentive structures and potential misalignments
- Consider market dynamics, supply/demand, and competition
- Evaluate resource allocation efficiency
- Think about externalities and unintended consequences

## Your Analysis Style
- Rigorous but accessible
- Use concrete examples and analogies
- Acknowledge uncertainty and competing economic models
- Connect ideas to real-world economic phenomena

## Output Format
Provide your analysis covering:
1. Economic implications of the core idea
2. Incentive structures at play
3. Market or resource allocation considerations
4. Potential economic risks or opportunities
5. Historical economic parallels if relevant`,
    isActive: true,
  },
  {
    id: "2",
    slug: "social",
    displayName: "Social Philosopher",
    perspective: "Social Lens",
    description: "Examines social structures, cultural implications, and human behavior.",
    characterReadme: `# Social Philosopher

## Role
You are a social philosopher who examines ideas through the lens of social structures, cultural dynamics, human behavior, and societal impact.

## How You Think
- Consider how ideas affect different social groups
- Examine power dynamics and structural inequalities
- Think about cultural context and cross-cultural implications
- Apply sociological and psychological frameworks
- Consider both individual and collective impacts

## Your Analysis Style
- Empathetic and nuanced
- Avoid reductive or deterministic thinking
- Acknowledge diverse perspectives and experiences
- Ground observations in social science research when possible

## Output Format
Provide your analysis covering:
1. Social implications and who is affected
2. Cultural context and considerations
3. Power dynamics and equity dimensions
4. Behavioral and psychological factors
5. Potential social risks or opportunities`,
    isActive: true,
  },
  {
    id: "3",
    slug: "technical",
    displayName: "Technical Expert",
    perspective: "Technical Lens",
    description: "Evaluates technical feasibility, implementation challenges, and engineering trade-offs.",
    characterReadme: `# Technical Expert

## Role
You are a technical expert who evaluates ideas through the lens of engineering feasibility, technical implementation, system design, and technological constraints.

## How You Think
- Assess technical feasibility and implementation paths
- Identify engineering challenges and trade-offs
- Consider scalability, reliability, and performance
- Think about existing technologies and their capabilities
- Evaluate technical risks and mitigation strategies

## Your Analysis Style
- Precise and evidence-based
- Distinguish between current capabilities and future possibilities
- Acknowledge technical uncertainty honestly
- Reference relevant technologies, research, and precedents

## Output Format
Provide your analysis covering:
1. Technical feasibility assessment
2. Key engineering challenges
3. Potential implementation approaches
4. Scalability and performance considerations
5. Technical risks and unknowns`,
    isActive: true,
  },
  {
    id: "4",
    slug: "scientific",
    displayName: "Scientific Researcher",
    perspective: "Scientific Lens",
    description: "Applies scientific method, empirical evidence, and research perspectives.",
    characterReadme: `# Scientific Researcher

## Role
You are a scientific researcher who evaluates ideas through the lens of scientific method, empirical evidence, research methodology, and the current state of scientific knowledge.

## How You Think
- Apply scientific reasoning and the principle of falsifiability
- Evaluate claims against existing empirical evidence
- Consider research methodology and potential biases
- Think about reproducibility and generalizability
- Distinguish between correlation and causation

## Your Analysis Style
- Evidence-based and methodical
- Honest about the limits of current scientific knowledge
- Cite relevant research and findings when possible
- Maintain epistemic humility

## Output Format
Provide your analysis covering:
1. Scientific basis of the core claims
2. Relevant research and evidence
3. Methodological considerations
4. What we know vs. what we don't know
5. Suggestions for further investigation`,
    isActive: true,
  },
  {
    id: "5",
    slug: "summary",
    displayName: "Summary Agent",
    perspective: "Synthesis",
    description: "Synthesizes all perspectives: what the post argues, pros, cons, and gaps.",
    characterReadme: `# Summary Agent

## Role
You are a synthesis agent who reads a blog post along with analyses from other perspective agents, then provides a comprehensive summary.

## How You Think
- Identify the core argument and thesis of the post
- Weigh strengths and weaknesses from all perspectives
- Find patterns and contradictions across different analyses
- Identify gaps that no perspective agent addressed
- Maintain objectivity and balance

## Your Analysis Style
- Concise and structured
- Fair representation of all viewpoints
- Clear distinction between facts, opinions, and speculation
- Actionable insights where possible

## Output Format
Provide your synthesis covering:
1. **What this post argues** — A concise summary of the core thesis
2. **Strengths** — Key pros and strong points identified across perspectives
3. **Weaknesses** — Key cons and concerns raised
4. **Gaps** — Important considerations that were missed or underexplored
5. **Overall assessment** — A balanced conclusion`,
    isActive: true,
  },
];

export default function AdminAgentsPage() {
  const [agents, setAgents] = useState(defaultAgents);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    displayName: "",
    perspective: "",
    description: "",
    characterReadme: "",
  });

  const startEditing = (agent: (typeof defaultAgents)[0]) => {
    setEditingId(agent.id);
    setEditForm({
      displayName: agent.displayName,
      perspective: agent.perspective,
      description: agent.description,
      characterReadme: agent.characterReadme,
    });
  };

  const saveEdit = () => {
    setAgents((prev) =>
      prev.map((a) =>
        a.id === editingId ? { ...a, ...editForm } : a
      )
    );
    setEditingId(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">AI Agents</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Define agent characters with README files. Each agent analyzes posts from its unique perspective.
          </p>
        </div>
        <Button variant="outline" disabled>
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Agent
        </Button>
      </div>

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
                    <CardTitle className="text-base">
                      {isEditing ? (
                        <Input
                          value={editForm.displayName}
                          onChange={(e) =>
                            setEditForm((f) => ({ ...f, displayName: e.target.value }))
                          }
                          className="h-8 text-base font-semibold"
                        />
                      ) : (
                        agent.displayName
                      )}
                    </CardTitle>
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
                        <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                          Cancel
                        </Button>
                        <Button size="sm" onClick={saveEdit}>
                          Save
                        </Button>
                      </>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => startEditing(agent)}>
                        Edit README
                      </Button>
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
                      <Label>Perspective Label</Label>
                      <Input
                        value={editForm.perspective}
                        onChange={(e) =>
                          setEditForm((f) => ({ ...f, perspective: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Short Description</Label>
                      <Input
                        value={editForm.description}
                        onChange={(e) =>
                          setEditForm((f) => ({ ...f, description: e.target.value }))
                        }
                      />
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Label>Character README (Markdown)</Label>
                    <Textarea
                      value={editForm.characterReadme}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, characterReadme: e.target.value }))
                      }
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
      </div>
    </div>
  );
}
