# Lesson 3 — Functions Are Plug-In Tools

**Target duration:** ~11:00
**Chapter marks (sec):** 0 / 80 / 220 / 410 / 560

---

## SCENE

The same Bengaluru classroom, evening. The whiteboard now has a sealed-box diagram with arrows pointing in (labelled `args`, `kwargs`) and one arrow pointing out (labelled `return`). The lecturer is holding a marker between two fingers like a cigarette they've decided not to smoke, looking at a function signature that someone has written incorrectly enough to be illustrative. They are about to insist, gently and firmly, that type hints stopped being optional in 2026. Speaks with a calm Indian-English accent.

## SAMPLE CONTEXT

The listener has finished lessons one and two. Their previous takeaway, as the lecturer reminds them, was: *"`for x in items` is the default; off-by-ones live in the boundary, not the counting."* They are about to learn that the third place where their Python turns into someone-else's-problem is the function signature — and the named bug they will eventually hit is `UnboundLocalError`. Indian-English accent throughout — same lecturer.

## SPEAKER 1

**Recommended voice (true Indian accent):**
- Google Cloud TTS — `en-IN-Chirp3-HD-Charon` *(default)*
- Azure — `en-IN-PrabhatNeural`
- ElevenLabs — *Niraj (Indian English Male)*

**Fallback in Gemini Composer:** Charon *(Informative)* with `[Indian-English accent, calm Bengaluru lecturer tone]` prepended to the first speech block.

**Temperature:** `0.85`

---

### Speech block 1 — *Opening: functions as plug-in tools*  *(target 0:00 – 1:20)*

[Indian-English accent, calm Bengaluru lecturer tone] [matter-of-fact] Lesson two takeaway, repeated for free — *for x in items is the default; off-by-ones live in the boundary, not the counting.* If a loop in your code still says `for i in range of len`, fix it after this lesson. It is bothering me on your behalf.

[wry] Today's lesson is about functions. You have been writing them since lesson one of any tutorial you ever opened. You probably write them poorly. So do most professionals. So did I, until a senior engineer named Karthik returned a code review to me with the comment, *"this function takes seven things and returns three. I cannot tell what it does. Please rewrite."* It rewrote my career.

[firm] A good Python function is a *plug-in tool.* Clear inputs through the signature. One job. One return shape. No hidden state. No surprises. Predictable enough that the next engineer can use it without reading the body.

[curious] A bad Python function is an *imperative script wrapped in def.* Seven arguments, three globals, sometimes returns None, sometimes raises, mutates two of its inputs as a side effect. You have written this function. You will write it again next week unless we install three named moves now.

[emphatic, slowly] Three moves today. Move one — *the signature is a contract.* Move two — *args, kwargs, and defaults that don't bite.* Move three — *scope, and the UnboundLocalError trap.* Plus one strong opinion you will hear me say twice.

[dry] The strong opinion — type hints are not optional anymore for any Python code that lasts past Friday. We will get to it. Let's start.

---

### Speech block 2 — *Mental model: the signature is a contract*  *(target 1:20 – 3:40)*

[curious] Picture a sealed cardboard box, sitting on a workbench. On the front of the box there is a label that says — *put one integer in this slot. Out of this slot, you will get back one User object.* That label is the signature. The box is the function. What happens inside the box is its own business; you do not need to know.

[matter-of-fact] In Python, that label looks like — *def get_user, open paren, user underscore id colon int, close paren, arrow User, colon.* Type hint on the input. Type hint on the return. The signature is now *self-documenting.* The reviewer can audit the boundary without reading the body. The IDE can autocomplete. The type checker can catch the wrong call site before you ship.

[firm] If you write a function in 2026 without type hints, you have shipped *an unsigned contract.* It works only because your colleagues are willing to read the body to figure out what you meant. They will be willing exactly until they aren't, at which point your function becomes the one nobody wants to touch.

[emphatic, slowly] Type hints — are not optional — for any Python code — that lasts past Friday. Including yours. Especially yours.

[wry] The objection I hear once a sprint — *"but type hints are slow to write, they make the code longer, the function works fine without them."* That last clause is correct in the same sense that a car works fine without seatbelts. Until it doesn't. The cost is small. The rebate is permanent.

