# Lesson 5 — Putting It Together: A Real Mini-Project

**Target duration:** ~11:00
**Chapter marks (sec):** 0 / 80 / 220 / 410 / 560

---

## SCENE

The same Bengaluru classroom, almost night. The whiteboard now has a four-stage pipeline drawn left to right — *Read, Transform, Summarize, Write* — with two small bug icons under the read and write boxes and a label beneath them: *eighty percent of bugs live here.* The lecturer has the energy of someone wrapping up a course they enjoyed teaching, and is genuinely interested in whether the listener will go home and write the pipeline tonight. Speaks with a calm Indian-English accent.

## SAMPLE CONTEXT

The listener has finished four lessons. Their previous takeaway, as the lecturer reminds them, was: *"Container choice is a complexity decision; lists, dicts, sets, and tuples each answer a different question fast."* They are about to build the most common Python program in the working world — a CSV-to-JSON pipeline — and to learn that the discipline of *validating at the boundary, trusting the middle* is what separates a script from a system. Indian-English accent throughout — same lecturer.

## SPEAKER 1

**Recommended voice (true Indian accent):**
- Google Cloud TTS — `en-IN-Chirp3-HD-Charon` *(default)*
- Azure — `en-IN-PrabhatNeural`
- ElevenLabs — *Niraj (Indian English Male)*

**Fallback in Gemini Composer:** Charon *(Informative)* with `[Indian-English accent, calm Bengaluru lecturer tone]` prepended to the first speech block.

**Temperature:** `0.85`

---

### Speech block 1 — *Opening: the four-lesson payoff*  *(target 0:00 – 1:20)*

[Indian-English accent, calm Bengaluru lecturer tone] [matter-of-fact] Lesson four takeaway, repeated for free — *container choice is a complexity decision; list, dict, set, tuple each answer a different question fast.* If you cannot, in five seconds, name which container you'd reach for to answer *"have I seen this user-id before"* — go back. We will wait.

[wry] Today is the lesson where four small lessons cash in. We are going to build the most common Python program in the working world — *read a messy CSV, transform the rows, summarize, write JSON.* Every working data engineer ships some version of this every week. Every junior backend developer ships it twice a quarter. Every analytics intern is one bad CSV away from it.

[firm] It is also the program where every named trap in this course shows up in one form or another. Stickers and aliases. Off-by-one boundaries. Mutable defaults. UnboundLocalError. Wrong container. *All of them.* In one program.

[curious] Today, two named moves. Move one — *read and validate at the boundary.* Move two — *debugging discipline, which means reading the traceback.* And one strong rule about error handling that you will hear me say twice.

[emphatic, slowly] The strong rule — *bad data found at the boundary should fail loudly, not be silently mutilated.* If you remember nothing else from this course, remember that one. Let's begin.

---

### Speech block 2 — *Mental model: read, transform, summarize, write*  *(target 1:20 – 3:40)*

[curious] Picture a four-stage assembly line, left to right. Stage one — *read.* You open the CSV, you parse it, you get a list of dicts. Stage two — *transform.* You filter rows, you rename columns, you parse dates, you normalize formats. Stage three — *summarize.* You group, you count, you sum, you take the top N. Stage four — *write.* You serialize the result to JSON and drop it into a file.

[matter-of-fact] Every data-handling Python program is some version of this pipeline. The shape is the same. What changes is the size of the data and the shape of the questions.

[firm] Now the insight. *Eighty percent of your bugs live at the boundaries.* Stage one and stage four. Reading the malformed CSV. Writing the JSON the next program can't parse. Encoding mistakes. Quote-escaping errors. Date formats. Numeric overflow. The middle two stages — transform and summarize — almost never fail mysteriously, because by the time the data gets there, it has been validated.

[emphatic, slowly] Validate at the boundary. Trust the middle. That is the entire debugging discipline of this lesson, written in seven words.

[wry] Most beginners do the opposite. They read the CSV with no validation, they sprinkle defensive `if value is not None` checks throughout the transform stage, they add a `try-except` around the summarize, and then they ship a brittle pipeline that works for one input file and breaks for the next. The defensive checks didn't help — the bug was upstream, in the read stage that swallowed bad data.

[switching to Hinglish, warm] Indian CA ka kaam — exact same pipeline. Bills aatey hain — handwritten, photocopied, kuch mein date 12 slash 3 slash 24, kuch mein 12 dash 3 dash 2024. Transform — har bill ko proper format mein convert. Summarize — ledger total, GST split. Output — clean return file Income Tax department ke liye. [pause] CA bhi 80% time bills ka format normalize karne mein lagata hai. Logic 20% hai. Programming bhi same hai. Boundaries pe sab kuch verify kar.

