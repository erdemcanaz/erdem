import { FrontierIcon } from "./frontier-icon";
import { QuestIcon } from "./quest-icon";

export { FrontierIcon, QuestIcon };

export function SynthesisIcon({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className}>
      <circle cx="14" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="34" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="24" cy="10" r="3" stroke="currentColor" strokeWidth="1.5" />
      <line x1="14" y1="15" x2="24" y2="28" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      <line x1="34" y1="15" x2="24" y2="28" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      <line x1="24" y1="13" x2="24" y2="28" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      <path d="M24 28 L28 34 L24 40 L20 34 Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="24" cy="34" r="1.5" fill="currentColor" />
    </svg>
  );
}

export function getCategoryIcon(icon: string, className?: string) {
  switch (icon) {
    case "frontier":
      return <FrontierIcon className={className} />;
    case "quest":
      return <QuestIcon className={className} />;
    case "synthesis":
      return <SynthesisIcon className={className} />;
    default:
      return <FrontierIcon className={className} />;
  }
}
