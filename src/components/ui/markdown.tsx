"use client";

import { useMemo } from "react";

// Simple markdown to HTML renderer — handles common patterns
function parseMarkdown(md: string): string {
  let html = md
    // Escape HTML
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    // Headers
    .replace(/^#### (.+)$/gm, '<h4 class="text-sm font-semibold mt-4 mb-2">$1</h4>')
    .replace(/^### (.+)$/gm, '<h3 class="text-base font-semibold mt-5 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-lg font-semibold mt-6 mb-3">$1</h2>')
    .replace(/^# (.+)$/gm, '<h2 class="text-xl font-semibold mt-6 mb-3">$1</h2>')
    // Bold + italic
    .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-xs font-mono">$1</code>')
    // Horizontal rule
    .replace(/^---$/gm, '<hr class="my-4 border-border" />')
    // Unordered list items
    .replace(/^- (.+)$/gm, '<li class="ml-4 mb-1">$1</li>')
    .replace(/^• (.+)$/gm, '<li class="ml-4 mb-1">$1</li>')
    // Ordered list items
    .replace(/^(\d+)\. (.+)$/gm, '<li class="ml-4 mb-1"><span class="text-muted-foreground mr-1">$1.</span>$2</li>')
    // Blockquotes
    .replace(/^> (.+)$/gm, '<blockquote class="border-l-2 border-border pl-3 italic text-muted-foreground my-2">$1</blockquote>')
    // Paragraphs — wrap remaining lines
    .replace(/^(?!<[hlubo]|<li|<hr|<code)(.+)$/gm, '<p class="mb-3 leading-relaxed">$1</p>');

  // Wrap consecutive <li> in <ul>
  html = html.replace(/((?:<li[^>]*>.*<\/li>\s*)+)/g, '<ul class="list-disc mb-3">$1</ul>');

  // Clean up empty paragraphs
  html = html.replace(/<p class="[^"]*"><\/p>/g, "");

  return html;
}

export function Markdown({ content, className = "" }: { content: string; className?: string }) {
  const html = useMemo(() => parseMarkdown(content), [content]);

  return (
    <div
      className={`prose-custom text-sm ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
