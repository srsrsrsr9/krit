# Lesson 5 — Subqueries, CTEs, and the Read-Order Lie

**Target duration:** ~12:00
**Chapter marks (sec):** 0 / 90 / 240 / 440 / 600

---

## SCENE

The same Bengaluru classroom in late afternoon. The whiteboard is split — left side shows the SQL clauses in their *write order* (SELECT, FROM, WHERE, GROUP BY, HAVING, ORDER BY, LIMIT); right side shows the same clauses in their *execution order* with arrows reordering them. The lecturer speaks with a warm Indian-English accent — measured, slightly sly, the way someone who has refactored a four-deep nested subquery into a clean CTE pipeline talks about the experience.

## SAMPLE CONTEXT

The listener has just finished lesson four — *GROUP BY Collapses Reality* — and now writes summaries that respect AVG-NULL semantics and HAVING-versus-WHERE. They've worked with one statement at a time. The lecturer is about to reveal that the order they've been writing SQL in is a *lie* about the order it actually runs in — and that this single insight unlocks nested subqueries, CTEs, and most of the senior-engineer SQL patterns. The lecturer is Indian and speaks with the rhythm and lilt of an Indian-English educator — *not* an American or British accent.

## SPEAKER 1

**Recommended voice (true Indian accent):**
- Google Cloud TTS — `en-IN-Chirp3-HD-Charon` *(default)*
- Azure — `en-IN-PrabhatNeural`
- ElevenLabs — *Niraj (Indian English Male)*

**Fallback in Gemini Composer:** Charon *(Informative)* with `[Indian-English accent, calm Bengaluru lecturer tone]` prepended to the first speech block.

**Temperature:** `0.85`

---

### Speech block 1 — *Opening: the read-order lie*  *(target 0:00 – 1:30)*

[Indian-English accent, calm Bengaluru lecturer tone] [thoughtful] You've been lied to. [pause] Not maliciously — by syntax, which is a worse kind of lie because nobody admits to it.

[matter-of-fact] Every SQL query you've written so far reads the same way. *SELECT, FROM, WHERE, GROUP BY, HAVING, ORDER BY, LIMIT.* That's the *write order.* You learned it in lesson one and you've been honoring it for four lessons. [pause]

[wry] The execution order is *almost completely different.* The SELECT clause — the one you write first — runs *second-to-last.* The WHERE clause runs *before* GROUP BY. The ORDER BY runs after the SELECT. The LIMIT runs at the very end.

[firm] Write order is a lie about execution order. Every SQL engineer in the world has stared at a "column does not exist" error and not understood why — and the reason, ninety percent of the time, is that they assumed write order was execution order.

[matter-of-fact] By the end of this lesson, you'll know the real execution order. You'll understand why subqueries work the way they do — because each subquery is just one step in the execution pipeline made explicit. You'll meet CTEs — the readability improvement that should be the first thing every SQL writer learns and is, somehow, often the last.

[dry] Two named moves today. Move one — pick CTEs over scalar subqueries by default. Move two — compose CTEs into a *pipeline* that mirrors how you'd think about the problem on paper. [pause]

[gentle] One promise. After this lesson, you will write one-third less SQL for the rest of your career. The right tool — the CTE pipeline — exists; most engineers don't reach for it because nobody told them to. We're telling you to.

---

### Speech block 2 — *Mental model: what you write vs what runs*  *(target 1:30 – 4:00)*

[thoughtful] Let's lay out the real execution order. Memorize this; it explains every "why won't this work" moment for the next two years.

[matter-of-fact] Step one — *FROM and JOINs.* The database assembles the source rows. It walks through the FROM table, joins in the related tables based on your JOIN ON conditions, and produces the *raw row stream.*

Step two — *WHERE.* Filter the row stream. Drop rows that don't match the WHERE conditions. Now you have a *filtered row stream.*

Step three — *GROUP BY.* Bucket the filtered rows by the grouping columns. Each bucket becomes one group.

Step four — *HAVING.* Filter the *groups* — drop the ones that don't match the HAVING conditions.

Step five — *SELECT.* For each surviving group, project the columns and compute the aggregates. This is where your SELECT list actually runs.

