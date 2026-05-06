# Lesson 4 — Pick the Right Container

**Target duration:** ~11:00
**Chapter marks (sec):** 0 / 80 / 220 / 410 / 560

---

## SCENE

The same Bengaluru classroom, well into the evening. The whiteboard now has four shapes drawn side by side — a numbered queue, a labelled cubby grid, a cloud of unique items, and a stapled bundle. The lecturer has the slightly-energized tone of a teacher about to share their favorite topic. They genuinely care which container you pick. They have lost weekends to other people not caring. Speaks with a calm Indian-English accent.

## SAMPLE CONTEXT

The listener has finished lessons one through three. Their previous takeaway, as the lecturer reminds them, was: *"Type-hint your signatures; the global keyword is a code smell; UnboundLocalError is a hint, not a mystery."* They are now about to learn that container choice — list versus dict versus set versus tuple — is a *complexity decision*, not an aesthetic one. Indian-English accent throughout — same lecturer.

## SPEAKER 1

**Recommended voice (true Indian accent):**
- Google Cloud TTS — `en-IN-Chirp3-HD-Charon` *(default)*
- Azure — `en-IN-PrabhatNeural`
- ElevenLabs — *Niraj (Indian English Male)*

**Fallback in Gemini Composer:** Charon *(Informative)* with `[Indian-English accent, calm Bengaluru lecturer tone]` prepended to the first speech block.

**Temperature:** `0.85`

---

### Speech block 1 — *Opening: the wrong container is a bug*  *(target 0:00 – 1:20)*

[Indian-English accent, calm Bengaluru lecturer tone] [matter-of-fact] Lesson three takeaway, repeated for free — *type-hint your signatures, the `global` keyword is a code smell, and `UnboundLocalError` is a hint, not a mystery.* If you skipped to this lesson hoping to learn list comprehensions without a contract for your function, [chuckles] go back. We will wait.

[wry] Today's lesson has a strong opinion buried in the title. It is — *the wrong container is a bug.* Not a stylistic choice. Not a preference. A *bug.* You will see why in about three minutes.

[firm] Most Python performance problems you'll meet in your first three years are not algorithmic. They are container-choice. Someone reached for a `list` when they wanted a `set`, or a `dict` when they wanted a `Counter`, and they turned an O of n operation into O of n-squared. The dataset grew. The function got slower. Someone bought a bigger machine. Nobody fixed the container.

[curious] Today, two named moves. Move one — *pick by access pattern.* Move two — *comprehensions, and the unhashable trap.* And one strong rule about dict keys that I will repeat twice.

[emphatic, slowly] Container choice — is a complexity decision. The shape of the data should match the question you're asking it.

---

### Speech block 2 — *Mental model: shape matches the question*  *(target 1:20 – 3:40)*

[curious] Picture four objects on a workbench. A *basket* with onions in it. A *ledger* with names in one column and rupee amounts in the other. A *cloud of color-coded stickers* — red, blue, green, no two stickers the same color twice. And a *sealed packet* with a label *one comma a comma true.*

[matter-of-fact] Each one answers a different question fast.

[matter-of-fact] The basket — that's a *list.* In what order did these arrive? What was the third one? Append a new one. Iterate through them. Lists are ordered. Lists allow duplicates. Lists are your default sequential container.

[matter-of-fact] The ledger — that's a *dict.* What's the value for *Sharma uncle?* What's the value for *Patel aunty?* You ask by name, you get the answer in constant time. Dicts map keys to values. They guarantee order of insertion in modern Python, but you don't iterate them for order; you query them by key.

[matter-of-fact] The cloud of stickers — that's a *set.* Have I seen this sticker color before? Add this color. Is it in the set? No order. No duplicates. Membership tests in constant time. Sets are how you ask *"have I seen this?"* without scanning a list.

[matter-of-fact] The sealed packet — that's a *tuple.* A fixed bundle. You don't open it; you use it as a unit. Most importantly — because it's immutable — you can use it as a dict key, or store it in a set. Tuples are how you carry a small, named bundle of values around.

[firm] Pick the wrong one and you pay the *linear-search tax* on every query. *Have I seen this user-id before?* — in a list, that scan is O of n every time. In a set, it is O of one. Run that loop a million times and the difference between the right container and the wrong one is the difference between three seconds and three days.

