"use client";

import { useEffect, useState, useCallback } from "react";

interface Quote {
  id: string;
  text: string;
  author: string;
  translationEn: string | null;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function QuoteSlideshow() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    fetch("/api/quotes")
      .then((res) => res.json())
      .then((data: Quote[]) => {
        if (data.length > 0) {
          setQuotes(shuffleArray(data));
        }
      })
      .catch(() => {});
  }, []);

  const advance = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % quotes.length);
      setIsVisible(true);
    }, 600);
  }, [quotes.length]);

  useEffect(() => {
    if (quotes.length <= 1) return;
    const interval = setInterval(advance, 8000);
    return () => clearInterval(interval);
  }, [quotes.length, advance]);

  if (quotes.length === 0) return null;

  const quote = quotes[currentIndex];

  return (
    <div className="w-full max-w-[700px] mx-auto px-6 py-8 min-h-[140px] flex flex-col items-center justify-center">
      <div
        className={`text-center transition-opacity duration-500 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <blockquote className="text-lg md:text-xl italic text-foreground/80 leading-relaxed">
          &ldquo;{quote.text}&rdquo;
        </blockquote>
        <p className="mt-3 text-sm font-medium text-muted-foreground">
          — {quote.author}
        </p>
        <p className="mt-2 text-sm italic text-muted-foreground/70 min-h-[1.25rem]">
          {quote.translationEn ?? "\u00A0"}
        </p>
      </div>
    </div>
  );
}
