export interface MCQ {
  kind: "MCQ_SINGLE" | "MCQ_MULTI";
  stem: string;
  choices: { id: string; label: string; correct: boolean; explanation?: string }[];
  points: number;
  explanation?: string;
  skillSlug?: string;
}

export const sqlAssessmentQuestions: MCQ[] = [
  {
    kind: "MCQ_SINGLE",
    stem: "Which clause projects the columns in a SELECT query?",
    choices: [
      { id: "a", label: "FROM", correct: false },
      { id: "b", label: "SELECT", correct: true, explanation: "SELECT names the columns (or expressions) in the result." },
      { id: "c", label: "WHERE", correct: false },
      { id: "d", label: "GROUP BY", correct: false },
    ],
    points: 1,
    skillSlug: "sql-basics",
  },
  {
    kind: "MCQ_SINGLE",
    stem: "What does `LIMIT 5` do?",
    choices: [
      { id: "a", label: "Returns at most 5 rows from the result.", correct: true },
      { id: "b", label: "Returns exactly 5 rows, padding with NULL if fewer.", correct: false, explanation: "There is no padding — LIMIT caps the rows returned." },
      { id: "c", label: "Filters rows where a column > 5.", correct: false },
      { id: "d", label: "Averages across the first 5 rows.", correct: false },
    ],
    points: 1,
    skillSlug: "sql-basics",
  },
  {
    kind: "MCQ_SINGLE",
    stem: "Why is `SELECT *` discouraged in production code?",
    choices: [
      { id: "a", label: "It's slower by definition.", correct: false, explanation: "Not always slower — the real issues are fragility and waste." },
      { id: "b", label: "It can break when upstream columns change, and is unclear about what the code uses.", correct: true },
      { id: "c", label: "It always fails on tables with more than 10 columns.", correct: false },
      { id: "d", label: "It's not valid SQL outside of SQLite.", correct: false },
    ],
    points: 1,
    skillSlug: "sql-basics",
  },
  {
    kind: "MCQ_SINGLE",
    stem: "Which expression returns the first non-NULL value?",
    choices: [
      { id: "a", label: "`IFNULL(x)`", correct: false, explanation: "IFNULL is a two-argument MySQL function; not all engines support it." },
      { id: "b", label: "`ISNULL(x, y)`", correct: false, explanation: "Syntax varies by engine." },
      { id: "c", label: "`COALESCE(x, y, z, ...)`", correct: true, explanation: "COALESCE is the SQL-standard pick." },
      { id: "d", label: "`NVL(x)`", correct: false },
    ],
    points: 1,
    skillSlug: "sql-basics",
  },
  {
    kind: "MCQ_SINGLE",
    stem: "Which of these is the correct way to test for a missing value?",
    choices: [
      { id: "a", label: "`WHERE email = NULL`", correct: false, explanation: "Comparison with NULL is never true." },
      { id: "b", label: "`WHERE email IS NULL`", correct: true },
      { id: "c", label: "`WHERE email = ''`", correct: false, explanation: "Empty string is not the same as NULL." },
      { id: "d", label: "`WHERE ISNULL(email)`", correct: false, explanation: "Not portable; IS NULL is the standard form." },
    ],
    points: 1,
    skillSlug: "sql-filtering",
  },
  {
    kind: "MCQ_SINGLE",
    stem: "`WHERE plan = 'pro' OR plan = 'starter' AND city = 'London'` — due to precedence, this reads as:",
    choices: [
      { id: "a", label: "Pro customers anywhere, OR starter customers in London.", correct: true, explanation: "AND binds tighter than OR; parenthesise to be safe." },
      { id: "b", label: "Pro customers in London OR starter customers in London.", correct: false },
      { id: "c", label: "Customers in London with any plan.", correct: false },
      { id: "d", label: "A SQL syntax error.", correct: false },
    ],
    points: 2,
    skillSlug: "sql-filtering",
  },
  {
    kind: "MCQ_MULTI",
    stem: "Which of the following correctly find customers whose plan is NOT 'pro', including those with no plan set? (Select all that apply.)",
    choices: [
      { id: "a", label: "`WHERE plan <> 'pro'`", correct: false, explanation: "Excludes NULL plans silently." },
      { id: "b", label: "`WHERE plan <> 'pro' OR plan IS NULL`", correct: true, explanation: "Explicitly includes NULL plans." },
      { id: "c", label: "`WHERE COALESCE(plan, '') <> 'pro'`", correct: true, explanation: "Replaces NULL with '' before comparing — now NULLs pass." },
      { id: "d", label: "`WHERE NOT (plan = 'pro')`", correct: false, explanation: "Still excludes NULL (NOT of NULL is NULL, which isn't true)." },
    ],
    points: 2,
    skillSlug: "sql-filtering",
  },
  {
    kind: "MCQ_SINGLE",
    stem: "Which operator checks if a column value is in a set of possibilities?",
    choices: [
      { id: "a", label: "`ANY`", correct: false },
      { id: "b", label: "`BETWEEN`", correct: false, explanation: "BETWEEN is an inclusive range, not a set." },
      { id: "c", label: "`IN`", correct: true },
      { id: "d", label: "`MATCH`", correct: false },
    ],
    points: 1,
    skillSlug: "sql-filtering",
  },
  {
    kind: "MCQ_SINGLE",
    stem: "An INNER JOIN returns:",
    choices: [
      { id: "a", label: "All rows from both tables, with NULLs where no match.", correct: false, explanation: "That's a FULL OUTER JOIN." },
      { id: "b", label: "Only rows with matches in both tables.", correct: true },
      { id: "c", label: "Every row on the left, with NULLs on the right for misses.", correct: false, explanation: "That's LEFT JOIN." },
      { id: "d", label: "The Cartesian product of the tables.", correct: false, explanation: "That's a CROSS JOIN." },
    ],
    points: 1,
    skillSlug: "sql-joins",
  },
  {
    kind: "MCQ_SINGLE",
    stem: "You need every customer listed, with a revenue of 0 if they've never ordered. The right pattern is:",
    choices: [
      { id: "a", label: "INNER JOIN orders, SUM revenue, GROUP BY customer.", correct: false, explanation: "Customers with no orders disappear." },
      { id: "b", label: "LEFT JOIN orders, COALESCE(SUM(revenue), 0), GROUP BY customer.", correct: true },
      { id: "c", label: "CROSS JOIN orders, SUM revenue.", correct: false },
      { id: "d", label: "RIGHT JOIN orders, SUM revenue.", correct: false, explanation: "Would drop customers with no orders." },
    ],
    points: 2,
    skillSlug: "sql-joins",
  },
  {
    kind: "MCQ_SINGLE",
    stem: "A customer has two orders. You `JOIN` orders and `SUM(customer.lifetime_value)`. What's wrong?",
    choices: [
      { id: "a", label: "Nothing — the sum will be correct.", correct: false, explanation: "Each of the two joined rows carries the LTV, so it's double-counted." },
      { id: "b", label: "lifetime_value will be double-counted because the join fanned out.", correct: true },
      { id: "c", label: "You need a WHERE clause.", correct: false },
      { id: "d", label: "The engine will throw an aggregation error.", correct: false },
    ],
    points: 2,
    skillSlug: "sql-joins",
  },
  {
    kind: "MCQ_SINGLE",
    stem: "Which join would let you list every product alongside its category, even if a product has no category assigned yet?",
    choices: [
      { id: "a", label: "INNER JOIN categories", correct: false },
      { id: "b", label: "LEFT JOIN categories", correct: true, explanation: "Products with NULL category are kept, categories side is NULL." },
      { id: "c", label: "CROSS JOIN categories", correct: false },
      { id: "d", label: "FULL OUTER JOIN categories", correct: false, explanation: "Would also include orphan categories — probably not wanted." },
    ],
    points: 1,
    skillSlug: "sql-joins",
  },
  {
    kind: "MCQ_SINGLE",
    stem: "Where must every non-aggregated column in a `SELECT` with aggregates also appear?",
    choices: [
      { id: "a", label: "`WHERE`", correct: false },
      { id: "b", label: "`HAVING`", correct: false },
      { id: "c", label: "`GROUP BY`", correct: true, explanation: "Otherwise the engine doesn't know which value of that column to return per group." },
      { id: "d", label: "`ORDER BY`", correct: false },
    ],
    points: 1,
    skillSlug: "sql-aggregation",
  },
  {
    kind: "MCQ_SINGLE",
    stem: "What's the difference between `WHERE` and `HAVING`?",
    choices: [
      { id: "a", label: "They're interchangeable.", correct: false },
      { id: "b", label: "WHERE filters rows before grouping; HAVING filters groups after aggregation.", correct: true },
      { id: "c", label: "WHERE works only on indexed columns; HAVING works on any.", correct: false },
      { id: "d", label: "HAVING is used only with JOINs.", correct: false },
    ],
    points: 2,
    skillSlug: "sql-aggregation",
  },
  {
    kind: "MCQ_SINGLE",
    stem: "`COUNT(*)` vs `COUNT(email)` on a customers table where some emails are NULL:",
    choices: [
      { id: "a", label: "Both return the same number.", correct: false, explanation: "Only true if every email is non-NULL." },
      { id: "b", label: "COUNT(*) counts rows; COUNT(email) counts non-NULL emails.", correct: true },
      { id: "c", label: "COUNT(*) is invalid SQL.", correct: false },
      { id: "d", label: "COUNT(email) counts distinct emails.", correct: false, explanation: "That's COUNT(DISTINCT email)." },
    ],
    points: 2,
    skillSlug: "sql-aggregation",
  },
  {
    kind: "MCQ_MULTI",
    stem: "Which queries below will return the number of customers per plan? (Select all that are correct.)",
    choices: [
      { id: "a", label: "`SELECT plan, COUNT(*) FROM customers GROUP BY plan;`", correct: true },
      { id: "b", label: "`SELECT plan, COUNT(*) FROM customers;`", correct: false, explanation: "Missing GROUP BY — engines reject or return a single row." },
      { id: "c", label: "`SELECT plan, COUNT(id) AS n FROM customers GROUP BY plan ORDER BY n DESC;`", correct: true },
      { id: "d", label: "`SELECT DISTINCT plan, COUNT(*) FROM customers;`", correct: false, explanation: "DISTINCT doesn't create groups; this is still missing GROUP BY." },
    ],
    points: 2,
    skillSlug: "sql-aggregation",
  },
  {
    kind: "MCQ_SINGLE",
    stem: "You suspect a revenue metric is 2x too high after adding a join. The first thing to check is:",
    choices: [
      { id: "a", label: "Whether the time zone is correct.", correct: false },
      { id: "b", label: "Whether a join fan-out is duplicating rows before the SUM.", correct: true },
      { id: "c", label: "Whether any column has a NULL.", correct: false, explanation: "NULL usually shrinks totals, not doubles them." },
      { id: "d", label: "Whether HAVING is placed before WHERE.", correct: false },
    ],
    points: 2,
    skillSlug: "sql-problem-solving",
  },
  {
    kind: "MCQ_SINGLE",
    stem: "You want *monthly revenue per plan, for plans whose monthly revenue exceeds $10,000*. Which clause expresses the `> $10,000` condition?",
    choices: [
      { id: "a", label: "`WHERE SUM(revenue) > 1000000`", correct: false, explanation: "Can't reference aggregates in WHERE." },
      { id: "b", label: "`HAVING SUM(revenue) > 1000000`", correct: true, explanation: "HAVING filters aggregated groups." },
      { id: "c", label: "`FILTER SUM(revenue) > 1000000`", correct: false },
      { id: "d", label: "Put it in a subquery's ORDER BY.", correct: false },
    ],
    points: 2,
    skillSlug: "sql-problem-solving",
  },
  {
    kind: "MCQ_SINGLE",
    stem: "A stakeholder asks: *\"how many users signed up and converted to paid last month?\"* Before writing SQL, the first thing to clarify is:",
    choices: [
      { id: "a", label: "Which database engine we're using.", correct: false },
      { id: "b", label: "The grain — one row per what in the answer?", correct: true, explanation: "Grain decides the shape of the query." },
      { id: "c", label: "Whether indexes exist on the relevant columns.", correct: false, explanation: "A performance concern — comes later." },
      { id: "d", label: "Which reporting tool will consume the result.", correct: false },
    ],
    points: 1,
    skillSlug: "sql-problem-solving",
  },
  {
    kind: "MCQ_SINGLE",
    stem: "CTEs (`WITH name AS (...)`) are most useful for:",
    choices: [
      { id: "a", label: "Making queries run faster by default.", correct: false, explanation: "Performance varies by engine — CTEs are about readability and reuse." },
      { id: "b", label: "Naming intermediate results so you can build on them step-by-step.", correct: true },
      { id: "c", label: "Replacing the need for WHERE clauses.", correct: false },
      { id: "d", label: "Declaring variables inside a query.", correct: false, explanation: "CTEs are table-valued, not scalar." },
    ],
    points: 1,
    skillSlug: "sql-problem-solving",
  },
];
