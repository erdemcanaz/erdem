"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CATEGORIES } from "@/lib/constants";
import { ReferencesEditor, type Reference } from "@/components/admin/references-editor";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export default function NewPostPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [saving, setSaving] = useState(false);
  const [references, setReferences] = useState<Reference[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [postDate, setPostDate] = useState("");
  const [error, setError] = useState("");
  const [slugTaken, setSlugTaken] = useState(false);
  const [checkingSlug, setCheckingSlug] = useState(false);

  const checkSlug = async (s: string) => {
    if (!s.trim()) { setSlugTaken(false); return; }
    setCheckingSlug(true);
    try {
      const res = await fetch(`/api/posts/check-slug?slug=${encodeURIComponent(s)}`);
      const data = await res.json();
      setSlugTaken(data.taken);
    } catch {
      setSlugTaken(false);
    }
    setCheckingSlug(false);
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slug || slug === slugify(title)) {
      const newSlug = slugify(value);
      setSlug(newSlug);
      checkSlug(newSlug);
    }
  };

  const handleAiGenerate = async () => {
    if (!content.trim()) {
      setError("Write some content first so AI can analyze it.");
      return;
    }
    setAiLoading(true);
    setError("");

    try {
      const res = await fetch("/api/ai/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "AI generation failed");
        setAiLoading(false);
        return;
      }

      const data = await res.json();
      if (data.summary) setSummary(data.summary);
      if (data.tags?.length) setTags(data.tags.join(", "));
    } catch {
      setError("AI generation failed. Check your ANTHROPIC_API_KEY.");
    }
    setAiLoading(false);
  };

  const handleSave = async (publish: boolean) => {
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          category,
          summary,
          contentMd: content,
          tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
          references: references.filter((r) => r.label.trim()),
          isPublished: publish,
          ...(postDate && { postDate }),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to save");
        setSaving(false);
        return;
      }

      router.push("/admin/posts");
    } catch {
      setError("Failed to save post");
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">New Post</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create a new article — this will be version 1
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleSave(false)}
            disabled={saving || !title || !category}
          >
            Save Draft
          </Button>
          <Button
            onClick={() => handleSave(true)}
            disabled={saving || !title || !category || !content}
          >
            {saving ? "Saving..." : "Publish"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-6">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Post Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Enter post title..."
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  placeholder="post-url-slug"
                  value={slug}
                  onChange={(e) => { setSlug(e.target.value); checkSlug(e.target.value); }}
                  className={`font-mono text-sm ${slugTaken ? "border-amber-400 focus-visible:ring-amber-400" : ""}`}
                />
                {slugTaken && (
                  <p className="text-xs text-amber-600">
                    This slug is already taken. A suffix will be added automatically if you continue.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={(v) => { if (v) setCategory(v); }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(CATEGORIES).map((cat) => (
                      <SelectItem key={cat.slug} value={cat.slug}>
                        {cat.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="post-date">Post Date (optional — defaults to now)</Label>
              <Input
                id="post-date"
                type="date"
                value={postDate}
                onChange={(e) => setPostDate(e.target.value)}
                className="w-48"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="summary">Summary</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-blue-500 hover:text-blue-600"
                  onClick={handleAiGenerate}
                  disabled={aiLoading || !content.trim()}
                >
                  {aiLoading ? (
                    <>
                      <svg className="w-3 h-3 mr-1.5 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Generating...
                    </>
                  ) : (
                    <>
                      <svg className="w-3 h-3 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                      </svg>
                      Auto-generate summary &amp; tags
                    </>
                  )}
                </Button>
              </div>
              <Textarea
                id="summary"
                placeholder="A brief summary of this post..."
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                placeholder="AI, Philosophy, Future (comma separated)"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">References & Inspirations</CardTitle>
          </CardHeader>
          <CardContent>
            <ReferencesEditor references={references} onChange={setReferences} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Content (Markdown)</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Write your post in Markdown..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={20}
              className="font-mono text-sm leading-relaxed"
            />
            <div className="text-xs text-muted-foreground mt-3 space-y-1.5">
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
