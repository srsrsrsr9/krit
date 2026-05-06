# Lesson 2 — Filtering Without Crying

**Target duration:** ~11:00
**Chapter marks (sec):** 0 / 80 / 220 / 410 / 560

---

## SCENE

The same Bengaluru classroom in the late afternoon. The `customers` whiteboard from lesson one still has marker traces on it. A new column has been added — a few cells deliberately left blank, with a little NULL written above them in red. The lecturer speaks with a warm Indian-English accent — measured, slightly conspiratorial, the way an experienced engineer talks about the bugs that taught them humility.

## SAMPLE CONTEXT

The listener has just finished lesson one — *Why SQL Refuses to Die* — and has written their first SELECT-FROM-WHERE query. They feel competent. The lecturer is about to gently demonstrate that competence is one NULL value away from a wrong answer in production. The lecturer is Indian and speaks with the rhythm and lilt of an Indian-English educator — *not* an American or British accent.

## SPEAKER 1

**Recommended voice (true Indian accent):**
- Google Cloud TTS — `en-IN-Chirp3-HD-Charon` *(default)*
- Azure — `en-IN-PrabhatNeural`
- ElevenLabs — *Niraj (Indian English Male)*

**Fallback in Gemini Composer:** Charon *(Informative)* with `[Indian-English accent, calm Bengaluru lecturer tone]` prepended to the first speech block.

**Temperature:** `0.85`

---

### Speech block 1 — *Opening: half your bugs live in WHERE*  *(target 0:00 – 1:20)*

[Indian-English accent, calm Bengaluru lecturer tone] [thoughtful, slightly amused] You wrote your first SELECT-FROM-WHERE query in the last lesson. You felt competent. That feeling is, statistically, about to cost you four hours of debugging. [pause] Let's prevent it.

[matter-of-fact] Most SQL bugs that ship to production are filter bugs. Not the obvious kind, where the query throws an error and your CI catches it. The kind where the query *runs successfully*, returns four thousand two hundred rows that *look* correct, and silently misses six hundred because of a NULL that didn't compare the way you assumed.

[wry] No exception is thrown. No log entry is written. The dashboard renders. The number is wrong by fifteen percent, in the direction nobody checks. This is the genre of bug that ages in production for eighteen months before someone in finance notices.

[firm] By the end of this lesson, you'll know exactly how WHERE evaluates each row, how NULL pollutes your filters, and how to write conditions that mean what you wrote. Two named moves. Move one — picking operators that do what you actually mean. Move two — handling NULL as if it were a person who never gives you a straight answer. [pause]

[dry] One promise. Once you internalize three-valued logic, you will write filters that are correct on the first run for the rest of your career. The other engineers around you will not. You will gradually become the person they ask before they ship a report.

---

### Speech block 2 — *Mental model: three-valued logic*  *(target 1:20 – 3:40)*

[thoughtful] Most programming languages have two truth values. True. False. You learned this when you were sixteen. [pause] SQL has three.

[curious] TRUE. FALSE. UNKNOWN.

[matter-of-fact] Whenever a condition involves a NULL, the result is UNKNOWN — not TRUE, not FALSE, not "let me guess." UNKNOWN. Three states, not two. WHERE keeps only TRUE rows. UNKNOWN rows are dropped, *exactly the way FALSE rows are dropped.* From your seat, looking at the result, they are indistinguishable. From the database's seat, they are not the same thing.

[firm, slowly] Read that again. WHERE keeps TRUE. WHERE drops both FALSE *and* UNKNOWN. They look identical in your output; they are not the same.

[emphatic] This is the source of more silent bugs in SQL than every other feature combined. Memorize the three values. Treat NULL with respect.

[switching to Hinglish, warm] Tu ne ghar pe milk laana tha. Mummy puchti hai *"laaya?"* Three answers possible:

[matter-of-fact] *TRUE* — *"haan laaya"* — milk fridge mein. Sab khush.

*FALSE* — *"nahi laaya"* — daant padti hai, lekin clarity hai.

*UNKNOWN* — [pause] tu ne answer skip kar diya, phone dekhne laga. [chuckles] Mummy ne assume kiya nahi laaya. Aaj khichdi banegi.

[returning to English, dry] In Mummy's three-valued logic, silence is functionally equivalent to "no." Same in SQL. A NULL in your filter condition produces UNKNOWN, which gets dropped just like FALSE. The row "looks like" it failed your test. It didn't fail; it never got *tested.* The condition couldn't even evaluate.