[returning to English, dry] Same pipeline. Different runtime. Same eighty-twenty split.

<!-- EN-ONLY ALTERNATIVE
[dry] An accountant's workflow is the same four stages — receive (messy bills), transform (normalize dates, line-items), summarize (totals, splits), write (clean return). They spend eighty percent of their time on boundaries too. Same pipeline, different runtime.
-->

---

### Speech block 3 — *Move 1: read and validate at the boundary*  *(target 3:40 – 6:50)*

[firm] First named move. *Read and validate at the boundary.*

[matter-of-fact] When you open the CSV, you do four things, in order. One — open it with the right encoding. Two — parse it with `csv dot DictReader` so each row is a dict, keyed by the header. Three — *validate the schema*. Check that the columns you expect actually exist. Fail loudly if they don't. Four — *coerce the types*. The CSV gave you strings. You want integers, floats, dates. Convert them, and *fail loudly* if a row can't be coerced.

[matter-of-fact] Encoding first. CSVs from Indian financial systems show up as UTF-8 most of the time, sometimes Windows-1252, occasionally something obscure depending on which export button someone clicked. Run `file dash i path-to-csv` from your shell to find out. Open the file with `encoding equals` whatever the file says. Don't guess.

[firm] Now the strong rule. *Never write* `errors equals ignore` *when opening a file.* I will repeat that — never write `errors equals ignore`. It silently drops bytes that don't decode. The rupee sign disappears. The word *café* becomes *caf.* The customer name with a Hindi diacritic becomes a corrupted string nobody can match later. You don't know what you've lost. The bug is invisible. The pipeline runs to completion. The data is wrong.

[emphatic, slowly] Bad data found at the boundary should fail loudly. Not be silently mutilated.

[wry] If you genuinely cannot decode the file, find out *what* encoding it actually is — `chardet` is a one-line library that does it for you. Decode correctly. The fix takes thirty seconds. The lesson saves your career.

[matter-of-fact] Schema validation. After parsing, your first move is to inspect the keys of the first row. Compare them to the columns you expect. If a column is missing, raise a clear exception with the file path and the missing column name. Future-you, looking at the log, should know exactly what was wrong without re-running anything.

[matter-of-fact] Type coercion. Wrap each row in a small validation function — `parse_row of raw_row` returns a clean dict with proper types. Inside, you do — *integer of raw_row of order_id; float of raw_row of amount; datetime dot strptime of raw_row of date with the correct format string.* Each of those calls can fail. When they fail, you get a clear `ValueError` with the row number — and you know which row was bad before the pipeline ever touched it.

[firm] One useful pattern. Wrap the whole read stage in a function that returns a tuple of *valid rows* and *invalid rows.* Don't drop the invalid ones silently — return them to the caller, log them, write them to a quarantine file. The caller decides whether to fail the pipeline, skip them, or alert someone. *Never silently drop data.*

[wry] *"This is so much code,"* says every beginner. Yes. It is also the code that, once written, makes the rest of your pipeline easy to write. The middle stages now operate on *clean, typed dicts.* No defensive checks. No `if value is None` everywhere. The boundary did the work. The middle gets to be simple.

---

### Speech block 4 — *Move 2: debugging discipline (read the traceback)*  *(target 6:50 – 9:20)*

[firm] Second named move. *Debugging discipline, which starts with reading the traceback.*

[matter-of-fact] Python tracebacks look intimidating to beginners and trivial to experienced developers. The difference is one habit — *experienced developers read the traceback bottom-up.*

[curious] A traceback is a stack of frames. Each frame says — *here's the file, here's the line, here's what was being called.* Read top-down, you see the entry point first, the actual error last. Read bottom-up, you see the actual error *first* — and that is almost always the line that needs fixing.

[matter-of-fact] The bottom of every traceback has two things. *The error type* — `ValueError`, `KeyError`, `TypeError`, `AttributeError`. *The error message.* Read both. The error type tells you what kind of bug. The message tells you the specific value or key. Together, they almost always point at the line that needs the fix — *if* you also look at the bottom-most line of the stack frames, which is the actual line of your code that raised.

[wry] Beginners do the opposite. They see a traceback, panic, scroll to the top, see something about pandas or csv module, and conclude *"the library is broken."* The library is almost never broken. The bug is in your code, in the bottom-most frame whose file path looks like yours, with the value the error message named.

