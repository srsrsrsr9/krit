# Lesson 2 — Control Flow Without the Ceremony

**Target duration:** ~11:00
**Chapter marks (sec):** 0 / 80 / 220 / 410 / 560

---

## SCENE

The same Bengaluru classroom, ten minutes after the previous lesson. The lecturer has erased the boxes-and-stickers diagram and is drawing a staircase on the whiteboard. They are visibly slightly tired of seeing junior engineers write `for i in range(len(things))` and are about to do something about it. Speaks with a calm Indian-English accent.

## SAMPLE CONTEXT

The listener has just absorbed lesson one — names as stickers, mutable defaults. Their takeaway, as the lecturer pointedly reminds them, was: *"`=` doesn't copy, it aliases."* They are about to find out that the second-most-common Python anti-pattern is writing loops the way C taught them to. Indian-English accent throughout — same lecturer.

## SPEAKER 1

**Recommended voice (true Indian accent):**
- Google Cloud TTS — `en-IN-Chirp3-HD-Charon` *(default)*
- Azure — `en-IN-PrabhatNeural`
- ElevenLabs — *Niraj (Indian English Male)*

**Fallback in Gemini Composer:** Charon *(Informative)* with `[Indian-English accent, calm Bengaluru lecturer tone]` prepended to the first speech block.

**Temperature:** `0.85`

---

### Speech block 1 — *Opening: control flow as conversation*  *(target 0:00 – 1:20)*

[Indian-English accent, calm Bengaluru lecturer tone] [matter-of-fact] Lesson one takeaway, repeated for free — *equals does not copy, it aliases.* If that didn't lodge, go back. The next ten lessons stand on it.

[wry] Today we deal with the second-most-common reason your Python looks like it was written by someone who learned C first. [pause] Spoiler: that someone is you. It is also me, twelve years ago. We can fix it.

[firm] Control flow in Python is a conversation, not a series of jumps. Other languages give you elevators — `goto`, exception-based control flow, switch statements with fall-through, sometimes recursion you don't want. Python gives you a staircase. You climb one step at a time, and the structure of the code matches the structure of the data.

[curious] When Python feels verbose to you, it is almost always because you wrote a *C-shaped* loop where Python wanted a *Python-shaped* loop. Today, two named moves. Move one — *for-each over for-i.* Move two — *the off-by-one is in the boundary, not the count.* And one trap.

[dry] Let's begin where you stopped writing readable code — the loop.

---

### Speech block 2 — *Mental model: the staircase, not the elevator*  *(target 1:20 – 3:40)*

[curious] Picture a staircase. Three steps, climbed in order. At each step, three things happen — *check the condition, do the work, move to the next item.* Then back to step one. You do not skip a step. There is no elevator. There is no goto.

[matter-of-fact] That is what *every* Python loop is. `for x in items` is a staircase across `items`. `while condition` is a staircase that keeps climbing as long as the condition is true. `if-elif-else` is a single step where you pick one of several side-doors before continuing.

[wry] Notice what is *missing* from this picture. There is no index. No counter. No off-by-one. No `i++`. No `i < length minus one`. No bounds-check at the bottom of the loop body. [pause] Python *removes* those, on purpose, because every one of them is a bug magnet.

[emphatic, slowly] If you are writing — *for i — equals zero — to length minus one* — you are writing a C loop in Python syntax. Every wrong number in that line is a production incident.

[firm] The Python idiom is to ask the *question* the data is asking. *For each item in this list, do this.* *For each customer with revenue over a threshold, send a thank-you.* *For each row in this CSV, validate it.* The shape of the loop *matches the shape of the question.* That match is the entire reason Python loops are short.

[switching to Hinglish, warm] Mumbai local mein har station pe ek hi sequence chalta hai — door khulta hai, log utarte hain, log chadte hain, door bandh hota hai, train chalti hai. Tu *for each station, do these 5 things* sochta hai — tu index nahi count karta. [pause] Python ka `for x in items` matlab same hi hai. Tu loop counter nahi sambhalta — Python sambhalta hai. Tu sirf yeh batata hai *kya karna hai*.

