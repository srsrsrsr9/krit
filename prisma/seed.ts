/**
 * Seed the database with:
 *  - A corporate workspace ("Krit Academy") and a retail workspace.
 *  - Three demo users (learner, admin, manager) with memberships.
 *  - The full SQL Foundations skill graph, path, 6 lessons, 20-question
 *    assessment, capstone project, and a path credential.
 *  - A role profile with required skills.
 *
 * Run: `npm run db:seed`
 */

import cuid from "cuid";
import { PrismaClient } from "@prisma/client";
import { seedSkills } from "./seed/skills";
import { lessonDefs } from "./seed/lessons";
import { sqlAssessmentQuestions } from "./seed/questions";

const db = new PrismaClient();

async function main() {
  console.log("→ Wiping existing data…");
  // Order matters because of FK constraints.
  await db.tutorMessage.deleteMany();
  await db.tutorConversation.deleteMany();
  await db.lrsEvent.deleteMany();
  await db.issuedCredential.deleteMany();
  await db.credential.deleteMany();
  await db.answer.deleteMany();
  await db.attempt.deleteMany();
  await db.question.deleteMany();
  await db.assessmentSkill.deleteMany();
  await db.assessment.deleteMany();
  await db.submission.deleteMany();
  await db.projectBrief.deleteMany();
  await db.lessonProgress.deleteMany();
  await db.enrollment.deleteMany();
  await db.assignment.deleteMany();
  await db.pathItem.deleteMany();
  await db.path.deleteMany();
  await db.lessonSkill.deleteMany();
  await db.lesson.deleteMany();
  await db.evidence.deleteMany();
  await db.skillState.deleteMany();
  await db.roleRequirement.deleteMany();
  await db.roleProfile.deleteMany();
  await db.skillPrerequisite.deleteMany();
  await db.skill.deleteMany();
  await db.membership.deleteMany();
  await db.workspace.deleteMany();
  await db.user.deleteMany();

  console.log("→ Creating workspaces…");
  const corporateId = cuid();
  await db.workspace.create({
    data: {
      id: corporateId,
      slug: "krit-academy",
      name: "Krit Academy",
      kind: "CORPORATE",
      description: "Internal L&D workspace for Krit team members.",
    },
  });

  const academyId = cuid();
  await db.workspace.create({
    data: {
      id: academyId,
      slug: "public-academy",
      name: "Krit Public Academy",
      kind: "ACADEMY",
      description: "Retail catalogue — free and paid paths open to anyone.",
    },
  });

  console.log("→ Creating users and memberships…");
  const learnerId = cuid();
  await db.user.create({
    data: {
      id: learnerId,
      email: "learner@krit.dev",
      name: "Nadia Patel",
      handle: "nadia",
      bio: "Product manager learning data skills to work more closely with analytics.",
    },
  });
  await db.membership.create({
    data: { id: cuid(), userId: learnerId, workspaceId: corporateId, role: "LEARNER" },
  });

  const adminId = cuid();
  await db.user.create({
    data: {
      id: adminId,
      email: "admin@krit.dev",
      name: "Omar Khan",
      handle: "omar",
      bio: "Head of L&D at Krit.",
    },
  });
  await db.membership.create({
    data: { id: cuid(), userId: adminId, workspaceId: corporateId, role: "ADMIN" },
  });

  const managerId = cuid();
  await db.user.create({
    data: {
      id: managerId,
      email: "manager@krit.dev",
      name: "Priya Subramanian",
      handle: "priya",
      bio: "Engineering manager. Responsible for team readiness.",
    },
  });
  await db.membership.create({
    data: { id: cuid(), userId: managerId, workspaceId: corporateId, role: "MANAGER" },
  });

  console.log("→ Seeding skill graph…");
  const skills = await seedSkills(db, corporateId);

  console.log("→ Creating Role Profile: 'Data-Aware Product Manager'…");
  const rolePmId = cuid();
  await db.roleProfile.create({
    data: {
      id: rolePmId,
      workspaceId: corporateId,
      name: "Data-Aware Product Manager",
      description: "PM who can explore product data independently and write their own SQL for day-to-day questions.",
    },
  });
  for (const [skillId, level] of [
    [skills.sqlBasics, "WORKING"],
    [skills.sqlFiltering, "WORKING"],
    [skills.sqlJoins, "WORKING"],
    [skills.sqlAggregation, "WORKING"],
    [skills.sqlProblemSolving, "PROFICIENT"],
  ] as const) {
    await db.roleRequirement.create({
      data: {
        id: cuid(),
        roleProfileId: rolePmId,
        skillId,
        requiredLevel: level,
      },
    });
  }
  await db.membership.update({
    where: { userId_workspaceId: { userId: learnerId, workspaceId: corporateId } },
    data: { roleProfileId: rolePmId, managerId },
  });

  console.log("→ Creating lessons…");
  const skillSlugToId = {
    sqlBasics: skills.sqlBasics,
    sqlFiltering: skills.sqlFiltering,
    sqlJoins: skills.sqlJoins,
    sqlAggregation: skills.sqlAggregation,
    sqlProblemSolving: skills.sqlProblemSolving,
    data: skills.data,
  };
  const lessonIds: Record<string, string> = {};
  for (const def of lessonDefs) {
    const id = cuid();
    await db.lesson.create({
      data: {
        id,
        workspaceId: corporateId,
        slug: def.slug,
        title: def.title,
        subtitle: def.subtitle,
        estimatedMinutes: def.estimatedMinutes,
        blocks: def.blocks as unknown as object,
      },
    });
    for (const s of def.skills) {
      await db.lessonSkill.create({
        data: { id: cuid(), lessonId: id, skillId: skillSlugToId[s] },
      });
    }
    lessonIds[def.slug] = id;
  }

  console.log("→ Creating assessment…");
  const assessmentId = cuid();
  await db.assessment.create({
    data: {
      id: assessmentId,
      workspaceId: corporateId,
      slug: "sql-foundations-assessment",
      title: "SQL Foundations Assessment",
      description: "20 questions spanning SELECT, filtering, joins, aggregation, and translation of business questions into SQL.",
      mode: "GRADED",
      passThreshold: 70,
      timeLimitSec: 35 * 60,
      attemptsAllowed: 3,
      shuffleQuestions: true,
    },
  });
  for (const skillId of [skills.sqlBasics, skills.sqlFiltering, skills.sqlJoins, skills.sqlAggregation, skills.sqlProblemSolving]) {
    await db.assessmentSkill.create({
      data: {
        id: cuid(),
        assessmentId,
        skillId,
        awardsAtLevel: "WORKING",
        weight: 1.0,
      },
    });
  }
  for (let i = 0; i < sqlAssessmentQuestions.length; i++) {
    const q = sqlAssessmentQuestions[i]!;
    await db.question.create({
      data: {
        id: cuid(),
        assessmentId,
        order: i + 1,
        kind: q.kind,
        stem: q.stem,
        payload: { choices: q.choices } as unknown as object,
        points: q.points,
        explanation: q.explanation,
        skillSlug: q.skillSlug,
      },
    });
  }

  console.log("→ Creating capstone project…");
  const projectId = cuid();
  await db.projectBrief.create({
    data: {
      id: projectId,
      workspaceId: corporateId,
      slug: "sql-foundations-capstone",
      title: "Capstone: Five real questions, five queries",
      prompt: CAPSTONE_PROMPT,
      rubric: [
        {
          criterion: "Correctness",
          levels: [
            { label: "All five queries return the right shape and numbers.", points: 4 },
            { label: "4/5 queries correct; one small bug.", points: 3 },
            { label: "3/5 queries correct.", points: 2 },
            { label: "Less than 3 queries correct.", points: 0 },
          ],
        },
        {
          criterion: "Clarity",
          levels: [
            { label: "CTEs, aliases, formatting make the intent obvious.", points: 3 },
            { label: "Readable with minor rough edges.", points: 2 },
            { label: "Hard to follow without deep reading.", points: 0 },
          ],
        },
        {
          criterion: "Handling of edge cases",
          levels: [
            { label: "NULLs, fan-outs, and grain are addressed deliberately.", points: 3 },
            { label: "Most edges considered, one miss.", points: 2 },
            { label: "Edge cases not addressed.", points: 0 },
          ],
        },
      ] as unknown as object,
    },
  });

  console.log("→ Creating path and linking items…");
  const pathId = cuid();
  const totalMinutes =
    lessonDefs.reduce((s, l) => s + l.estimatedMinutes, 0) + 35 + 30;
  await db.path.create({
    data: {
      id: pathId,
      workspaceId: corporateId,
      slug: "sql-foundations",
      title: "SQL Foundations",
      subtitle: "From zero to your first real queries — with a tutor at your side.",
      summary:
        "A skill-first path that takes you from 'what even is a SELECT' to translating real business questions into correct SQL. Six short lessons, a calibrated assessment, a capstone project reviewed against a rubric, and a portable credential.",
      kind: "PATH",
      status: "PUBLISHED",
      estimatedMinutes: totalMinutes,
      level: "NOVICE",
      publishedAt: new Date(),
    },
  });

  let order = 1;
  for (const def of lessonDefs) {
    await db.pathItem.create({
      data: {
        id: cuid(),
        pathId,
        order: order++,
        kind: "LESSON",
        lessonId: lessonIds[def.slug]!,
        title: def.title,
      },
    });
  }
  await db.pathItem.create({
    data: {
      id: cuid(),
      pathId,
      order: order++,
      kind: "ASSESSMENT",
      assessmentId,
      title: "SQL Foundations Assessment",
    },
  });
  await db.pathItem.create({
    data: {
      id: cuid(),
      pathId,
      order: order++,
      kind: "PROJECT",
      projectId,
      title: "Capstone: Five real questions, five queries",
    },
  });

  console.log("→ Creating credential…");
  await db.credential.create({
    data: {
      id: cuid(),
      workspaceId: corporateId,
      pathId,
      slug: "sql-foundations",
      title: "SQL Foundations",
      description:
        "Demonstrates working-level competence in SELECT, filtering, joins, aggregation, and translating business questions into SQL.",
      issuerName: "Krit Academy",
    },
  });

  console.log("→ Assigning path to learner (as compliance-style assignment)…");
  await db.assignment.create({
    data: {
      id: cuid(),
      workspaceId: corporateId,
      pathId,
      assignedById: adminId,
      assignedToId: learnerId,
      dueAt: new Date(Date.now() + 14 * 86_400_000),
      status: "ACTIVE",
      compliance: false,
      reason: "Data-Aware PM onboarding",
    },
  });

  console.log("✓ Seed complete.");
  console.log(`
  ┌─────────────────────────────────────────────────────────────┐
  │  Sign in as one of:                                         │
  │    • Nadia Patel (learner)   — learner@krit.dev           │
  │    • Omar Khan   (admin)     — admin@krit.dev             │
  │    • Priya Subramanian (mgr) — manager@krit.dev           │
  │                                                             │
  │  The seeded path is /learn/sql-foundations                  │
  └─────────────────────────────────────────────────────────────┘
  `);
}