Step six — *ORDER BY.* Sort the result rows.

Step seven — *LIMIT.* Slice off the top N. [pause]

[emphatic, slowly] FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY, LIMIT. *That* is the real order.

[firm] Two implications you can use immediately. First — you cannot reference a SELECT alias inside WHERE. The alias doesn't exist yet; SELECT hasn't run. *WHERE total_revenue greater-than ten thousand* will fail if `total_revenue` is an alias defined in SELECT. Reference the underlying expression instead, or use a subquery or CTE.

[matter-of-fact] Second — you *can* reference a SELECT alias inside ORDER BY. ORDER BY runs after SELECT, so the alias exists by then. *ORDER BY total_revenue DESC* works fine. This is why you can write `ORDER BY 2` to mean "order by the second column in the SELECT list" — by the time ORDER BY runs, the columns have been chosen.

[switching to Hinglish, warm] Recipe likhi hai — *"Tomato chop karke onion ke saath fry karo. Pehle masala bhuna lo."* [pause]

[matter-of-fact] Reader sochta hai *"top-to-bottom — tomato chop, onion fry, masala bhun."* Cooking ka order yeh nahi hai. Pehle masala bhun, fir onion fry, fir tomato. Recipe likhne wala nayi banane wala nahi tha — woh sochne mein order alag hai, karne mein order alag hai.

[returning to English, dry] Recipes often read top-to-bottom but instruct the cook to do steps out of order — *"first, brown the spice."* The reader has to do the translation. SQL is the same. SELECT comes first in the text, runs second-to-last in execution. Once you see this, debugging gets a lot faster.

<!-- EN-ONLY ALTERNATIVE
[dry] Recipes often read top-to-bottom but instruct the cook to do steps out of order — "first, brown the spice." The reader has to do the translation. SQL is the same. SELECT comes first in the text, runs second-to-last in execution. Once you see this, debugging gets a lot faster.
-->

[gentle] One more practical consequence. The execution order is the *thinking order.* When you're planning a query — "what do I want?" — work in execution order. Start with FROM and the JOINs you need. Then the WHERE filters. Then how you'll group. Then how you'll filter the groups. Then what columns you want. Then how to sort and limit. *In that order.* Then translate it to SQL, which reverses parts of the order.

[firm] This is also the order CTEs let you write the query in. Which is why CTEs feel so much more natural the moment you discover them — they let you write your thinking down, top to bottom.

---

### Speech block 3 — *Move 1: CTEs over scalar subqueries*  *(target 4:00 – 7:20)*

[firm] First named move. CTEs over scalar subqueries. Always. Almost no exceptions.

[matter-of-fact] Quick definition. A *subquery* is a SELECT statement nested inside another SELECT, FROM, or WHERE. A *CTE* — Common Table Expression — is a named subquery defined at the top of your query using `WITH`. Same expressive power; vastly different readability.

[curious] Here's the structural comparison. Suppose you want — *"customers in Bengaluru, with their total spend, top five by spend."* Junior version uses nested subqueries —

[slowly] *SELECT star FROM open-paren SELECT star FROM open-paren SELECT customer_id, SUM amount AS total FROM orders GROUP BY customer_id close-paren sub one WHERE total greater-than zero close-paren sub two JOIN customers c ON c.id equals sub two.customer_id WHERE c.city equals quote-Bengaluru-quote ORDER BY sub two.total DESC LIMIT five.* [pause]

[dry] Two levels of nested subqueries. Aliases like `sub1` and `sub2`. Reading order is inside-out — you start at the innermost paren and work your way out. By line three of the indentation, you've forgotten what the innermost query was doing.

[wry] Now the same logic in CTEs.

[matter-of-fact] *WITH order_totals AS open-paren SELECT customer_id, SUM amount AS total FROM orders GROUP BY customer_id close-paren, bengaluru_customers AS open-paren SELECT id, name FROM customers WHERE city equals quote-Bengaluru-quote close-paren SELECT b.name, t.total FROM bengaluru_customers b JOIN order_totals t ON t.customer_id equals b.id ORDER BY t.total DESC LIMIT five.* [pause]