[returning to English, dry] Less ceremony, less off-by-one, less two-a.m. debugging. The local doesn't number its stations to you mid-journey, and Python shouldn't either.

<!-- EN-ONLY ALTERNATIVE
[dry] Every commuter knows: at each station, the same five things happen. You don't think 'station 1, station 2'; you think 'at each station, do this.' That's `for x in items`. Python handles the index; you just say what to do. Less ceremony, fewer off-by-ones, less two-a.m. debugging.
-->

---

### Speech block 3 — *Move 1: for-each over for-i*  *(target 3:40 – 6:50)*

[firm] First named move. *For-each over for-i.*

[matter-of-fact] The rule is short. Whenever you find your hand reaching for `for i in range of len of something`, stop. Erase. Write `for x in something` instead. Index-by-default is a code smell.

[curious] Three useful idioms replace nine out of ten C-style loops in Python.

[matter-of-fact] One — *direct iteration.* `for customer in customers`. You name the item, you act on the item, the loop counter is gone. The most common Python loop in the working world.

[matter-of-fact] Two — *enumerate.* When you genuinely need the index alongside the item, write `for i, customer in enumerate(customers)`. You get both. You did not have to construct `range`. You did not have to subscript. `enumerate` is one of those Python verbs you have to *meet* before you reach for it; meet it now.

[matter-of-fact] Three — *zip.* When you have two parallel lists, `for name, score in zip(names, scores)`. No indexes. No length checks. Both items at once. If the lists are different lengths, `zip` stops at the shorter one — usually what you want.

[wry] If your loop wants none of those — if you genuinely need positional control, like for a sliding window or a stride — you are in the *one-out-of-ten* case where indexes are appropriate. Almost every loop you've written has not been that case.

[emphatic, slowly] List comprehensions take this further. *A new list, where each element is the customer's name, for each customer in customers, where the customer is active.* That is one line of Python. Three lines of C. Six lines of Java. Ninety percent shorter, ninety percent fewer bugs, one hundred percent more readable to the next engineer.

[firm] Comprehensions earn their reputation when they stay short. Two clauses — a transformation and a filter — is the sweet spot. If you find yourself writing a comprehension with three nested clauses, three filters, and a side effect, [chuckles] that is a loop wearing a costume. Convert it back to a `for` loop and let the reader breathe.

[switching to Hinglish, warm] Hostel mess mein chapati count karta hai *"do, do, do, ek aur — yeh saat hain."* Tu sochta hai *"saat logon ke liye."* Match. [pause] Woh kabhi *"index zero se chhe tak chapati"* nahi bolta. Kyun? Kyunki bewakoof nahi hai. Indexing tabhi useful hai jab tujhe index ki zaroorat ho. Warna *for chapati in chapatis* — fast, simple, no off-by-one.

[returning to English, dry] The mess server doesn't index. Neither should you, by default.

<!-- EN-ONLY ALTERNATIVE
[dry] The dining-hall server doesn't count 'index zero to six chapatis.' They count chapatis. Use the iteration shape that matches the question. Indexes are a special case, not a default.
-->

---

### Speech block 4 — *Move 2: the off-by-one is in the boundary*  *(target 6:50 – 9:20)*

[firm] Second named move. *The off-by-one bug is in your boundary, not in your counting.*

[matter-of-fact] Pop quiz. You wrote `range of one to five`. How many numbers do you get? [pause] Four. One, two, three, four. The five is excluded.

[wry] Now you wrote `range of zero to five`. How many numbers? [pause] Five. Zero, one, two, three, four. The five is *still* excluded, but you started one earlier, so you got one more.

[emphatic, slowly] The rule is — *Python's `range` excludes the stop value, always.* `range of n` gives you zero through n-minus-one. `range of a, b` gives you a through b-minus-one.

