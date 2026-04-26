import cuid from "cuid";
import type { PrismaClient } from "@prisma/client";

export interface SeededPythonSkills {
  pythonBasics: string;
  pythonTypes: string;
  pythonControlFlow: string;
  pythonFunctions: string;
  pythonCollections: string;
  pythonProblemSolving: string;
}

export async function seedPythonSkills(db: PrismaClient, workspaceId: string): Promise<SeededPythonSkills> {
  const defs = [
    {
      slug: "python-basics",
      name: "Python basics",
      category: "Programming",
      description: "Reading and running Python code, variables, expressions, and the REPL.",
    },
    {
      slug: "python-types",
      name: "Python types",
      category: "Programming",
      description: "Dynamic typing, mutable vs immutable, common gotchas with shared references.",
    },
    {
      slug: "python-control-flow",
      name: "Python control flow",
      category: "Programming",
      description: "if/elif/else, for, while, break/continue, and the truthiness rules.",
    },
    {
      slug: "python-functions",
      name: "Python functions",
      category: "Programming",
      description: "Parameters, return, scope, default arguments, and the mutable-default trap.",
    },
    {
      slug: "python-collections",
      name: "Python collections",
      category: "Programming",
      description: "Lists, tuples, dicts, sets, and pythonic comprehensions.",
    },
    {
      slug: "python-problem-solving",
      name: "Python problem solving",
      category: "Programming",
      description: "Translating an everyday problem into a small, working Python script.",
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
      },
    });
    created[d.slug] = id;
  }

  const prereqs: [string, string][] = [
    ["python-types", "python-basics"],
    ["python-control-flow", "python-types"],
    ["python-functions", "python-control-flow"],
    ["python-collections", "python-types"],
    ["python-problem-solving", "python-functions"],
    ["python-problem-solving", "python-collections"],
  ];
  for (const [skill, prereq] of prereqs) {
    await db.skillPrerequisite.create({
      data: { id: cuid(), skillId: created[skill]!, prereqId: created[prereq]! },
    });
  }

  return {
    pythonBasics: created["python-basics"]!,
    pythonTypes: created["python-types"]!,
    pythonControlFlow: created["python-control-flow"]!,
    pythonFunctions: created["python-functions"]!,
    pythonCollections: created["python-collections"]!,
    pythonProblemSolving: created["python-problem-solving"]!,
  };
}