[switching to Hinglish, warm] Bombay dabbawala ka system 99.999% accurate hai. Kyun? Kyunki har dabba ke upar ek 6-character code hai — tiffin kahaan se aaya, kahaan jaayega, train kaunsi. **Yeh signature hai.** No ambiguity, no *"kuch bhi de do, dekh lenge."* [pause] Tera function bhi same hona chahiye. Type hints daal — `(user_id: int) -> User`. Caller ko bhi clarity, future-tu ko bhi.

[returning to English, dry] Aaj paanch minute lagenge. Six months later they save you five hours of debugging. Best return on investment in your career.

<!-- EN-ONLY ALTERNATIVE
[dry] Mumbai's lunchbox-delivery system is 99.999 percent accurate because every box has a six-character code — origin, destination, train. That's a signature. No ambiguity. Your function deserves the same. Type hints take five minutes to write and save five hours of debugging six months later.
-->

[gentle] Two more contract clauses worth signing. One — your function returns *one shape*, not "sometimes a User, sometimes None, sometimes a string error message." Pick one. Two — your function does not silently mutate its inputs. If you mutate, name the function for it — `update_user_in_place` — so the caller knows.

---

### Speech block 3 — *Move 1: args, kwargs, and defaults that don't bite*  *(target 3:40 – 6:50)*

[firm] First named move. *Args, kwargs, and defaults that don't bite.*

[matter-of-fact] Python gives you four ways to declare an argument. Positional. Keyword. Positional-with-default. Keyword-with-default. The art of a good signature is picking the right *kind* of argument for each parameter, not just listing them.

[matter-of-fact] Rule one — *required arguments are positional, optional arguments are keyword.* If a function genuinely needs a user-id to do its job, that's positional. The caller can't forget it; Python won't let them. If a function takes an optional limit on the number of results, that's keyword-with-default — `limit equals fifty`. The caller writes `get_users of org_id, limit equals one hundred` at the call site, and the call reads like a sentence.

[wry] If your function has more than three positional arguments, [chuckles] you have built a fragile call site. The fourth argument is *the one your colleague passes in the wrong order in six months.* Promote arguments to keyword-only by putting a single asterisk before them in the signature — *def thing of a, b, asterisk, c, d.* Now `c` and `d` *must* be passed by name. Misordering becomes impossible. Readability at the call site goes up.

[matter-of-fact] Rule two — *defaults must be immutable.* We covered this in lesson one — never write `def f, open paren x equals empty list close paren`. Use `None` as the default and construct the real container as the first line of the function. If you skipped that lesson, the function will share state across every call. Re-listen to lesson one. We will not re-litigate.

[matter-of-fact] Rule three — *star-args and double-star-kwargs are advanced features, not defaults.* `def something of asterisk args, double-asterisk kwargs` does have its uses — wrappers, decorators, passing through to another function. It is *not* a default signature shape. If your function takes `*args, **kwargs` because you didn't know what arguments it needed, you have written a function that can be called with anything and tested for nothing. Decide what your function takes. Name it. Type-hint it.

[emphatic, slowly] One job. One signature. Type hints on inputs. Type hint on the output. Defaults that are immutable. Keyword-only for anything optional. That is the whole template.

[firm] An aside on return types. If your function can fail — file might not exist, network might time out, lookup might miss — *do not return None silently.* Either raise a specific exception that the caller can catch, or return an explicit Result-shaped object — a tuple of success-and-value, or a tagged union. The worst pattern in Python is the function that returns User-or-None and forces every caller to write `if result is not None` defensively forever.

---

### Speech block 4 — *Move 2: scope and the UnboundLocalError trap*  *(target 6:50 – 9:20)*

[firm] Second named move. *Scope, and the UnboundLocalError trap.*

[matter-of-fact] Python's scoping rule is short and counterintuitive. When you assign to a name *anywhere* inside a function body, Python decides — *for the entire function* — that name is local. Even on lines *before* the assignment.

[wry] This is the source of one of the most baffling errors a junior Python developer ever sees. You have a global counter named `count` set to zero. You write a function called `increment`. The first line of the function reads `count` and prints it. The second line reassigns `count`. You call `increment`. You expect to see zero printed, then a new global value. [pause] You get *UnboundLocalError — local variable count referenced before assignment.* You stare at the screen. The variable is *right there*, defined globally. Why is it unbound?