[firm] Once that lives in your fingers, the entire bug class disappears. The vast majority of off-by-one bugs in Python aren't *counting* errors. They are *boundary* errors — you wrote `range(1, 5)` because you wanted five numbers, and you got four. The fix is to stop computing the boundary in your head and start asking *which range do I want, half-open or closed*, and writing the boundary that matches.

[matter-of-fact] Two related rules that earn their keep. One — slicing follows the same convention. `mylist of 0 colon 5` gives you the first five items, indices zero through four. The five is excluded, same as range. Two — when you write `for i in range of length of items`, you are *guaranteed* to be in-bounds — Python computed the boundary for you. The off-by-one risk shows up when you start subtracting and adding things to that range yourself.

[wry] My personal rule, after a decade of writing Python — *if I'm subtracting one inside a `range` argument, I'm probably writing a bug.* Pause. Re-derive. Often the answer was to use `enumerate` or slicing instead.

[firm] One more. The classic *fence-post* error. *I want to print numbers from 1 to 100.* That's `range of 1 to 101`. Not `range of 1 to 100`. The hundred is excluded. If you do not write 101, you stop at 99 and your invoices have the wrong total. [pause] You will catch yourself doing this once a quarter for the rest of your career. Add `+1` deliberately, every time. Don't trust your initial guess at the upper bound.

[switching to Hinglish, warm] Tu chai-walle ko bola *"paanch chai do."* Woh `range(5)` chala — zero, one, two, three, four. **Paanch chai mile.** Theek hai. Lekin tu ne `range(1, 5)` likha hota — one, two, three, four — sirf chaar chai milti. [pause] Bug counting mein nahi tha. Bug boundary mein tha.

[returning to English, dry] One number off in the boundary. One missing chai. Two-a.m. invoice rounding error in production. Same shape.

<!-- EN-ONLY ALTERNATIVE
[dry] Most off-by-one bugs aren't counting bugs; they're boundary bugs. Python's `range(start, stop)` excludes stop. Once that lives in your fingers, the entire bug class disappears.
-->

---

### Speech block 5 — *Try it and reflect*  *(target 9:20 – 11:00)*

[warm] Time to wire the moves into your hands.

[brisk] Three exercises. Five minutes total. Open a REPL.

[matter-of-fact] One. Take a list of ten product names. Print each one with its position number — but not zero-indexed; humans count from one. Two solutions. The C-style — `for i in range of length`. The Python-style — `for i, name in enumerate of products, start equals one`. Write both. Notice which one you'd want to read on a Friday at six p.m.

[matter-of-fact] Two. Take a list of customer revenues. Build a new list of just the customers above ten thousand. Two solutions. The C-style — empty list, `for` loop, append-if. The Python-style — list comprehension, one line. Time both in your head. Read both aloud. Decide which one, sincerely, the next engineer will understand faster.

[matter-of-fact] Three — the boundary check. Use `range` to print the integers from twenty through thirty, *inclusive of both ends.* Most people get this wrong on the first try. The answer is `range of 20 to 31`. Twenty-one numbers. The thirty-one is excluded; the thirty is the last value printed. If you wrote `range of 20 to 30`, you stopped at twenty-nine, and your dashboard is now wrong.

[firm] Five takeaways. [pause] One. `for x in items` is the default; `for i in range of len` is a code smell. Two. `enumerate` and `zip` cover most cases where you thought you needed indexes. Three. List comprehensions are loops with their ceremony stripped — use them when they stay readable, drop them when they don't. Four. `range(start, stop)` excludes stop; off-by-one bugs live in the boundary, not the counting. Five. If you are subtracting one inside a `range` argument, pause and re-derive — you are probably writing a bug.

[gentle] Reflection prompt. *Open the last Python file you wrote. How many of your loops use `range of len`? Convert one of them to `enumerate` and feel the line shrink.* [pause] That feeling is the lesson.

[warm] Lesson three is next. We move from loops to functions — signatures, defaults, scope, and the most common reason your Python function blows up with a name error you don't understand. [wry] The UnboundLocal trap is coming.