[emphatic, slowly] Container choice — is the difference between O of one and O of n. Pick wrong, pay the tax forever.

[switching to Hinglish, warm] Sabzi-mandi mein khada ho. Vendor ke paas — *tokri* (list) — pyaaz, paanch kilo, ek ke peeche ek. *Khaate ka register* (dict) — Sharma uncle 240, Patel aunty 150. *Color-coded sticker* (set) — red sticker matlab paid, blue matlab pending, same sticker do baar nahi lagta. *Sealed packet* (tuple) — item-weight-price, change nahi ho sakta. [pause] Tu list mein lookup karega *"Sharma uncle ka kitna baki?"* — pura register page-by-page padhega.

[returning to English, dry] Wrong container, linear-search tax on every query. The vendor knows this. The vendor switched to the ledger years ago. So should you.

<!-- EN-ONLY ALTERNATIVE
[dry] Walk through any market and you see all four containers in physical form — a basket of onions, a ledger by name, color-coded paid/unpaid stickers, sealed packets you don't open. Each one answers a different question fast. Pick wrong and you pay the linear-search tax forever.
-->

---

### Speech block 3 — *Move 1: pick by access pattern*  *(target 3:40 – 6:50)*

[firm] First named move. *Pick by access pattern, not by feel.*

[matter-of-fact] The diagnostic is one question — *how am I going to access this data?* Not *what kind of data is it.* The data is the same in any container; the *access pattern* changes everything.

[matter-of-fact] Four access patterns map to four containers, near-perfectly.

[matter-of-fact] *I will iterate them in order, sometimes index by position, dups are fine.* That's a list. Default sequential container. Append in O of one, lookup-by-position in O of one, lookup-by-value is O of n — which is the trap.

[matter-of-fact] *I will look up a value by a key, very fast, very often.* That's a dict. The key has to be hashable — string, int, tuple — we'll get to that in two minutes.

[matter-of-fact] *I will check whether something is in this collection, very fast, very often. Order doesn't matter. Dups are noise.* That's a set. Membership in O of one, deduplication for free.

[matter-of-fact] *I have a small fixed bundle of values that go together as a unit, and I might want to use them as a dict key or store them in a set.* That's a tuple.

[wry] If you find yourself writing — *I have a list, and I'm going to scan it every time I want to know if something is in it* — stop. That's a set's job. Convert the list to a set on the line you build it. Pay the conversion cost once. Save the linear-search tax forever.

[matter-of-fact] One useful sub-case. *Counter*, from the `collections` module. When you want to count occurrences of things — *how many times did each customer appear in the orders?* — `Counter of orders` is one line, returns a dict-like object with the counts already done. You did not write a `for` loop. You did not write `if key in dict else dict open bracket key close bracket equals zero`. Use it.

[firm] Two more from `collections` worth knowing by name. `defaultdict` — for grouping things, when you'd otherwise check *"is this key already there"* on every access. `deque` — for true queue and stack workloads where you'd otherwise pay O of n on every `pop from front` of a list.

[emphatic, slowly] You don't need to memorize the full `collections` module. You need to recognize the three or four moments when reaching for one of these is the right answer. Each one removes a five-line `for` loop and a possible bug.

---

### Speech block 4 — *Move 2: comprehensions and the unhashable trap*  *(target 6:50 – 9:20)*

[firm] Second named move. *Comprehensions and the unhashable trap.*

[matter-of-fact] You met list comprehensions in lesson two. Python gives you three more — *dict comprehensions, set comprehensions, and generator expressions.* All four take the same shape. *A new collection, where each element is a transformation, for each item in a source, optionally with a filter.*

[matter-of-fact] Dict comprehension — *a dict, where the key is the customer's email and the value is the customer's revenue, for each customer in customers.* One line. Replaces a `for` loop with `result of email equals revenue`.

[matter-of-fact] Set comprehension — *a set, where each element is the customer's region, for each customer in customers.* One line. Gives you the unique regions. Replaces a `for` loop with an `if not in` check.

[matter-of-fact] Generator expression — same shape as a list comprehension, but with parentheses instead of square brackets. *Lazy.* Doesn't build the full list in memory; produces values on demand. Use it for `sum`, `max`, `any`, `all`, or any pipeline where you don't need the intermediate list. *sum of customer dot revenue for each customer in customers* — one line, no intermediate list.

