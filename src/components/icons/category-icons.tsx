import { FrontierIcon } from "./frontier-icon";
import { QuestIcon } from "./quest-icon";
import { SynthesisIcon } from "./synthesis-icon";

export { FrontierIcon, QuestIcon, SynthesisIcon };

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
