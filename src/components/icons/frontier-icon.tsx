"use client";

import { useEffect, useState } from "react";

// Phase 0: Atom   → Phase 1: Solar System   → Phase 2: Galaxy/Universe   → repeat
const PHASE_DURATION = 3500;
const TRANSITION_MS = 1600;

export function FrontierIcon({ className = "w-12 h-12" }: { className?: string }) {
  const [phase, setPhase] = useState(0); // 0=atom, 1=solar, 2=galaxy

  useEffect(() => {
    const interval = setInterval(() => {
      setPhase((p) => (p + 1) % 3);
    }, PHASE_DURATION);
    return () => clearInterval(interval);
  }, []);

  const t = `opacity ${TRANSITION_MS}ms ease-in-out`;

  return (
    <svg viewBox="0 0 200 200" fill="none" className={className}>
      {/* Faint outer ring — always present */}
      <circle cx="100" cy="100" r="94" stroke="currentColor" strokeWidth="0.4" opacity="0.08" />

      {/* ===================== ATOM ===================== */}
      <g style={{ opacity: phase === 0 ? 1 : 0, transition: t }}>
        {/* Three orbital ellipses */}
        <ellipse cx="100" cy="100" rx="58" ry="20" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.4" transform="rotate(0 100 100)" />
        <ellipse cx="100" cy="100" rx="58" ry="20" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.4" transform="rotate(60 100 100)" />
        <ellipse cx="100" cy="100" rx="58" ry="20" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.4" transform="rotate(120 100 100)" />

        {/* Electrons */}
        <circle r="4" fill="currentColor" opacity="0.6">
          <animateMotion dur="2.2s" repeatCount="indefinite"><mpath href="#o1" /></animateMotion>
        </circle>
        <circle r="3.5" fill="currentColor" opacity="0.5">
          <animateMotion dur="2.8s" repeatCount="indefinite"><mpath href="#o2" /></animateMotion>
        </circle>
        <circle r="3.5" fill="currentColor" opacity="0.45">
          <animateMotion dur="3.4s" repeatCount="indefinite"><mpath href="#o3" /></animateMotion>
        </circle>

        {/* Nucleus */}
        <circle cx="100" cy="100" r="7" fill="currentColor" opacity="0.12" />
        <circle cx="100" cy="100" r="4" fill="currentColor" opacity="0.5" />
      </g>

      {/* ================ SOLAR SYSTEM ================ */}
      <g style={{ opacity: phase === 1 ? 1 : 0, transition: t }}>
        {/* Orbit rings — concentric circles */}
        <circle cx="100" cy="100" r="24" stroke="currentColor" strokeWidth="0.6" fill="none" opacity="0.25" />
        <circle cx="100" cy="100" r="40" stroke="currentColor" strokeWidth="0.6" fill="none" opacity="0.2" />
        <circle cx="100" cy="100" r="56" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.18" />
        <circle cx="100" cy="100" r="72" stroke="currentColor" strokeWidth="0.4" fill="none" opacity="0.14" />
        <circle cx="100" cy="100" r="86" stroke="currentColor" strokeWidth="0.4" fill="none" opacity="0.1" />

        {/* Sun — center with glow */}
        <circle cx="100" cy="100" r="10" fill="currentColor" opacity="0.08">
          <animate attributeName="r" values="10;13;10" dur="3s" repeatCount="indefinite" />
        </circle>
        <circle cx="100" cy="100" r="7" fill="currentColor" opacity="0.35" />
        <circle cx="100" cy="100" r="4" fill="currentColor" opacity="0.6" />

        {/* Planets orbiting */}
        {/* Mercury — small, fast, inner */}
        <circle r="2" fill="currentColor" opacity="0.5">
          <animateMotion dur="1.8s" repeatCount="indefinite"><mpath href="#sorbit1" /></animateMotion>
        </circle>
        {/* Venus */}
        <circle r="3" fill="currentColor" opacity="0.45">
          <animateMotion dur="2.6s" repeatCount="indefinite"><mpath href="#sorbit2" /></animateMotion>
        </circle>
        {/* Earth */}
        <circle r="3.5" fill="currentColor" opacity="0.55">
          <animateMotion dur="3.5s" repeatCount="indefinite"><mpath href="#sorbit3" /></animateMotion>
        </circle>
        {/* Mars */}
        <circle r="2.5" fill="currentColor" opacity="0.4">
          <animateMotion dur="4.5s" repeatCount="indefinite"><mpath href="#sorbit4" /></animateMotion>
        </circle>
        {/* Jupiter — big, outer */}
        <circle r="5" fill="currentColor" opacity="0.3">
          <animateMotion dur="6s" repeatCount="indefinite"><mpath href="#sorbit5" /></animateMotion>
        </circle>
      </g>

      {/* ================ GALAXY / UNIVERSE ================ */}
      <g style={{ opacity: phase === 2 ? 1 : 0, transition: t }}>
        {/* Outer disk halo */}
        <circle cx="100" cy="100" r="88" stroke="currentColor" strokeWidth="0.3" fill="none" opacity="0.06" />

        {/* Core glow layers */}
        <circle cx="100" cy="100" r="18" fill="currentColor" opacity="0.06" />
        <circle cx="100" cy="100" r="10" fill="currentColor" opacity="0.12" />

        {/* Logarithmic spiral arm 1 — continuous swirl outward from center */}
        <path
          d="M100 100
             C102 96, 105 93, 109 92
             C115 90, 120 94, 121 100
             C122 108, 117 114, 110 116
             C101 118, 94 112, 92 104
             C90 94, 96 84, 106 80
             C118 76, 130 84, 133 98
             C136 114, 126 130, 110 136
             C92 142, 76 130, 72 112
             C68 92, 80 72, 100 66
             C122 60, 142 76, 148 98
             C154 122, 140 148, 116 156
             C88 166, 62 146, 54 118
             C46 88, 64 58, 94 48
             C128 38, 158 62, 166 96"
          stroke="currentColor" strokeWidth="1.1" fill="none" opacity="0.5"
        />

        {/* Spiral arm 2 — 180° rotated copy */}
        <path
          d="M100 100
             C98 104, 95 107, 91 108
             C85 110, 80 106, 79 100
             C78 92, 83 86, 90 84
             C99 82, 106 88, 108 96
             C110 106, 104 116, 94 120
             C82 124, 70 116, 67 102
             C64 86, 74 70, 90 64
             C108 58, 124 70, 128 88
             C132 108, 120 128, 104 136
             C86 144, 66 130, 60 110
             C54 88, 68 64, 92 54
             C120 44, 146 62, 154 88"
          stroke="currentColor" strokeWidth="1.1" fill="none" opacity="0.5"
          transform="rotate(180 100 100)"
        />

        {/* Faint inner spiral wisps */}
        <path
          d="M104 98 C108 92, 116 90, 120 96 C124 104, 118 112, 110 112"
          stroke="currentColor" strokeWidth="0.6" fill="none" opacity="0.25"
        />
        <path
          d="M96 102 C92 108, 84 110, 80 104 C76 96, 82 88, 90 88"
          stroke="currentColor" strokeWidth="0.6" fill="none" opacity="0.25"
        />

        {/* Stars scattered — more dense near arms */}
        {/* Inner */}
        <circle cx="114" cy="88" r="1.2" fill="currentColor" opacity="0.5" />
        <circle cx="86" cy="112" r="1.2" fill="currentColor" opacity="0.5" />
        <circle cx="122" cy="106" r="1.0" fill="currentColor" opacity="0.4" />
        <circle cx="78" cy="94" r="1.0" fill="currentColor" opacity="0.4" />
        {/* Mid */}
        <circle cx="136" cy="92" r="1.3" fill="currentColor" opacity="0.35" />
        <circle cx="64" cy="108" r="1.3" fill="currentColor" opacity="0.35" />
        <circle cx="128" cy="130" r="1.1" fill="currentColor" opacity="0.3" />
        <circle cx="72" cy="70" r="1.1" fill="currentColor" opacity="0.3" />
        <circle cx="108" cy="140" r="1.0" fill="currentColor" opacity="0.28" />
        <circle cx="92" cy="60" r="1.0" fill="currentColor" opacity="0.28" />
        <circle cx="144" cy="114" r="0.9" fill="currentColor" opacity="0.25" />
        <circle cx="56" cy="86" r="0.9" fill="currentColor" opacity="0.25" />
        {/* Outer */}
        <circle cx="152" cy="82" r="0.8" fill="currentColor" opacity="0.18" />
        <circle cx="48" cy="118" r="0.8" fill="currentColor" opacity="0.18" />
        <circle cx="160" cy="100" r="0.7" fill="currentColor" opacity="0.14" />
        <circle cx="40" cy="100" r="0.7" fill="currentColor" opacity="0.14" />
        <circle cx="118" cy="158" r="0.7" fill="currentColor" opacity="0.12" />
        <circle cx="82" cy="42" r="0.7" fill="currentColor" opacity="0.12" />
        <circle cx="58" cy="56" r="0.6" fill="currentColor" opacity="0.1" />
        <circle cx="142" cy="144" r="0.6" fill="currentColor" opacity="0.1" />
        <circle cx="46" cy="72" r="0.5" fill="currentColor" opacity="0.08" />
        <circle cx="154" cy="128" r="0.5" fill="currentColor" opacity="0.08" />
        <circle cx="168" cy="92" r="0.5" fill="currentColor" opacity="0.07" />
        <circle cx="32" cy="108" r="0.5" fill="currentColor" opacity="0.07" />

        {/* Galactic core — bright center */}
        <circle cx="100" cy="100" r="5" fill="currentColor" opacity="0.45" />
        <circle cx="100" cy="100" r="2.5" fill="currentColor" opacity="0.7" />
      </g>

      {/* === Hidden motion paths === */}
      <defs>
        {/* Atom orbits */}
        <ellipse id="o1" cx="100" cy="100" rx="58" ry="20" />
        <ellipse id="o2" cx="100" cy="100" rx="58" ry="20" transform="rotate(60 100 100)" />
        <ellipse id="o3" cx="100" cy="100" rx="58" ry="20" transform="rotate(120 100 100)" />
        {/* Solar orbits */}
        <circle id="sorbit1" cx="100" cy="100" r="24" />
        <circle id="sorbit2" cx="100" cy="100" r="40" />
        <circle id="sorbit3" cx="100" cy="100" r="56" />
        <circle id="sorbit4" cx="100" cy="100" r="72" />
        <circle id="sorbit5" cx="100" cy="100" r="86" />
      </defs>
    </svg>
  );
}
