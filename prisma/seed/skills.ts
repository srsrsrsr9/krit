import cuid from "cuid";
import type { PrismaClient } from "@prisma/client";

export interface SeededSkills {
  sqlBasics: string;
  sqlFiltering: string;
  sqlJoins: string;
  sqlAggregation: string;
  sqlProblemSolving: string;
  data: string;
}

export async function seedSkills(db: PrismaClient, workspaceId: string): Promise<SeededSkills> {
  const defs = [
    {
      slug: "sql-basics",
      name: "SQL basics",
      category: "Data",
      description: "Reading tables, writing SELECT queries, projecting columns, sorting and limiting results.",
    },
    {
      slug: "sql-filtering",
      name: "SQL filtering",
      category: "Data",
      description: "Filtering rows with WHERE, comparison and logical operators, pattern matching, NULL handling.",
    },
    {
      slug: "sql-joins",
      name: "SQL joins",
      category: "Data",
      description: "Combining tables with INNER and OUTER joins; reasoning about join keys and cardinality.",
    },
    {
      slug: "sql-aggregation",
      name: "SQL aggregation",
      category: "Data",
      description: "GROUP BY, aggregate functions, HAVING, and the shape of grouped queries.",
    },
    {
      slug: "sql-problem-solving",
      name: "SQL problem solving",
      category: "Data",
      description: "Translating a real business question into a correct, efficient SQL query.",
      decayDays: 365,
    },
    {
      slug: "data-literacy",
      name: "Data literacy",
      category: "Data",
      description: "Reasoning about data models, nulls, edge cases, and the meaning of numbers.",
    },
  ];

  const created: Record<string, string> = {};
  for (const d of defs) {
    const id = cuid();
    await db.skill.create({
      data: {
        id,
        workspaceId,
        slug: d.slug,
        name: d.name,
        category: d.category,
        description: d.description,
        decayDays: (d as { decayDays?: number }).decayDays,
      },
    });
    created[d.slug] = id;
  }

  // Prereqs
  const prereqs: [string, string][] = [
    ["sql-filtering", "sql-basics"],
    ["sql-joins", "sql-filtering"],
    ["sql-aggregation", "sql-filtering"],
    ["sql-problem-solving", "sql-joins"],
    ["sql-problem-solving", "sql-aggregation"],
  ];
  for (const [skill, prereq] of prereqs) {
    await db.skillPrerequisite.create({
      data: {
        id: cuid(),
        skillId: created[skill]!,
        prereqId: created[prereq]!,
      },
    });
  }

  return {
    sqlBasics: created["sql-basics"]!,
    sqlFiltering: created["sql-filtering"]!,
    sqlJoins: created["sql-joins"]!,
    sqlAggregation: created["sql-aggregation"]!,
    sqlProblemSolving: created["sql-problem-solving"]!,
    data: created["data-literacy"]!,
  };
}