[firm, slowly] Read it top to bottom. Stage one — `order_totals` — sums orders by customer. Stage two — `bengaluru_customers` — picks Bengaluru customers. Final SELECT — joins the two stages, sorts, takes top five. *Each stage has a name.* Each stage is testable in isolation.

[emphatic] Same query plan. *Vastly* better readability. Same database; the planner usually treats CTEs and subqueries identically.

[switching to Hinglish, warm] Tu likhta hai —

*SELECT star FROM open-paren SELECT star FROM open-paren SELECT star FROM open-paren SELECT star FROM orders WHERE amount greater-than one hundred close-paren sub one WHERE city equals quote-Mumbai-quote close-paren sub two GROUP BY customer_id close-paren sub three ORDER BY total DESC.*

[matter-of-fact] Four levels deep. Bahut clever lag raha hai. [pause] Doosri din wapas dekha — *"yeh main ne kya likha?"* [chuckles]

CTEs ka use kar. Same logic, top-to-bottom, har stage ka naam. Reviewer thank kar dega; future-tu bhi thank karega.

[returning to English, dry] Four levels of nested subqueries are clever today and unreadable on Monday. CTEs flatten the same logic into a top-to-bottom pipeline with named stages. Same query plan; vastly better reading experience.

<!-- EN-ONLY ALTERNATIVE
[dry] Four levels of nested subqueries are clever today and unreadable on Monday. CTEs flatten the same logic into a top-to-bottom pipeline with named stages. Same query plan; vastly better readability.
-->

[gentle] Three reasons CTEs win. First — naming. *"order_totals"* is documentation. *"sub1"* is not. The reviewer can read your CTE list and understand the pipeline before reading any code.

Second — testability. You can run the CTE alone. *"Show me the order_totals CTE output."* Pull it out, run it, verify it. With nested subqueries, you can't do that without rewriting.

Third — composability. CTEs reference each other by name. Stage three can use stage one *and* stage two. Nested subqueries can't share intermediate results — each reference is a fresh nested SELECT.

[firm] The rule — *the day you find yourself writing one more SELECT inside parens, stop and add a CTE instead.* Same query plan. Different reading experience. Forever.

---

### Speech block 4 — *Move 2: composing CTEs into a pipeline*  *(target 7:20 – 10:00)*

[curious] Second named move. Compose CTEs into a *pipeline* that mirrors how you'd think about the problem on paper.

[matter-of-fact] A real-world example. Product asks — *"give me the top five cities by Q1 2026 revenue, with the average order size for each, but only paid orders, and only cities with at least one hundred orders."* [pause]

[wry] Try writing that as a single SELECT. You'll need a JOIN, a WHERE for the date and the paid status, a GROUP BY by city, a HAVING for the order count, an ORDER BY for revenue, a LIMIT for top five — *and* you need both SUM and AVG on the same grouped result. It's all possible. It's also a single 25-line statement that takes ten minutes to read.

[firm] Now write it as a CTE pipeline. Five stages. Each one is two or three lines.

[slowly] Stage one — `paid_q1` — filter orders to paid plus Q1 2026.
Stage two — `city_totals` — group by city, sum the revenue, count the orders, average the order size.
Stage three — `qualified_cities` — filter `city_totals` to cities with order count above one hundred.
Final SELECT — pick the columns we want, order by revenue, limit five. [pause]

[matter-of-fact] Each stage is small. Each stage is named. The pipeline reads top-to-bottom in *thinking order* — filter, group, qualify, present. The senior reviewer reads the CTE names and immediately understands the pipeline. *Then* they read the code.

[emphatic] This is the single most productive habit you can install. Before writing any non-trivial query, write the pipeline as English bullets — *"stage one filters to X. Stage two groups by Y. Stage three picks the top N. Stage four formats the output."* With pencil. Then translate each bullet to a CTE.

[switching to Hinglish, warm] Senior dev banane ka shortcut nahi hai. Lekin ek habit hai jo sabse zyada productive output deta hai.

[matter-of-fact] *Har baar query likhne se pehle, English mein paanch-step pipeline likh.* [pause]