<!-- EN-ONLY ALTERNATIVE
[dry] If you don't answer your mom's "did you bring the milk?" — silence is no. Same in SQL. A NULL in your filter produces UNKNOWN, which gets dropped just like FALSE. The row looks like it failed your test. It didn't fail; it never got tested.
-->

[gentle] So when you write `WHERE city equals quote-Bengaluru-quote`, every customer whose city *is NULL* — six hundred of them — gets silently dropped. Not because they're not in Bengaluru. Because the database can't decide whether they are or aren't. UNKNOWN. Same fate as FALSE. Different reason.

[matter-of-fact] Three values. TRUE, FALSE, UNKNOWN. Once you carry this in your head, you'll start asking *the second question*: "what about the NULLs?" That question, asked at write-time, prevents most production filter bugs.

---

### Speech block 3 — *Move 1: operators that do what you mean*  *(target 3:40 – 6:50)*

[firm] First named move. Pick operators that do what you mean. SQL has more of them than you think, and the lazy ones are bug magnets.

[matter-of-fact] The basic six are obvious. Equals, not-equals, greater-than, less-than, greater-than-or-equal, less-than-or-equal. You'll use these in every query you write.

[curious] Then there's a second tier — `IN`, `BETWEEN`, `LIKE`, `IS NULL`. These are where the writing-quality lives.

[wry] Let's start with the anti-pattern. You want orders from Mumbai or Pune or Bengaluru or Chennai. Junior version writes —

[slowly] *WHERE city equals quote-Mumbai-quote OR city equals quote-Pune-quote OR city equals quote-Bengaluru-quote OR city equals quote-Chennai-quote.* [pause]

[dry] Four ORs. Tedious to type. Tedious to read. *And* — when product asks for a fifth city to be added at two AM, you copy-paste the line, mistype the column name, your query returns zero rows, the dashboard goes blank, and on-call calls you. [pause]

[firm] Use `IN`. Always.

[matter-of-fact] *WHERE city IN open-paren quote-Mumbai-quote, quote-Pune-quote, quote-Bengaluru-quote, quote-Chennai-quote close-paren.* One line. Trivial to extend. The parser is happier; you're happier; the on-call rotation is happier.

[emphatic] The rule is — three or more `OR` conditions on the same column? You wanted `IN`. Convert any OR-chain longer than two the moment you write it.

[switching to Hinglish, warm] Bhai, OR chain mein bug paida hone ka rate, IN ke comparison mein, conservatively, dus guna zyada hai. Yeh data mein dekha hai — code reviews mein, postmortems mein, two AM Slack messages mein. [chuckles]

[returning to English, dry] Three ORs is your tipping point. Convert.

<!-- EN-ONLY ALTERNATIVE
[dry] Three or more ORs on the same column is a bug factory. The fifth city always typos itself. Use IN. Same answer; tenth the typo risk.
-->

[curious] Next operator — `BETWEEN`. Use it for ranges. *WHERE amount BETWEEN one hundred AND one thousand* is cleaner than two separate comparisons. One quirk to remember — BETWEEN is *inclusive* on both ends. One hundred is included; one thousand is included. If you want exclusive, use the comparison operators directly. The error mode here is silent — you'll get one extra row at each end of the range, and you may not notice for weeks.

[matter-of-fact] `LIKE` for pattern matching. Percent for any sequence of characters; underscore for exactly one character. *WHERE email LIKE quote-percent-at-gmail-dot-com-quote* finds every Gmail user. Useful, but slow on large tables — `LIKE` with a leading wildcard cannot use an index. Know that you've made a performance trade-off, then make it consciously.

[firm] And the most important operator in this whole list — `IS NULL`. Not `equals NULL`. *`IS NULL`.* These are different operators. The next chapter explains why.

---

### Speech block 4 — *Move 2: NULL is not a value*  *(target 6:50 – 9:20)*

[curious] Second named move. NULL is not a value. NULL is the *absence* of a value. Once you internalize this, every NULL bug becomes obvious in advance.

[matter-of-fact] Here's the rule that follows. *Any comparison involving NULL evaluates to UNKNOWN.* Not TRUE, not FALSE. UNKNOWN. This includes the comparison `column equals NULL` — which, by the way, is *always* UNKNOWN, even when the column is in fact NULL. Because NULL doesn't equal anything, *including itself.*

[emphatic] *NULL does not equal NULL.* Memorize that line. Tattoo it on your wrist.

[wry] So if you write `WHERE city equals NULL`, you will get zero rows back. Not because no rows have NULL cities; the rows do exist. Because the comparison evaluates to UNKNOWN for every single row, and WHERE drops UNKNOWN.

