"use client";

import { useEffect, useRef, useState } from "react";

const SYMBOLS = "ABCDEFGHIJKLMNOPQRSTUVWXYZαβγδεζηθλμπσφψω∞∑∫∂√∇≈≠±∈∀∃01234567890∆Ωℝ→←↑∝≡".split("");

interface FloatingChar {
  id: number;
  char: string;
  x: number;
  y: number;
  opacity: number;
  fontSize: number;
}

export function SynthesisIcon({ className = "w-12 h-12" }: { className?: string }) {
  const [chars, setChars] = useState<FloatingChar[]>([]);
  const nextId = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setChars((prev) => [...prev, {
        id: nextId.current++,
        char: SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        x: 70 + (Math.random() - 0.5) * 55,
        y: 68,
        opacity: 0,
        fontSize: 5 + Math.random() * 4,
      }].slice(-14));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const tick = setInterval(() => {
      setChars((prev) =>
        prev
          .map((c) => ({
            ...c,
            y: c.y - 0.4,
            opacity: c.opacity < 0.5 && c.y > 40
              ? Math.min(c.opacity + 0.015, 0.5)
              : c.opacity - 0.008,
          }))
          .filter((c) => c.opacity > 0)
      );
    }, 50);
    return () => clearInterval(tick);
  }, []);

  return (
    <svg viewBox="0 0 140 150" fill="none" className={className}>
      {/* Floating characters */}
      {chars.map((c) => (
        <text
          key={c.id}
          x={c.x}
          y={c.y}
          fontSize={c.fontSize}
          fill="currentColor"
          opacity={c.opacity}
          textAnchor="middle"
          style={{ fontFamily: "monospace" }}
        >
          {c.char}
        </text>
      ))}

      {/* Hand + Quill group — writing sway */}
      <g>
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0,0; 2,0.5; -1.5,0; 1,0.5; -2,0; 0,0"
          dur="3s"
          repeatCount="indefinite"
        />

        {/* Quill — diagonal, nib at bottom-left */}
        <g transform="rotate(-40 70 95)">
          {/* Shaft */}
          <line x1="70" y1="40" x2="70" y2="108" stroke="currentColor" strokeWidth="1" opacity="0.5" />

          {/* Feather vane — single elegant shape */}
          <path
            d="M70 40 C78 46, 80 56, 78 66 C76 74, 72 80, 70 84"
            stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.4"
          />
          <path
            d="M70 40 C62 46, 60 56, 62 66 C64 74, 68 80, 70 84"
            stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.4"
          />

          {/* Few barbs */}
          <line x1="70" y1="50" x2="77" y2="48" stroke="currentColor" strokeWidth="0.35" opacity="0.2" />
          <line x1="70" y1="60" x2="78" y2="57" stroke="currentColor" strokeWidth="0.35" opacity="0.2" />
          <line x1="70" y1="70" x2="76" y2="68" stroke="currentColor" strokeWidth="0.35" opacity="0.2" />
          <line x1="70" y1="50" x2="63" y2="48" stroke="currentColor" strokeWidth="0.35" opacity="0.2" />
          <line x1="70" y1="60" x2="62" y2="57" stroke="currentColor" strokeWidth="0.35" opacity="0.2" />
          <line x1="70" y1="70" x2="64" y2="68" stroke="currentColor" strokeWidth="0.35" opacity="0.2" />

          {/* Nib */}
          <path d="M69.5 106 L70 112 L70.5 106" stroke="currentColor" strokeWidth="0.7" fill="none" opacity="0.5" />
        </g>

        {/* Hand — single continuous elegant path, like a calligraphy stroke */}
        <path
          d="M62 108
             C58 106, 54 108, 53 112
             C52 116, 54 119, 58 120
             C60 120.5, 62 120, 64 118
             L66 114
             C68 110, 72 108, 76 110
             C79 111, 80 114, 78 117
             C76 120, 72 121, 70 122
             C66 123, 62 126, 62 130
             C62 134, 66 137, 70 136"
          stroke="currentColor"
          strokeWidth="1.8"
          fill="none"
          opacity="0.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}
