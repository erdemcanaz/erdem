"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface Reference {
  label: string;
  url: string;
}

export function ReferencesEditor({
  references,
  onChange,
}: {
  references: Reference[];
  onChange: (refs: Reference[]) => void;
}) {
  const addRef = () => {
    onChange([...references, { label: "", url: "" }]);
  };

  const updateRef = (index: number, field: "label" | "url", value: string) => {
    const updated = [...references];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeRef = (index: number) => {
    onChange(references.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {references.map((ref, i) => (
        <div key={i} className="flex gap-2 items-start">
          <div className="flex-1 space-y-1.5">
            <Input
              placeholder="What inspired this? (book, article, conversation, video...)"
              value={ref.label}
              onChange={(e) => updateRef(i, "label", e.target.value)}
              className="text-sm"
            />
            <Input
              placeholder="Link (optional) — https://..."
              value={ref.url}
              onChange={(e) => updateRef(i, "url", e.target.value)}
              className="text-sm font-mono text-muted-foreground"
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-red-500 mt-1"
            onClick={() => removeRef(i)}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>
      ))}

      <Button type="button" variant="outline" size="sm" onClick={addRef} className="text-xs">
        <svg className="w-3.5 h-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Add reference
      </Button>

      {references.length === 0 && (
        <p className="text-xs text-muted-foreground">
          Books, articles, videos, conversations — anything that shaped your thinking on this.
        </p>
      )}
    </div>
  );
}
