import type { LessonBlocks } from "../../lib/content/blocks";

export interface LessonDef {
  slug: string;
  title: string;
  subtitle: string;
  estimatedMinutes: number;
  skills: ("sqlBasics" | "sqlFiltering" | "sqlJoins" | "sqlAggregation" | "sqlProblemSolving" | "data")[];
  blocks: LessonBlocks;
}

export const lessonDefs: LessonDef[] = [
  // ───────────────── Lesson 1 ─────────────────
  {
    slug: "what-is-sql",
    title: "What is SQL, and why it still matters",
    subtitle: "The language of structured data — and the most portable skill in analytics.",
    estimatedMinutes: 8,
    skills: ["sqlBasics", "data"],
    blocks: [
      {
        type: "markdown",
        md: "SQL — Structured Query Language — is how you ask questions of data that lives in tables. It was designed in the 1970s, standardised in 1986, and is still the common tongue of every serious database on the planet. Learn it once, use it for the rest of your career.",
      },
      {
        type: "heading",
        level: 2,
        text: "Tables, rows, and columns",
      },
      {
        type: "markdown",
        md: "A table is a grid. Columns define the **shape** (what each row has). Rows are the **records** (the actual facts). Here's a tiny `customers` table:",
      },
      {
        type: "code",
        lang: "text",
        code: `id | name        | city       | plan     | signed_up_at
---+-------------+------------+----------+-------------
 1 | Ada Lovelace| London     | pro      | 2024-11-02
 2 | Grace Hopper| New York   | free     | 2025-01-14
 3 | Alan Turing | Cambridge  | pro      | 2023-07-21
 4 | Margaret H. | Pittsburgh | starter  | 2025-03-30`,
        caption: "A handful of rows from a customers table.",
      },
      {
        type: "markdown",
        md: "Every column has a **type** (text, number, date, boolean) and some columns — like `id` — are usually **primary keys** that uniquely identify the row.",
      },
      {
        type: "callout",
        tone: "tip",
        title: "Mental model",
        md: "Think of a database as a collection of spreadsheets that can talk to each other. SQL is the language you use to ask them questions.",
      },
      {
        type: "heading",
        level: 2,
        text: "Your first query",
      },
      {
        type: "markdown",
        md: "The most useful SQL statement is `SELECT`. It asks: *give me these columns from this table*.",
      },
      {
        type: "code",
        lang: "sql",
        code: `SELECT name, city
FROM customers;`,
      },
      {
        type: "markdown",
        md: "Read it left to right: **project** these columns, **from** this table. The result is a new (temporary) table with just the columns you asked for.",
      },
      {
        type: "quiz",
        prompt: "Which of these is the closest mental model for a SQL table?",
        multi: false,
        choices: [
          { id: "a", label: "A linked list", correct: false, explain: "Tables are not traversed sequentially by pointers." },
          { id: "b", label: "A spreadsheet with typed columns and unique keys", correct: true, explain: "Columns define shape; rows hold records; keys identify them." },
          { id: "c", label: "A nested JSON document", correct: false, explain: "That's a document DB like MongoDB — different model." },
          { id: "d", label: "A spreadsheet without types", correct: false, explain: "SQL columns are strongly typed." },
        ],
      },
      {
        type: "heading",
        level: 2,
        text: "Ordering and limiting",
      },
      {
        type: "markdown",
        md: "Two clauses you'll use constantly:\n\n- `ORDER BY column [ASC|DESC]` — sort the result.\n- `LIMIT n` — only return the first `n` rows.\n\nTogether they answer questions like *who are the 10 newest customers?*",
      },
      {
        type: "code",
        lang: "sql",
        code: `SELECT name, signed_up_at
FROM customers
ORDER BY signed_up_at DESC
LIMIT 10;`,
      },
      {
        type: "tryIt",
        instruction: "Write a query that returns the name and plan of all customers, sorted by name (A → Z).",
        starter: "SELECT ...\nFROM customers\nORDER BY ...;",
        expected: `SELECT name, plan
FROM customers
ORDER BY name ASC;`,
      },
      {
        type: "keyTakeaways",
        points: [
          "Tables are rows of typed columns; rows are usually identified by a primary key.",
          "`SELECT col1, col2 FROM table` projects the columns you want.",
          "`ORDER BY` sorts; `LIMIT` caps the number of rows returned.",
          "Queries are declarative: you describe the result, not the steps.",
        ],
      },
      {
        type: "reflect",
        prompt: "In your own words, when would you prefer SQL over a spreadsheet?",
      },
    ],
  },

  // ───────────────── Lesson 2 ─────────────────
  {
    slug: "select-basics",
    title: "SELECT: projecting columns, aliases, and expressions",
    subtitle: "Go beyond `SELECT *` — shape your result like a professional.",
    estimatedMinutes: 10,
    skills: ["sqlBasics"],
    blocks: [
      {
        type: "markdown",
        md: "In the last lesson you wrote your first `SELECT`. In this one you'll learn the small set of moves that turn SELECT from toy into tool: choosing specific columns, computing new ones, and naming them.",
      },
      {
        type: "heading",
        level: 2,
        text: "Why `SELECT *` is a trap",
      },
      {
        type: "markdown",
        md: "`SELECT *` returns every column in the table. It's convenient during exploration but dangerous in production code for three reasons:\n\n1. **Fragile**: the moment someone adds a column upstream, your app might break or leak.\n2. **Wasteful**: you pay to move bytes you'll never use.\n3. **Unclear**: a reader can't tell what your code actually needs.\n\nAlways project the exact columns you want.",
      },
      {
        type: "callout",
        tone: "warn",
        title: "Rule of thumb",
        md: "Use `SELECT *` at the SQL prompt. Never in code you ship.",
      },
      {
        type: "heading",
        level: 2,
        text: "Expressions in SELECT",
      },
      {
        type: "markdown",
        md: "You can compute new columns on the fly. Given an `orders` table with `quantity` and `unit_price_cents`:",
      },
      {
        type: "code",
        lang: "sql",
        code: `SELECT
  order_id,
  quantity,
  unit_price_cents,
  quantity * unit_price_cents AS line_total_cents
FROM orders;`,
      },
      {
        type: "markdown",
        md: "The new column is computed per row. `AS` gives it a **column alias** — a name that shows up in the result and in client tools.",
      },
      {
        type: "callout",
        tone: "tip",
        title: "Style note",
        md: "Money is stored in integer cents — floats lose precision. That `line_total_cents` column stays an integer; any display formatting happens in the app layer.",
      },
      {
        type: "heading",
        level: 2,
        text: "Concatenation and simple functions",
      },
      {
        type: "markdown",
        md: "Text can be combined with `||` (or `CONCAT()` in MySQL). Most engines ship dozens of built-in functions. A few you'll want on day one:\n\n- `LOWER(x)`, `UPPER(x)` — case transforms.\n- `LENGTH(x)` — number of characters.\n- `COALESCE(x, fallback)` — use `fallback` if `x` is NULL (much more on NULL next lesson).\n- `NOW()` / `CURRENT_DATE` — current timestamp / date.",
      },
      {
        type: "code",
        lang: "sql",
        code: `SELECT
  id,
  LOWER(name)                     AS name_lower,
  COALESCE(plan, 'free')          AS plan_with_default,
  LENGTH(name)                    AS name_length
FROM customers;`,
      },
      {
        type: "quiz",
        prompt: "What will `SELECT COALESCE(NULL, 'free')` return?",
        multi: false,
        choices: [
          { id: "a", label: "NULL", correct: false, explain: "COALESCE is designed to replace NULL." },
          { id: "b", label: "An error", correct: false, explain: "COALESCE accepts NULL as an input." },
          { id: "c", label: "'free'", correct: true, explain: "COALESCE returns the first non-NULL argument." },
          { id: "d", label: "An empty string", correct: false },
        ],
      },
      {
        type: "heading",
        level: 2,
        text: "Distinct values",
      },
      {
        type: "markdown",
        md: "`SELECT DISTINCT` removes duplicate result rows. Useful when you want the *set* of something:",
      },
      {
        type: "code",
        lang: "sql",
        code: `SELECT DISTINCT plan
FROM customers;
-- returns: free, starter, pro`,
      },
      {
        type: "callout",
        tone: "warn",
        md: "`DISTINCT` can be expensive on large tables. If you find yourself reaching for it constantly, your data model might want normalisation.",
      },
      {
        type: "tryIt",
        instruction: "Using the `customers` table, return id, name, and a column `display_label` that looks like `\"Ada Lovelace (London)\"`.",
        starter: `SELECT
  id,
  name,
  ... AS display_label
FROM customers;`,
        expected: `SELECT
  id,
  name,
  name || ' (' || city || ')' AS display_label
FROM customers;`,
      },
      {
        type: "keyTakeaways",
        points: [
          "Always project the exact columns you need — never ship `SELECT *`.",
          "`AS alias` names a column (or expression) in the result.",
          "SQL has rich built-in functions; `COALESCE` is your NULL-replacement friend.",
          "`DISTINCT` removes duplicate rows — cheap to write, sometimes expensive to run.",
        ],
      },
    ],
  },

  // ───────────────── Lesson 3 ─────────────────
  {
    slug: "filtering-where",
    title: "Filtering with WHERE — the shape of a predicate",
    subtitle: "Precise filtering is the difference between data and insight.",
    estimatedMinutes: 12,
    skills: ["sqlFiltering"],
    blocks: [
      {
        type: "markdown",
        md: "`WHERE` is the clause that decides which rows survive. Everything downstream — joins, aggregates, UI widgets — depends on getting filters right. Small errors here cause big, silent bugs.",
      },
      {
        type: "code",
        lang: "sql",
        code: `SELECT name, plan
FROM customers
WHERE plan = 'pro';`,
      },
      {
        type: "heading",
        level: 2,
        text: "Comparison operators",
      },
      {
        type: "markdown",
        md: "The essentials:\n\n| Operator | Meaning |\n|---|---|\n| `=` | equals |\n| `<>` or `!=` | not equals |\n| `<`, `<=`, `>`, `>=` | numeric / date comparisons |\n| `BETWEEN a AND b` | inclusive range |\n| `IN (a, b, c)` | matches any value in the list |\n| `LIKE 'A%'` | pattern match — `%` is wildcard |\n| `IS NULL` / `IS NOT NULL` | missing value checks |",
      },
      {
        type: "code",
        lang: "sql",
        code: `-- Customers who signed up in 2025 and are on a paid plan
SELECT name, plan, signed_up_at
FROM customers
WHERE signed_up_at BETWEEN '2025-01-01' AND '2025-12-31'
  AND plan IN ('starter', 'pro');`,
      },
      {
        type: "heading",
        level: 2,
        text: "AND, OR, NOT — and the precedence trap",
      },
      {
        type: "markdown",
        md: "Logical operators combine conditions. Be careful of precedence: `AND` binds tighter than `OR`. This bites beginners **hard**.",
      },
      {
        type: "callout",
        tone: "warn",
        title: "Dangerous query",
        md: "`WHERE plan = 'pro' OR plan = 'starter' AND city = 'London'`\n\nDue to precedence, this reads as: *all pro customers anywhere* OR *starter customers in London*. Almost certainly not what you meant. Use parentheses.",
      },
      {
        type: "code",
        lang: "sql",
        code: `-- Clear and correct
SELECT name
FROM customers
WHERE (plan = 'pro' OR plan = 'starter')
  AND city = 'London';`,
      },
      {
        type: "heading",
        level: 2,
        text: "NULL is not a value — it's the absence of one",
      },
      {
        type: "markdown",
        md: "This is SQL's most infamous foot-gun. In three-valued logic, NULL means *unknown*. So:\n\n- `NULL = NULL` → **not true** (it's NULL).\n- `x <> 'pro'` **excludes** rows where `x IS NULL`.\n- `x IS NULL` is the only way to check for NULL.",
      },
      {
        type: "code",
        lang: "sql",
        code: `-- Wrong — misses NULL plans
SELECT * FROM customers WHERE plan <> 'pro';

-- Right — explicit about NULLs
SELECT * FROM customers WHERE plan <> 'pro' OR plan IS NULL;`,
      },
      {
        type: "quiz",
        prompt: "What does `WHERE email = NULL` return?",
        multi: false,
        choices: [
          { id: "a", label: "Rows where email is missing", correct: false, explain: "You can't compare to NULL with `=`." },
          { id: "b", label: "No rows, because `= NULL` is never true", correct: true, explain: "Comparisons with NULL yield NULL, which is not true." },
          { id: "c", label: "All rows where email has any value", correct: false },
          { id: "d", label: "An error", correct: false, explain: "Most engines return zero rows without an error — a silent bug." },
        ],
      },
      {
        type: "heading",
        level: 2,
        text: "Pattern matching with LIKE",
      },
      {
        type: "markdown",
        md: "`LIKE` uses two wildcards:\n\n- `%` — zero or more characters.\n- `_` — exactly one character.\n\nCase sensitivity depends on the engine; in Postgres use `ILIKE` for case-insensitive.",
      },
      {
        type: "code",
        lang: "sql",
        code: `SELECT name
FROM customers
WHERE name ILIKE 'a%';       -- starts with A or a`,
      },
      {
        type: "tryIt",
        instruction: "Write a filter that returns customers on the 'pro' plan who signed up after 2024-01-01, OR any customer in New York.",
        expected: `SELECT *
FROM customers
WHERE (plan = 'pro' AND signed_up_at > '2024-01-01')
   OR city = 'New York';`,
      },
      {
        type: "keyTakeaways",
        points: [
          "Every row returned is a row that made the `WHERE` predicate true.",
          "`AND` binds tighter than `OR` — use parentheses to be explicit.",
          "NULL is not a value. Use `IS NULL` / `IS NOT NULL`.",
          "`BETWEEN`, `IN`, and `LIKE` cover most day-to-day filtering needs.",
        ],
      },
    ],
  },

  // ───────────────── Lesson 4 ─────────────────
  {
    slug: "joins",
    title: "JOINs: combining tables without the panic",
    subtitle: "Why INNER, LEFT, and friends are just different rules for the same question.",
    estimatedMinutes: 15,
    skills: ["sqlJoins"],
    blocks: [
      {
        type: "markdown",
        md: "Real databases don't live in one table. **Joins** are how you connect them. The mental model is simple once it clicks; until then it feels like magic. Let's demystify it.",
      },
      {
        type: "heading",
        level: 2,
        text: "The setup",
      },
      {
        type: "markdown",
        md: "Two related tables:",
      },
      {
        type: "code",
        lang: "text",
        code: `customers                         orders
id | name                        id | customer_id | total_cents
---+-------                      ---+-------------+-----------
 1 | Ada                          101|     1        |  2500
 2 | Grace                        102|     1        |  1800
 3 | Alan                         103|     3        |   900
 4 | Margaret                     104|     5        |  4200  ← orphan!`,
      },
      {
        type: "markdown",
        md: "`orders.customer_id` is a **foreign key** into `customers.id`. Notice order 104 points to a customer that isn't in our list (5). That orphan will drive the differences between join types.",
      },
      {
        type: "heading",
        level: 2,
        text: "INNER JOIN — the intersection",
      },
      {
        type: "markdown",
        md: "Returns only rows that match on both sides.",
      },
      {
        type: "code",
        lang: "sql",
        code: `SELECT c.name, o.total_cents
FROM customers c
INNER JOIN orders o ON o.customer_id = c.id;`,
      },
      {
        type: "code",
        lang: "text",
        code: `name    | total_cents
--------+-----------
Ada     | 2500
Ada     | 1800
Alan    |  900
-- Grace and Margaret have no orders → excluded
-- Order 104 has no matching customer → excluded`,
      },
      {
        type: "heading",
        level: 2,
        text: "LEFT JOIN — keep every row from the left",
      },
      {
        type: "markdown",
        md: "Returns every row from the **left** table; unmatched rows on the right become NULL.",
      },
      {
        type: "code",
        lang: "sql",
        code: `SELECT c.name, o.total_cents
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id;`,
      },
      {
        type: "code",
        lang: "text",
        code: `name     | total_cents
---------+-----------
Ada      | 2500
Ada      | 1800
Grace    | NULL       ← no orders
Alan     |  900
Margaret | NULL       ← no orders`,
      },
      {
        type: "callout",
        tone: "tip",
        title: "When to pick which",
        md: "**LEFT JOIN** when you need every entity from one side regardless of matches (e.g. *every customer with their order totals, including zeros*). **INNER JOIN** when absence is a reason to exclude the row.",
      },
      {
        type: "heading",
        level: 2,
        text: "The fan-out trap",
      },
      {
        type: "markdown",
        md: "A join can **multiply rows** when the right side has many matches. Ada has two orders, so she appears **twice** in the result. If you then `SUM()` some customer field, you'll double-count. This is the single most common joins bug.",
      },
      {
        type: "callout",
        tone: "warn",
        title: "Heuristic",
        md: "Before you aggregate across a join, ask: *how many rows from the right side match each row on the left?* If it's many, aggregate **before** the join (in a subquery or CTE) or use `DISTINCT`.",
      },
      {
        type: "heading",
        level: 2,
        text: "Other joins you'll meet eventually",
      },
      {
        type: "markdown",
        md: "- **RIGHT JOIN** — mirror of LEFT; rarely needed (you can always flip the tables).\n- **FULL OUTER JOIN** — every row from both sides, NULLs where no match. Useful for reconciling two sources.\n- **CROSS JOIN** — Cartesian product (every row × every row). Useful with `generate_series` for filling date gaps; dangerous by accident.",
      },
      {
        type: "quiz",
        prompt: "You want **every** customer listed exactly once, alongside their total revenue (0 if none). Which is safest?",
        multi: false,
        choices: [
          { id: "a", label: "INNER JOIN orders then SUM(total_cents)", correct: false, explain: "Customers with no orders disappear." },
          { id: "b", label: "LEFT JOIN orders then SUM(total_cents), GROUP BY customer", correct: true, explain: "Keeps every customer; NULL sums to 0 with COALESCE." },
          { id: "c", label: "CROSS JOIN orders", correct: false, explain: "That multiplies every customer by every order — wrong shape." },
          { id: "d", label: "FULL OUTER JOIN orders", correct: false, explain: "Includes orphan orders you don't want." },
        ],
      },
      {
        type: "tryIt",
        instruction: "Write the query for the quiz above — every customer with COALESCE(SUM(total_cents), 0) as revenue.",
        expected: `SELECT c.id, c.name, COALESCE(SUM(o.total_cents), 0) AS revenue_cents
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
GROUP BY c.id, c.name
ORDER BY revenue_cents DESC;`,
      },
      {
        type: "keyTakeaways",
        points: [
          "INNER JOIN = rows that match on both sides.",
          "LEFT JOIN = every row from the left; NULLs where the right has no match.",
          "Joins can multiply rows — watch for the fan-out when aggregating.",
          "Always alias tables (`c`, `o`) and qualify columns (`c.id`) in multi-table queries.",
        ],
      },
    ],
  },

  // ───────────────── Lesson 5 ─────────────────
  {
    slug: "group-by-aggregation",
    title: "GROUP BY and aggregation: asking 'how many', 'how much', 'which top'",
    subtitle: "From rows to insights.",
    estimatedMinutes: 12,
    skills: ["sqlAggregation"],
    blocks: [
      {
        type: "markdown",
        md: "Aggregation is where SQL turns data into answers. Five aggregate functions and one new clause unlock most analytic questions you'll ever write.",
      },
      {
        type: "heading",
        level: 2,
        text: "The five essentials",
      },
      {
        type: "markdown",
        md: "- `COUNT(*)` — number of rows.\n- `COUNT(col)` — number of non-NULL values of `col`.\n- `SUM(col)` — total of a numeric column.\n- `AVG(col)` — average (ignoring NULLs).\n- `MIN(col)`, `MAX(col)` — extremes.\n\nWithout `GROUP BY`, they collapse the whole table to one row:",
      },
      {
        type: "code",
        lang: "sql",
        code: `SELECT
  COUNT(*)            AS total_customers,
  COUNT(plan)         AS customers_with_a_plan,
  MIN(signed_up_at)   AS earliest,
  MAX(signed_up_at)   AS latest
FROM customers;`,
      },
      {
        type: "heading",
        level: 2,
        text: "GROUP BY — one row per group",
      },
      {
        type: "markdown",
        md: "`GROUP BY` tells SQL: *compute these aggregates, but once per distinct value of this column*.",
      },
      {
        type: "code",
        lang: "sql",
        code: `SELECT
  plan,
  COUNT(*) AS customer_count
FROM customers
GROUP BY plan
ORDER BY customer_count DESC;`,
      },
      {
        type: "callout",
        tone: "tip",
        title: "The single rule that catches 80% of errors",
        md: "**Every non-aggregated column in your SELECT must be in your GROUP BY.** If you want `city` in the output and you're grouping, `city` must be in `GROUP BY`.",
      },
      {
        type: "heading",
        level: 2,
        text: "WHERE vs HAVING",
      },
      {
        type: "markdown",
        md: "- `WHERE` filters rows **before** grouping.\n- `HAVING` filters groups **after** aggregation.\n\nYou can't reference an aggregate in `WHERE`; you must use `HAVING`.",
      },
      {
        type: "code",
        lang: "sql",
        code: `-- Plans with more than 10 customers who signed up in 2025
SELECT plan, COUNT(*) AS n
FROM customers
WHERE signed_up_at >= '2025-01-01'     -- before grouping
GROUP BY plan
HAVING COUNT(*) > 10;                  -- after grouping`,
      },
      {
        type: "quiz",
        prompt: "Which clause would you use to filter for groups whose COUNT(*) is greater than 5?",
        multi: false,
        choices: [
          { id: "a", label: "WHERE", correct: false, explain: "WHERE runs before grouping, so COUNT(*) isn't yet defined." },
          { id: "b", label: "HAVING", correct: true, explain: "HAVING filters groups after aggregation." },
          { id: "c", label: "SELECT", correct: false },
          { id: "d", label: "ORDER BY", correct: false, explain: "ORDER BY sorts; it doesn't filter." },
        ],
      },
      {
        type: "heading",
        level: 2,
        text: "Combining joins and aggregation",
      },
      {
        type: "markdown",
        md: "The 80% query in analytics looks like: *for each X, how much / how many Y?*",
      },
      {
        type: "code",
        lang: "sql",
        code: `-- Monthly revenue by plan, last 6 months
SELECT
  c.plan,
  DATE_TRUNC('month', o.created_at) AS month,
  SUM(o.total_cents) / 100          AS revenue_dollars,
  COUNT(DISTINCT o.customer_id)     AS paying_customers
FROM orders o
JOIN customers c ON c.id = o.customer_id
WHERE o.created_at >= NOW() - INTERVAL '6 months'
GROUP BY c.plan, DATE_TRUNC('month', o.created_at)
ORDER BY month DESC, revenue_dollars DESC;`,
      },
      {
        type: "callout",
        tone: "tip",
        title: "COUNT(DISTINCT x) is your friend",
        md: "When joins fan out, aggregating distinct IDs is the cleanest way to say \"unique customers, please\".",
      },
      {
        type: "tryIt",
        instruction: "Write a query that returns each city and the number of customers from that city, only showing cities with at least 2 customers, sorted most first.",
        expected: `SELECT city, COUNT(*) AS n
FROM customers
GROUP BY city
HAVING COUNT(*) >= 2
ORDER BY n DESC;`,
      },
      {
        type: "keyTakeaways",
        points: [
          "Aggregates collapse many rows into one — `GROUP BY` says 'one per distinct value'.",
          "Every non-aggregate column in SELECT must also be in GROUP BY.",
          "WHERE filters rows before grouping; HAVING filters groups after.",
          "`COUNT(DISTINCT x)` saves you when joins fan out.",
        ],
      },
    ],
  },

  // ───────────────── Lesson 6 ─────────────────
  {
    slug: "putting-it-together",
    title: "Putting it together: from question to query",
    subtitle: "A repeatable process for translating messy business questions into clean SQL.",
    estimatedMinutes: 10,
    skills: ["sqlProblemSolving", "sqlJoins", "sqlAggregation"],
    blocks: [
      {
        type: "markdown",
        md: "You know the grammar. The hard part — the part most tutorials skip — is the translation step: *someone asks a question in English; you have to produce a correct query.* Here's a process I've never seen fail.",
      },
      {
        type: "heading",
        level: 2,
        text: "The four-step translation",
      },
      {
        type: "markdown",
        md: "**1. Clarify the question.** Ask: *at what grain is the answer?* One row per customer? Per order? Per month? This decides the shape of your result.\n\n**2. Identify the tables and the joins.** Which tables hold the facts? Which keys connect them? Draw it on paper if it helps.\n\n**3. Filter before you aggregate.** Apply WHERE early to shrink the working set. Use parentheses; be explicit about NULL.\n\n**4. Aggregate, then post-filter.** GROUP BY at the grain you decided in step 1. Use HAVING only for group-level filters.",
      },
      {
        type: "heading",
        level: 2,
        text: "Worked example",
      },
      {
        type: "callout",
        tone: "info",
        title: "Question",
        md: "*\"Which of our top 10 cities (by paying customer count) had revenue growth from last month to this month?\"*",
      },
      {
        type: "markdown",
        md: "**Grain:** one row per city.\n\n**Tables:** `customers` (for city + plan), `orders` (for revenue + date).\n\n**Filters:** last two months; only paying plans.\n\n**Aggregates:** COUNT(DISTINCT customer) per city for the top-10 gate; SUM(revenue) per city per month for the comparison.\n\nOne workable shape:",
      },
      {
        type: "code",
        lang: "sql",
        code: `WITH revenue_by_city_month AS (
  SELECT
    c.city,
    DATE_TRUNC('month', o.created_at) AS month,
    SUM(o.total_cents) AS revenue_cents,
    COUNT(DISTINCT o.customer_id) AS paying_customers
  FROM orders o
  JOIN customers c ON c.id = o.customer_id
  WHERE c.plan IN ('starter', 'pro')
    AND o.created_at >= DATE_TRUNC('month', NOW() - INTERVAL '1 month')
  GROUP BY c.city, DATE_TRUNC('month', o.created_at)
),
top_cities AS (
  SELECT city
  FROM revenue_by_city_month
  WHERE month = DATE_TRUNC('month', NOW())
  ORDER BY paying_customers DESC
  LIMIT 10
)
SELECT
  r_this.city,
  r_last.revenue_cents AS last_month,
  r_this.revenue_cents AS this_month,
  r_this.revenue_cents - r_last.revenue_cents AS delta_cents
FROM revenue_by_city_month r_this
JOIN revenue_by_city_month r_last
  ON r_last.city = r_this.city
 AND r_last.month = r_this.month - INTERVAL '1 month'
JOIN top_cities t ON t.city = r_this.city
WHERE r_this.month = DATE_TRUNC('month', NOW())
ORDER BY delta_cents DESC;`,
      },
      {
        type: "callout",
        tone: "tip",
        title: "CTEs are your thinking tool",
        md: "`WITH name AS (...)` lets you name a sub-result and build on it. Don't try to write the whole thing in one go — layer it.",
      },
      {
        type: "heading",
        level: 2,
        text: "Common smells in your own queries",
      },
      {
        type: "markdown",
        md: "- **Numbers feel too big** → check for fan-out from a join.\n- **Rows appear twice** → add `DISTINCT` or move aggregation earlier.\n- **Nothing returned** → check NULL handling in WHERE; test without filters.\n- **Query is slow** → look at WHERE columns for indexes, and consider pre-aggregating in a CTE.",
      },
      {
        type: "quiz",
        prompt: "You get a gut feeling that your revenue number is 2x too high. The most likely cause is:",
        multi: false,
        choices: [
          { id: "a", label: "NULL values in the revenue column", correct: false, explain: "Nulls usually *shrink* totals, not double them." },
          { id: "b", label: "A join fan-out multiplying rows before SUM()", correct: true, explain: "The classic bug: joining a many-to-many path before aggregating." },
          { id: "c", label: "The wrong time zone", correct: false, explain: "Possible but doesn't double numbers." },
          { id: "d", label: "HAVING in the wrong place", correct: false },
        ],
      },
      {
        type: "reflect",
        prompt: "Think of a question your team or your life would benefit from answering with data. Write it in English, then write down the *grain* — one row per what?",
      },
      {
        type: "keyTakeaways",
        points: [
          "Start by naming the grain of your answer — one row per what?",
          "Filter before you aggregate; HAVING is for post-aggregate predicates only.",
          "CTEs (`WITH`) let you layer thinking: shape the data, then use it.",
          "Gut-check numbers. Too big usually means fan-out; too small usually means NULL.",
        ],
      },
      {
        type: "markdown",
        md: "Up next: the **capstone project** — five real business questions, your SQL, a reviewer who'll tell you exactly what to sharpen. When you pass, the path awards you the *SQL Foundations* credential.",
      },
    ],
  },
];