[firm] To find rows where the city is NULL, use `WHERE city IS NULL`. To find rows where it isn't, `WHERE city IS NOT NULL`. These are special operators that handle the NULL case explicitly. Use them.

[matter-of-fact] Now the harder bug, which I'll call the WHERE-the-cat-sat-on bug. You write `WHERE city not-equals quote-Mumbai-quote`. You expect it to return every customer who is *not* in Mumbai. [pause] What it actually returns is every customer who is *known to be in some city other than Mumbai.*

[dry] The Mumbai-NULL customers — the ones whose city we don't know — are silently dropped. Not because they're in Mumbai; because the database can't tell. UNKNOWN. Treated like FALSE. Same fate.

[slowly] So the diagnostic question, every time you write a `not-equals` or `NOT IN` or `NOT LIKE` — *what should happen to the NULLs?* Decide explicitly. Either accept the default — NULLs excluded — and write a comment saying so, or add `OR column IS NULL` to your condition.

[switching to Hinglish, warm] Indian forms pe yeh dekha hai? *"If not applicable, write N-slash-A."* SQL ka same tool hai — `COALESCE`. [pause]

`SELECT customer, COALESCE(city, 'Unknown') AS city FROM orders.` NULL ki jagah quote-Unknown-quote aa jaata hai. Filter mein bhi use kar sakte ho — `WHERE COALESCE(city, '') not-equals quote-Mumbai-quote`. Ab NULL waale customers bhi included hain.

[returning to English, matter-of-fact] `COALESCE` is dangerously simple, dangerously useful. Use it to make NULLs explicit, *not* to hide them. The rule — declare your treatment of missing values, don't accept whatever the database happens to do.

<!-- EN-ONLY ALTERNATIVE
[matter-of-fact] COALESCE is SQL's "if-this-is-NULL-use-this-instead" function. COALESCE(city, 'Unknown') replaces every NULL city with the string Unknown. Use it to make your treatment of missing values explicit — never to hide them.
-->

[firm] Two more pieces of the NULL toolkit. `NULLIF` — the inverse of COALESCE; turns a specific value into NULL. Useful when your data has the string "N/A" where it should have a real NULL. And `IS DISTINCT FROM` — a NULL-safe equality operator. `a IS DISTINCT FROM b` returns TRUE if exactly one is NULL, or both are non-NULL and different. It does what `not-equals` *should* do for NULL safety, but doesn't.

[gentle] Three-valued logic isn't a quirk. It's an honest answer to a real question — *what does it mean to compare against missing data?* Most languages dodge by treating NULL as zero or empty string. SQL refuses to dodge. The price is one extra question per WHERE clause; the prize is no silent wrong answers in production.

---

### Speech block 5 — *Try it and reflect*  *(target 9:20 – 11:00)*

[warm] Open the query playground. The exercise is two queries, and a comparison.

[firm] First query — find every order whose `amount` is *not* greater than one thousand. Just write it the obvious way. Run it. Note the row count.

[matter-of-fact] Second query — find every order whose amount is *not* greater than one thousand, *or* whose amount is NULL. Write `OR amount IS NULL` at the end. Run it. Note the row count.

[curious] The two row counts will differ. The difference is the number of orders with NULL amounts — and the number that the first query silently dropped. *That difference is the bug.*

[thoughtful] The reflection prompt is one sentence. *"In which of my current production queries am I silently dropping NULL rows because I never asked the second question?"* [pause] You probably have at least one. Most engineers do.

[brisk] Quick recap. SQL has three truth values — TRUE, FALSE, UNKNOWN. WHERE keeps only TRUE; FALSE and UNKNOWN look identical at the output but mean different things. Comparison with NULL is always UNKNOWN, including `column equals NULL`. Use `IS NULL` and `IS NOT NULL` for NULL-checks; use `IN` instead of long OR-chains; reach for COALESCE when you need an explicit default.

[firm] Five things to take with you. [pause] One. WHERE keeps TRUE; drops FALSE *and* UNKNOWN. Two. NULL doesn't equal anything, including itself. Three. `not-equals`, `NOT IN`, `NOT LIKE` silently drop NULL rows — decide explicitly what you want. Four. Replace OR-chains of three or more with `IN`. Five. `COALESCE` makes NULLs explicit; use it to handle, not to hide.

[gentle] Reflection prompt — find one query in your current codebase that uses `not-equals` or `NOT IN`. Read it again with the NULL question in mind. *Should the NULL rows be in or out of your result?* If you can't answer in one sentence, that query has a latent bug.

[warm] We'll see you in lesson three — *JOINs Are Just Set Theory With Tables.* [wry] Where we go from one table to two, and your row count starts behaving in ways your intuition was not expecting.
