"use client";

import { useEffect, useRef } from "react";

const STARS = [
  // Top
  { x: 25, y: 8, r: 1.6 }, { x: 80, y: 5, r: 1.8 }, { x: 140, y: 10, r: 2.0 },
  { x: 175, y: 7, r: 1.5 }, { x: 55, y: 14, r: 1.4 }, { x: 110, y: 8, r: 1.7 },
  // Upper mid
  { x: 15, y: 22, r: 1.3 }, { x: 45, y: 28, r: 1.5 }, { x: 70, y: 20, r: 1.2 },
  { x: 100, y: 18, r: 1.6 }, { x: 130, y: 24, r: 1.4 }, { x: 160, y: 16, r: 1.3 },
  { x: 188, y: 20, r: 1.1 }, { x: 35, y: 35, r: 1.2 },
  // Mid
  { x: 10, y: 40, r: 1.0 }, { x: 60, y: 38, r: 1.1 }, { x: 90, y: 32, r: 1.3 },
  { x: 120, y: 36, r: 1.0 }, { x: 150, y: 40, r: 1.2 }, { x: 180, y: 34, r: 0.9 },
  { x: 40, y: 45, r: 0.9 }, { x: 75, y: 42, r: 1.0 },
  // Lower
  { x: 20, y: 55, r: 0.8 }, { x: 55, y: 52, r: 0.9 }, { x: 145, y: 50, r: 0.9 },
  { x: 170, y: 46, r: 0.7 }, { x: 130, y: 55, r: 0.8 }, { x: 190, y: 50, r: 0.7 },
  // Tiny
  { x: 8, y: 12, r: 0.5 }, { x: 48, y: 6, r: 0.5 }, { x: 95, y: 12, r: 0.5 },
  { x: 165, y: 30, r: 0.5 }, { x: 30, y: 48, r: 0.5 }, { x: 115, y: 42, r: 0.5 },
  { x: 68, y: 30, r: 0.6 }, { x: 155, y: 55, r: 0.5 }, { x: 5, y: 35, r: 0.5 },
];

export function QuestIcon({ className = "w-12 h-12" }: { className?: string }) {
  const starsRef = useRef<(SVGCircleElement | null)[]>([]);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    function twinkle(index: number) {
      const star = starsRef.current[index];
      if (!star) return;
      const delay = 600 + Math.random() * 2500;
      const fadeDur = 300 + Math.random() * 500;

      const timer = setTimeout(() => {
        star.style.transition = `opacity ${fadeDur}ms ease-in-out`;
        star.style.opacity = (0.6 + Math.random() * 0.4).toString();
        const dimTimer = setTimeout(() => {
          star.style.opacity = (0.03 + Math.random() * 0.15).toString();
          twinkle(index);
        }, fadeDur + 150 + Math.random() * 350);
        timers.push(dimTimer);
      }, delay);
      timers.push(timer);
    }

    STARS.forEach((_, i) => {
      const t = setTimeout(() => twinkle(i), Math.random() * 2000);
      timers.push(t);
    });
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <svg viewBox="0 0 200 120" fill="none" className={className}>
      {/* Twinkling stars */}
      {STARS.map((star, i) => (
        <circle
          key={i}
          ref={(el) => { starsRef.current[i] = el; }}
          cx={star.x}
          cy={star.y}
          r={star.r}
          fill="currentColor"
          opacity={0.05 + Math.random() * 0.25}
        />
      ))}

      {/* Person — minimal abstract silhouette */}
      <path
        d="M96 56 a4.5 4.5 0 1 1 9 0 a4.5 4.5 0 1 1 -9 0
           M98 61 L97 62 L93 100 L95.5 100 L98.5 78 L100.5 78 L103.5 100 L106 100 L102 62 L101 61 Z"
        fill="currentColor"
        opacity="0.45"
      />
    </svg>
  );
}
