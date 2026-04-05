export const CATEGORIES = {
  "the-frontier": {
    slug: "the-frontier",
    title: "The Frontier",
    tagline:
      "To be human is to look at a boundary and wonder what lies past it. The Frontier represents our refusal to ever stop exploring. We thought we had reached the limits of what was possible, but this innovation just pushed the frontier a million miles forward, giving us a whole new universe to chase.",
    shortTagline: "Exploring what lies beyond the known.",
    icon: "frontier" as const,
  },
  "the-quest": {
    slug: "the-quest",
    title: "The Quest",
    tagline:
      'We send rockets to the stars to explore the outside world, but we each face an equally massive adventure inside our own minds. The Quest is the quiet, everyday bravery required to wake up and ask, "What is good? What is right? And what is my part in all of this?"',
    shortTagline: "The search for meaning within.",
    icon: "quest" as const,
  },
  "the-synthesis": {
    slug: "the-synthesis",
    title: "The Synthesis",
    tagline:
      "A thought is only as powerful as it is clear. The Synthesis is where the fog is burned away. By writing, breaking down, and rewriting my ideas, this is the space where complex concepts are simplified and distilled into their most solid, undeniable form.",
    shortTagline: "Distilling ideas to their clearest form.",
    icon: "synthesis" as const,
  },
} as const;

export type CategorySlug = keyof typeof CATEGORIES;

export const CATEGORY_SLUGS = Object.keys(CATEGORIES) as CategorySlug[];

export const AGENT_COLORS: Record<string, string> = {
  economic: "#F59E0B",
  social: "#8B5CF6",
  technical: "#06B6D4",
  scientific: "#10B981",
  summary: "#3B82F6",
};

export const SITE = {
  name: "Erdem",
  title: "Erdem — Ideas Evolve",
  description:
    "A personal platform where ideas are living documents. Posts evolve through versions, AI agents analyze them from multiple perspectives.",
  heroTitle: "Ideas evolve. So do I.",
  heroSubtitle: "",
} as const;