[wry] All three earn their keep when they stay short. Two clauses — a transform and a filter — sweet spot. Three or more, [chuckles] you have written a one-liner that nobody can read. Convert it back to a `for` loop. Comprehensions are not a competition.

[firm] Now the trap. *The unhashable type trap.*

[emphatic, slowly] Dict keys must be immutable. Set elements must be immutable. Lists, dicts, and sets *cannot* be dict keys, *cannot* be set elements. Python will raise — *TypeError, unhashable type, list.*

[matter-of-fact] The fix is almost always to convert the key to a *tuple.* If you wanted a key like `(1, 2)`, write the tuple — `d of one comma two equals something`. If you genuinely want a key that is a *set* of values where order doesn't matter — like, "any developer who knows SQL and Python" — use `frozenset`. The frozen variant of a set is hashable.

[wry] Why does Python forbid mutable keys? Because if the key changes after it's been hashed, the dict has no way to find it again. The hash was computed once, when the key was inserted. If the key mutates, the hash is stale, the dict is corrupted, and the bug is invisible until production.

[switching to Hinglish, warm] Aadhaar number ek 12-digit fixed string hai. Tu use kabhi alag *banaata* nahi — bas use karta hai. Yeh **immutable** hai. Yahi reason hai ki Aadhaar number good database key banta hai. [pause] Python mein same rule — dict key immutable honi chahiye — string, int, tuple. List nahi, dict nahi, set nahi. Mutable cheez ko key banaya toh hash badal sakta hai mid-flight, aur Python tujhe `TypeError, unhashable type, list` thappad maar dega.

[returning to English, dry] Stable identifiers make stable keys. Mutable bundles do not. Python won't let you cheat on this. Take it as a kindness.

<!-- EN-ONLY ALTERNATIVE
[dry] Stable identifiers — passport number, Aadhaar, email — make good dict keys because they don't change. Lists, dicts, and sets cannot be dict keys precisely because they can change. Python won't let you try; that's the unhashable type error.
-->

---

### Speech block 5 — *Try it and reflect*  *(target 9:20 – 11:00)*

[warm] Time to put container choice in your fingers.

[brisk] Three exercises. Open a REPL. Five minutes total.

[matter-of-fact] One. You have a list of ten thousand user-ids — many duplicates. You want to know how many distinct users are in it. Two solutions. The wrong one — `for` loop, build a list of seen ones, check `if not in` on every iteration. The right one — `len of set of user_ids`. One line. Constant-ish time per insert. Time both. Watch the difference at one million ids.

[matter-of-fact] Two. You have a list of order dicts, each with a `customer_email` key and an `amount` key. Build a dict mapping email to total spend across all their orders. Two solutions. The C-style — `for` loop, `if key in result else assign zero` ceremony, then add. The Python-style — `defaultdict of int`, then `for order in orders, result of order open bracket email equals plus order open bracket amount`. The second version is shorter, faster to read, and harder to get wrong.

[matter-of-fact] Three — the trap. Try to build a dict whose keys are pairs of integers — `d of open square one comma two close square equals something`. Watch the `TypeError, unhashable type, list`. Now rewrite with parentheses — `d of open paren one comma two close paren equals something`. Works. The fix is one keystroke; the lesson is permanent.

[firm] Five takeaways. [pause] One. Container choice is a complexity decision, not an aesthetic one — list, dict, set, tuple all answer different questions fast. Two. *Order matters, dups OK* is a list. *Look up by key* is a dict. *Have I seen this* is a set. *Fixed bundle* is a tuple. Three. `Counter`, `defaultdict`, and `deque` from the `collections` module remove a `for` loop each — learn the three moments to reach for them. Four. Comprehensions are loops with their ceremony stripped — keep them to two clauses; convert back when they stop being readable. Five. Dict keys and set elements must be immutable — use tuples and `frozenset` when your natural key is composite.

[gentle] Reflection prompt. *Open one Python file you wrote last month. Count the data structures. How many of them would be faster, smaller, or clearer if they were a different container?* [pause] Most of us have one of these in every file. Fix one this week.

[warm] Lesson five is next. We put it all together — names as stickers, control flow without ceremony, function contracts, and right-container choice — into a real four-stage pipeline that reads a messy CSV, transforms it, summarizes, and writes JSON. [wry] The traceback-reading discipline is coming.