*Stage one — yeh data lo. Stage two — yeh filter karo. Stage three — yeh group karo. Stage four — top N nikaalo. Stage five — format karke do.* Pencil se. Phir CTE per stage likh.

Total time — do minute planning, teen minute query. Galat planning ke baad thirty minute debugging better hai? *Nahi, bhai.*

[returning to English, dry] Two minutes of pencil planning saves an hour of debugging. The habit takes a week to install and pays for the rest of your career.

<!-- EN-ONLY ALTERNATIVE
[dry] Before writing any non-trivial query, write the pipeline as English bullets. Stage 1 filters to X. Stage 2 groups by Y. Stage 3 picks top N. Then translate each bullet to a CTE. Two minutes of planning saves an hour of debugging. The habit takes a week to install and pays for the rest of your career.
-->

[gentle] One more thing about CTE pipelines. They make code review *possible.* When the reviewer sees five named stages, they can audit each one in isolation — *"does stage two correctly compute the per-city revenue?"* — without keeping the entire query in their head. With nested subqueries, the reviewer either reads it all in one go or they don't read it at all. *Most reviewers, in practice, don't read it.* CTEs are how you let your code be reviewed properly.

[curious] When *not* to use CTEs. There's exactly one case — extremely simple queries where the CTE adds noise. *"SELECT name FROM customers WHERE city equals Bengaluru."* Don't wrap it in a CTE; you'd just be adding a layer for nothing. The threshold is roughly — if your query has a JOIN, a GROUP BY, *and* a HAVING or post-aggregation filter, use CTEs. Below that threshold, plain SQL is fine.

---

### Speech block 5 — *Try it and reflect*  *(target 10:00 – 12:00)*

[warm] Open the playground. The exercise is one query, written two ways.

[firm] First version — write the query *"top three Bengaluru customers by total order amount in March 2026"* using nested subqueries. It will work; you'll get the right answer. Take a screenshot of how it looks.

[matter-of-fact] Second version — rewrite the same query as a CTE pipeline. Three stages. Stage one — orders in March. Stage two — Bengaluru customers. Stage three — join, sum, sort, limit. Run it. Verify the answer matches the first version.

[curious] Now — and this is the actual exercise — open both versions side by side, and ask yourself one question. *"Which one would I rather inherit if I were the on-call engineer at two AM?"* The answer is not subtle. It is the *whole point of CTEs.*

[thoughtful] Reflection prompt. *"What's one query in my codebase that has more than two levels of nested subqueries?"* [pause] Open it. Refactor it to CTEs. Don't change the logic; just rename the stages. The diff will look enormous; the behavior change will be zero. Ship it. Your future on-call self will thank you.

[brisk] Quick recap. Write order is not execution order. Real execution order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY, LIMIT. SELECT runs second-to-last; this is why aliases work in ORDER BY but not WHERE. CTEs are named subqueries defined at the top with WITH; they have the same expressive power as nested subqueries with vastly better readability. Compose CTEs into a top-to-bottom pipeline that mirrors your thinking — filter, group, qualify, present.

[firm] Five things to take with you. [pause] One. Write order is a lie; execution order is FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY, LIMIT. Two. SELECT aliases work in ORDER BY; not in WHERE. Three. CTEs over scalar subqueries; same query plan, much better readability. Four. Compose CTEs into a pipeline of named stages — filter, group, qualify, present. Five. Plan the pipeline in English bullets *before* writing any SQL; two minutes of planning saves an hour of debugging.

[gentle] Reflection prompt — find one nested-subquery query in your codebase. Refactor it to CTEs without changing the logic. Notice how the diff looks scary and the behavior change is zero. That experience is the rest of your SQL career.

[warm] You're done. Five lessons. [pause] You walked in copy-pasting SQL from Stack Overflow. You walk out with the relational model, three-valued logic, JOIN-by-intent, the fan-out trap, GROUP BY as controlled collapse, HAVING versus WHERE, the execution-order lie, and CTE pipelines.

[firm] You are now in the top thirty percent of self-taught SQL writers — measured by readability of the code you produce, not by syntactic novelty. [wry] Ship it. And the next time someone hands you a four-deep nested subquery to debug — refactor first. Then debug. Always in that order.