[firm] Three error types and what each one usually means. *KeyError* — you tried to access a dict key that doesn't exist. The fix is almost always *validate the schema at the boundary.* *ValueError* — you tried to coerce a string into a number or date and the string was malformed. The fix is *catch the bad row at the parse stage and quarantine it.* *TypeError* — you tried to do something with a value that doesn't support it; usually you assumed something was an int and it was None. The fix is *don't return None silently from your functions.*

[matter-of-fact] One named tool. *pdb*, the Python debugger. Add the line `import pdb; pdb dot set_trace` at the line where things start to go wrong. Run the program. You drop into an interactive prompt at exactly that line, with all variables in scope. You can print, step, inspect, exit. It is a five-minute investment to learn and a permanent rebate.

[matter-of-fact] One named anti-pattern. *Don't paste the traceback into ChatGPT before reading it yourself.* You will get a confident answer that may or may not be correct. Read the bottom four lines first. Form a hypothesis. *Then* — if you're stuck — search or ask. The hypothesis-first habit is what makes you a debugger instead of a guesser.

[switching to Hinglish, warm] Naani achaar banaate samay sabse zyada time *kachhe maal ki sorting* mein lagaati thi. Khraab nimbu, daag wala mango — alag. *Boundary check.* Mix-masala mein touch nahi karti gandi cheez. Achaar 6 mahine chalta hai bina koi bug ke. [pause] Tu ne yahi sikha aaj — boundary pe rigorous ho, middle pe relaxed. Naani ka recipe `errors equals ignore` nahi tha.

[returning to English, dry] Naani's pickles last six months because she sorts ruthlessly at the boundary — bad ingredients are removed before they touch the spice mix. The middle stages don't need defensive measures. The boundary did the work.

<!-- EN-ONLY ALTERNATIVE
[dry] Pickle-makers last six months because they sort ruthlessly at the boundary — bad ingredients are removed before they touch the spice mix. The middle stages don't need defensive measures because the boundary did the work. Same with code.
-->

---

### Speech block 5 — *Try it, reflect, and where you go from here*  *(target 9:20 – 11:00)*

[warm] Time for the real exercise. Not a REPL drill. A small project.

[brisk] Build the pipeline tonight. One sitting. Ninety minutes max.

[matter-of-fact] Get any CSV — your bank statement, a scraped dataset, a sample from Kaggle, the orders.csv file in the lesson resources. Write four functions. One — `read_orders` of path returns a tuple of valid rows and invalid rows. Two — `transform_orders` of valid rows returns a list of clean dicts with the columns you actually care about. Three — `summarize` of clean rows returns a small dict with the metrics you want — top five customers by revenue, total orders, average order value. Four — `write_summary` of summary, path writes the result as JSON.

[matter-of-fact] Constraints. Type-hint every function. No mutable defaults. No global state. Validate the schema in `read_orders` and fail loudly if columns are missing. Quarantine bad rows; do not silently drop. Use `csv dot DictReader` for reading; use `json dot dumps` with `indent equals two` for writing. Write at least one assertion at the boundary between transform and summarize that says *"by this point, every row has the right shape."* Watch what happens the first time it fails.

[wry] When something breaks — and it will — read the bottom of the traceback first. Form a hypothesis. *Then* fix.

[firm] Five takeaways for the lesson, then five for the course. [pause] Lesson takeaways. One. Every data pipeline is read, transform, summarize, write — eighty percent of bugs live at the boundaries. Two. Validate at the boundary; trust the middle. Three. Never write `errors equals ignore` when opening a file — bad data should fail loudly, not be silently mutilated. Four. Read tracebacks bottom-up; the error type and message at the bottom point at the bug. Five. Build it tonight in ninety minutes — the project is the lesson, not the words.

[gentle] And the five for the course. One. Names are stickers, not boxes; `=` aliases, never copies. Two. `for x in items` is the default; off-by-ones live in the boundary, not the count. Three. The signature is a contract — type-hint inputs and outputs in code that lasts past Friday. Four. Container choice is a complexity decision; list, dict, set, tuple each answer a different question fast. Five. Validate at the boundary, trust the middle, read tracebacks bottom-up.

[warm] You walked in copy-pasting from Stack Overflow. You are walking out with a vocabulary — *stickers, aliases, mutable defaults, signature-as-contract, access-pattern-driven container choice, the four-stage pipeline, the boundary discipline.* That vocabulary is the foundation. From here, frameworks — Django, FastAPI, pandas, polars — are specialized vocabularies on top of the same base.

[wry] Go build the pipeline. Send me the JSON when it's done. [pause] Or, more usefully — send the *quarantine file*, with the rows that failed. That's the file that proves you wrote a real pipeline, not a script. [chuckles] Welcome to working Python.
