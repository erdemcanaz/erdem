"use client";

import { useState, useEffect } from "react";
import { use } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CATEGORIES, type CategorySlug } from "@/lib/constants";
import { ReferencesEditor, type Reference } from "@/components/admin/references-editor";
import Link from "next/link";

interface Version {
  id: string;
  versionNumber: number;
  title: string;
  contentMd: string;
  summary: string | null;
  changeNote: string | null;
  references: string | null;
  publishedAt: string;
  isDeleted: boolean;
}

interface Post {
  id: string;
  title: string;
  slug: string;
  category: CategorySlug;
  isPublished: boolean;
  tags: string[];
  versions: Version[];
}

export default function PostEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [summary, setSummary] = useState("");
  const [changeNote, setChangeNote] = useState("");
  const [references, setReferences] = useState<Reference[]>([]);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState(0);

  useEffect(() => {
    fetch(`/api/posts/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setPost(data);
        if (data.versions?.length > 0) {
          const latest = data.versions[0]; // sorted desc
          setContent(latest.contentMd);
          setSummary(latest.summary || "");
          setReferences(latest.references ? JSON.parse(latest.references) : []);
          setSelectedVersion(latest.versionNumber);
        }
        setLoading(false);
      });
  }, [id]);

  if (loading || !post) {
    return <div className="p-8 text-muted-foreground">Loading...</div>;
  }

  const versions = [...post.versions].sort((a, b) => a.versionNumber - b.versionNumber);
  const latestVersion = versions[versions.length - 1];
  const viewingVersion = versions.find((v) => v.versionNumber === selectedVersion) || latestVersion;
  const isViewingLatest = selectedVersion === latestVersion?.versionNumber;

  const handlePublishNewVersion = async () => {
    setSaving(true);
    const res = await fetch(`/api/posts/${id}/versions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: post.title,
        contentMd: content,
        summary,
        changeNote,
        references: references.filter((r) => r.label.trim()),
      }),
    });

    if (res.ok) {
      // Refresh
      const data = await fetch(`/api/posts/${id}`).then((r) => r.json());
      setPost(data);
      const newLatest = data.versions[0];
      setSelectedVersion(newLatest.versionNumber);
      setContent(newLatest.contentMd);
      setSummary(newLatest.summary || "");
      setChangeNote("");
    }
    setSaving(false);
  };

  const handleSoftDelete = async (versionId: string) => {
    await fetch(`/api/posts/${id}/versions/${versionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isDeleted: true }),
    });

    const data = await fetch(`/api/posts/${id}`).then((r) => r.json());
    setPost(data);
  };

  const handleTogglePublish = async () => {
    await fetch(`/api/posts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !post.isPublished }),
    });
    setPost({ ...post, isPublished: !post.isPublished });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/admin/posts" className="text-sm text-muted-foreground hover:text-foreground">
              Posts
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-sm font-medium text-foreground">Edit</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">{post.title}</h1>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs font-medium uppercase tracking-wider text-blue-500">
              {CATEGORIES[post.category]?.title}
            </span>
            <button onClick={handleTogglePublish}>
              <Badge
                variant="secondary"
                className={`text-xs cursor-pointer ${
                  post.isPublished
                    ? "bg-green-50 text-green-600 border-green-200"
                    : ""
                }`}
              >
                {post.isPublished ? "Published" : "Draft — click to publish"}
              </Badge>
            </button>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/admin/posts/${id}/agents`}>
            <Button variant="outline">Run Agents</Button>
          </Link>
          {post.isPublished && (
            <Link href={`/${post.category}/${post.slug}`} target="_blank">
              <Button variant="outline">View Live</Button>
            </Link>
          )}
        </div>
      </div>

      {/* Version Timeline */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Version History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-0 overflow-x-auto pb-2">
            {versions.map((version, index) => (
              <div key={version.id} className="flex items-center">
                {index > 0 && <div className="w-12 h-0.5 bg-border flex-shrink-0" />}
                <button
                  onClick={() => {
                    setSelectedVersion(version.versionNumber);
                    if (version.versionNumber === latestVersion.versionNumber) {
                      setContent(latestVersion.contentMd);
                      setSummary(latestVersion.summary || "");
                    }
                  }}
                  className="flex flex-col items-center gap-1 flex-shrink-0 px-2"
                >
                  <div
                    className={`w-4 h-4 rounded-full border-2 transition-all ${
                      selectedVersion === version.versionNumber
                        ? "bg-blue-500 border-blue-500 scale-110"
                        : version.isDeleted
                        ? "bg-white border-red-300 border-dashed"
                        : "bg-white border-border hover:border-blue-300"
                    }`}
                  />
                  <span className={`text-xs font-medium ${selectedVersion === version.versionNumber ? "text-foreground" : "text-muted-foreground"}`}>
                    v{version.versionNumber}
                  </span>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(version.publishedAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                  </span>
                  {version.isDeleted && <span className="text-xs text-red-500">removed</span>}
                </button>
              </div>
            ))}
          </div>
          {viewingVersion?.changeNote && (
            <p className="text-xs text-muted-foreground mt-3 italic">
              Change note: {viewingVersion.changeNote}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Old version notice */}
      {!isViewingLatest && viewingVersion && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-6 flex items-center justify-between">
          <p className="text-sm text-amber-700">
            Viewing version {selectedVersion} (read-only).
          </p>
          <div className="flex gap-2">
            {!viewingVersion.isDeleted && (
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => handleSoftDelete(viewingVersion.id)}
              >
                Remove Version
              </Button>
            )}
            <Button size="sm" onClick={() => {
              setSelectedVersion(latestVersion.versionNumber);
              setContent(latestVersion.contentMd);
              setSummary(latestVersion.summary || "");
            }}>
              Back to Latest
            </Button>
          </div>
        </div>
      )}

      {/* Content Editor */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">
            {isViewingLatest
              ? `Content (editing v${latestVersion.versionNumber} → v${latestVersion.versionNumber + 1})`
              : `Content (v${selectedVersion} — read only)`}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Summary</Label>
              {isViewingLatest && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-blue-500 hover:text-blue-600"
                  onClick={async () => {
                    if (!content.trim()) return;
                    setAiLoading(true);
                    try {
                      const res = await fetch("/api/ai/summarize", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ title: post.title, content }),
                      });
                      if (res.ok) {
                        const data = await res.json();
                        if (data.summary) setSummary(data.summary);
                      }
                    } catch { /* ignore */ }
                    setAiLoading(false);
                  }}
                  disabled={aiLoading || !content.trim()}
                >
                  {aiLoading ? "Generating..." : "Auto-generate with AI"}
                </Button>
              )}
            </div>
            <Textarea
              value={isViewingLatest ? summary : viewingVersion?.summary || ""}
              onChange={(e) => setSummary(e.target.value)}
              rows={2}
              disabled={!isViewingLatest}
              className={!isViewingLatest ? "opacity-60" : ""}
            />
          </div>

          <div className="space-y-2">
            <Label>Markdown Content</Label>
            <Textarea
              value={isViewingLatest ? content : viewingVersion?.contentMd || ""}
              onChange={(e) => setContent(e.target.value)}
              rows={16}
              disabled={!isViewingLatest}
              className={`font-mono text-sm leading-relaxed ${!isViewingLatest ? "opacity-60" : ""}`}
            />
            {isViewingLatest && (
              <div className="text-xs text-muted-foreground space-y-1.5">
                <p>**bold**, *italic*, ## headings, - lists, `code`, --- horizontal rule</p>
                <p>
                  <code className="bg-muted px-1 py-0.5 rounded font-mono">{">>>"}</code> ... <code className="bg-muted px-1 py-0.5 rounded font-mono">{">>>"}</code>
                  {" "}— Centered verse/poem block (italic, centered)
                </p>
                <p>
                  <code className="bg-muted px-1 py-0.5 rounded font-mono">{":::"}</code> ... <code className="bg-muted px-1 py-0.5 rounded font-mono">{":::"}</code>
                  {" "}— Subnote block (grey sidebar, for personal comments)
                </p>
              </div>
            )}
          </div>

          {/* References */}
          <div className="space-y-2">
            <Label>References & Inspirations</Label>
            {isViewingLatest ? (
              <ReferencesEditor references={references} onChange={setReferences} />
            ) : (
              (() => {
                const vRefs = viewingVersion?.references ? JSON.parse(viewingVersion.references) : [];
                return vRefs.length > 0 ? (
                  <ul className="text-sm text-muted-foreground space-y-1 opacity-60">
                    {vRefs.map((r: { label: string; url: string }, i: number) => (
                      <li key={i}>{r.label}{r.url ? ` — ${r.url}` : ""}</li>
                    ))}
                  </ul>
                ) : <p className="text-xs text-muted-foreground opacity-60">No references</p>;
              })()
            )}
          </div>

          {isViewingLatest && (
            <>
              <Separator />
              <div className="space-y-2">
                <Label>Change Note</Label>
                <Input
                  placeholder="What changed in this version?"
                  value={changeNote}
                  onChange={(e) => setChangeNote(e.target.value)}
                />
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={handlePublishNewVersion}
                  disabled={saving || content === latestVersion.contentMd}
                >
                  {saving ? "Publishing..." : `Publish as v${latestVersion.versionNumber + 1}`}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