const CAPSTONE_PROMPT = `You're the newest data-aware PM on the team. Your first day, a stakeholder drops five questions on you and says *"can you get me these by end of week?"*

Schema (Postgres):

\`\`\`sql
customers(
  id PRIMARY KEY,
  name TEXT,
  email TEXT,
  city TEXT,
  country TEXT,
  plan TEXT,              -- 'free' | 'starter' | 'pro'
  signed_up_at TIMESTAMP
);

orders(
  id PRIMARY KEY,
  customer_id REFERENCES customers(id),
  total_cents INT,
  created_at TIMESTAMP,
  status TEXT             -- 'paid' | 'refunded' | 'pending'
);

sessions(
  id PRIMARY KEY,
  customer_id REFERENCES customers(id),
  started_at TIMESTAMP,
  device TEXT
);
\`\`\`

### Your task

Write one SQL query for each of the five questions below. For each query, include:

1. A one-line comment explaining the **grain** of your result.
2. A one-line comment explaining any **edge-case** decision you made (NULL handling, refunds, time zones, etc.).

### The five questions

1. **Growth**: How many new customers signed up each month in the last 12 months, broken down by plan?

2. **Top cities**: What are the top 10 cities by paid revenue (i.e. only orders with status = 'paid') in the last 90 days? Return city, revenue in dollars, and number of distinct paying customers.

3. **Silent accounts**: Which paying customers ('starter' or 'pro') haven't had a session in the last 30 days? Return customer name, plan, days since last session.

4. **Retention**: Of customers who signed up in January 2025, how many placed at least one paid order within 30 days of signup? Give the raw count and the percentage.

5. **Revenue quality**: Total revenue, refund amount (sum of refunded orders), and net revenue, per month for the last 6 months.

### How you'll be reviewed

You'll be scored against three criteria — **correctness**, **clarity**, and **handling of edge cases**. Don't be afraid to use CTEs (\`WITH\`) to layer your thinking.`;

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