[emphatic, slowly] Because the moment Python parsed the assignment on the second line, it decided — for the *entire function* — that `count` was a local. The print on the first line is therefore reading a local that hasn't been assigned yet. The global `count` is invisible to the function the moment you assign anywhere inside.

[firm] The fix, in order of preference. One — *pass `count` in as an argument*, return the new value, let the caller update the global. This is the right answer ninety-five percent of the time. Two — if you genuinely need to mutate a state in an enclosing function (a closure pattern), use the `nonlocal` keyword to say *"I mean the one in the enclosing function."* Three — only if you are writing module-level state and you have no better option, use the `global` keyword to say *"I mean the module global."* The `global` keyword is almost always a code smell. If your function is doing real work, it should not be reaching into module-level state.

[wry] *"But this is annoying,"* says every developer the first time they hit this. Yes. It is also keeping you out of a much worse bug class — Python deciding that the same name means three different things in three different scopes, depending on which line you happened to read it from. The local-by-assignment rule makes scope unambiguous. Once you know it, the error becomes a hint, not a mystery.

[matter-of-fact] One more nuance — closures. When you define a function inside a function, the inner function can *read* names from the outer function freely. But if it tries to *assign* to one, same trap. You need `nonlocal` on the first line of the inner function. This is the most common closure bug in Python; budget for it once a quarter.

[switching to Hinglish, warm] Mummy ka *"khaane mein kya banao?"* function ki signature — `(option1, option2, mood) -> dinner`. Tu pucha *"kuch bhi de do."* — TypeError. *Kuch bhi* allowed nahi hai. Concrete option de. [pause] Tu pucha *"sab khaa lunga."* — UnboundLocalError. *Sab* defined nahi hai is scope mein. Mummy ne 35 saal mein yeh API design kara hai.

[returning to English, dry] Strict signatures feel pedantic until the second time someone calls your function correctly without asking you a question. Then they feel like a permanent rebate.

<!-- EN-ONLY ALTERNATIVE
[dry] Strict function signatures feel pedantic at first. They feel like a rebate the second time someone calls your function and gets it right without asking you a single question. Be the parent, not the colleague who sighs.
-->

---

### Speech block 5 — *Try it and reflect*  *(target 9:20 – 11:00)*

[warm] Time to put the contract into your hands.

[brisk] Three exercises. Open an editor — these are not REPL-friendly.

[matter-of-fact] One. Write a function called `summarize_orders`. It takes a list of order dictionaries. It returns a dictionary with two keys — `total_revenue` and `order_count`. Type-hint the inputs and the output. No mutable defaults. No globals. The body should be five lines or fewer. Show it to one teammate; ask them to predict what the output looks like *without* reading the body. If they can, you've written a contract.

[matter-of-fact] Two. Take this broken function — *def add_item, open paren, item, basket equals empty list, close paren, basket dot append item, return basket.* Call it three times in a row with one item each, no second argument. Print each return value. Watch the basket fill up across calls. Now rewrite it with the None-sentinel pattern. Run it again. Each call returns a fresh list. The trap is in your fingers.

[matter-of-fact] Three — the scope trap. Set a module-level variable `counter equals zero`. Write a function `bump` that prints `counter`, then assigns `counter equals counter plus one`. Call it. Watch the UnboundLocalError. Now rewrite the function to take `counter` as an argument and return the new value. Call it three times, threading the value through. The second version is the function you want. The first version is the function you should never ship.

[firm] Five takeaways. [pause] One. The signature is a contract — type-hint inputs and outputs, always, in code that lasts past Friday. Two. Required arguments are positional; optional arguments are keyword-with-immutable-default. Three. If your function has more than three positional arguments, promote the rest to keyword-only with a single asterisk. Four. Assigning to a name inside a function makes it local for the entire function — `UnboundLocalError` is your hint, not a mystery. Five. The `global` keyword is almost always a code smell — pass state in, return state out, let the caller manage it.

[gentle] Reflection prompt. *Open the longest Python function you have written in the last month. Count the arguments. Count the type hints. Count the lines.* [pause] Then count how many of those would survive a teammate calling it cold, without reading the body.

[warm] Lesson four is next. We move from functions to data — list, dict, set, tuple, and the question that decides which one you should reach for. [wry] The unhashable-type trap is coming.
