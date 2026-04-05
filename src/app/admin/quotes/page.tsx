"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Quote {
  id: string;
  text: string;
  author: string;
  translationEn: string | null;
  sortOrder: number;
  createdAt: string;
}

export default function AdminQuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [formText, setFormText] = useState("");
  const [formAuthor, setFormAuthor] = useState("");
  const [formTranslation, setFormTranslation] = useState("");

  const fetchQuotes = async () => {
    const res = await fetch("/api/quotes");
    const data = await res.json();
    setQuotes(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  const resetForm = () => {
    setFormText("");
    setFormAuthor("");
    setFormTranslation("");
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formText.trim() || !formAuthor.trim()) return;

    if (editingId) {
      await fetch(`/api/quotes/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: formText,
          author: formAuthor,
          translationEn: formTranslation || null,
        }),
      });
    } else {
      await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: formText,
          author: formAuthor,
          translationEn: formTranslation || null,
        }),
      });
    }

    resetForm();
    fetchQuotes();
  };

  const handleEdit = (quote: Quote) => {
    setEditingId(quote.id);
    setFormText(quote.text);
    setFormAuthor(quote.author);
    setFormTranslation(quote.translationEn || "");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this quote?")) return;
    await fetch(`/api/quotes/${id}`, { method: "DELETE" });
    fetchQuotes();
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Quotes</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage quotes displayed on the homepage slideshow
        </p>
      </div>

      {/* Add / Edit Form */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-base">
            {editingId ? "Edit Quote" : "Add New Quote"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="quote-text">Quote (in original language)</Label>
              <Textarea
                id="quote-text"
                value={formText}
                onChange={(e) => setFormText(e.target.value)}
                placeholder="Enter the quote in its original language..."
                rows={3}
                required
              />
            </div>
            <div>
              <Label htmlFor="quote-author">Author</Label>
              <Input
                id="quote-author"
                value={formAuthor}
                onChange={(e) => setFormAuthor(e.target.value)}
                placeholder="e.g. Marcus Aurelius"
                required
              />
            </div>
            <div>
              <Label htmlFor="quote-translation">
                English Translation (optional)
              </Label>
              <Textarea
                id="quote-translation"
                value={formTranslation}
                onChange={(e) => setFormTranslation(e.target.value)}
                placeholder="English translation if the quote is not in English..."
                rows={2}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit">
                {editingId ? "Update Quote" : "Add Quote"}
              </Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Quotes List */}
      <div className="space-y-3">
        {loading ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Loading quotes...
          </p>
        ) : quotes.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground text-center py-8">
                No quotes yet. Add your first quote above.
              </p>
            </CardContent>
          </Card>
        ) : (
          quotes.map((quote) => (
            <Card key={quote.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground italic leading-relaxed">
                      &ldquo;{quote.text}&rdquo;
                    </p>
                    <p className="text-sm font-medium text-muted-foreground mt-1.5">
                      — {quote.author}
                    </p>
                    {quote.translationEn && (
                      <p className="text-sm italic text-muted-foreground/70 mt-1">
                        {quote.translationEn}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(quote)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(quote.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
