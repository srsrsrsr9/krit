/**
 * Curated skill catalog.
 *
 * Single source of truth for which `skillHints` values are valid in a course
 * JSON. The scaffolder uses this list to populate its picker; the importer
 * validates against it AND auto-creates any catalog skills not yet in the DB.
 *
 * Adding a skill: append below. Slug must be url-safe and unique.
 * Removing a skill: archive — set `archived: true` rather than delete.
 */

export interface SkillCatalogEntry {
  slug: string;
  name: string;
  category: string;
  description?: string;
  archived?: boolean;
}

export const SKILL_CATALOG: SkillCatalogEntry[] = [
  // ── Leadership ───────────────────────────────────────────────
  { slug: "leadership-fundamentals", name: "Leadership fundamentals", category: "Leadership" },
  { slug: "decision-making",         name: "Decision-making under ambiguity", category: "Leadership" },
  { slug: "delegation",              name: "Delegation and trust", category: "Leadership" },
  { slug: "feedback-craft",          name: "Feedback craft", category: "Leadership" },
  { slug: "managing-up",             name: "Managing up", category: "Leadership" },

  // ── AI fluency ───────────────────────────────────────────────
  { slug: "ai-fluency",              name: "AI fluency", category: "AI" },
  { slug: "ai-judgement",            name: "AI judgement", category: "AI" },
  { slug: "ai-leverage",             name: "AI leverage", category: "AI" },
  { slug: "prompt-craft",            name: "Prompt craft", category: "AI" },
  { slug: "model-trust-policy",      name: "Model trust policy", category: "AI" },

  // ── Operations ───────────────────────────────────────────────
  { slug: "operating-cadence",       name: "Operating cadence", category: "Operations" },
  { slug: "reinvestment",            name: "Reinvestment policy", category: "Operations" },
  { slug: "decision-policy",         name: "Decision policy design", category: "Operations" },
  { slug: "metrics-craft",           name: "Metric design", category: "Operations" },
  { slug: "process-design",          name: "Process design", category: "Operations" },

  // ── Hiring & Org ─────────────────────────────────────────────
  { slug: "hiring-craft",            name: "Hiring craft", category: "Org design" },
  { slug: "role-design",             name: "Role design", category: "Org design" },
  { slug: "org-design",              name: "Org design", category: "Org design" },
  { slug: "span-of-control",         name: "Span of control", category: "Org design" },
  { slug: "succession-planning",     name: "Succession planning", category: "Org design" },

  // ── Talent ───────────────────────────────────────────────────
  { slug: "capability-building",     name: "Capability building", category: "Talent" },
  { slug: "mentorship",              name: "Mentorship", category: "Talent" },
  { slug: "performance-conversations", name: "Performance conversations", category: "Talent" },

  // ── Communication ────────────────────────────────────────────
  { slug: "board-communication",     name: "Board communication", category: "Communication" },
  { slug: "stakeholder-management",  name: "Stakeholder management", category: "Communication" },
  { slug: "narrative-craft",         name: "Narrative craft", category: "Communication" },

  // ── Finance & Strategy ───────────────────────────────────────
  { slug: "ai-roi",                  name: "AI ROI framing", category: "Finance" },
  { slug: "capex-vs-opex",           name: "CapEx vs OpEx framing", category: "Finance" },
  { slug: "vendor-strategy",         name: "Vendor and platform strategy", category: "Strategy" },

  // ── AI engineering (developer-facing) ────────────────────────
  { slug: "ai-engineering",          name: "AI engineering practice", category: "AI engineering" },
  { slug: "model-selection",         name: "Model selection", category: "AI engineering" },
  { slug: "rag-architecture",        name: "RAG architecture", category: "AI engineering" },
  { slug: "agent-design",            name: "Agent design and safety", category: "AI engineering" },
  { slug: "finetuning-practice",     name: "Finetuning practice (LoRA, SFT)", category: "AI engineering" },
  { slug: "embeddings-and-vectors",  name: "Embeddings and vector search", category: "AI engineering" },
  { slug: "transformer-fluency",     name: "Transformer architecture fluency", category: "AI engineering" },
];

export function getActiveSkills(): SkillCatalogEntry[] {
  return SKILL_CATALOG.filter((s) => !s.archived);
}

export function findCatalogSkill(slug: string): SkillCatalogEntry | undefined {
  return SKILL_CATALOG.find((s) => s.slug === slug && !s.archived);
}
