import type { LessonBlocks } from "../../lib/content/blocks";

export interface PythonLessonDef {
  slug: string;
  title: string;
  subtitle: string;
  estimatedMinutes: number;
  skills: ("pythonBasics" | "pythonTypes" | "pythonControlFlow" | "pythonFunctions" | "pythonCollections" | "pythonProblemSolving")[];
  blocks: LessonBlocks;
}

export const pythonLessonDefs: PythonLessonDef[] = [
  // ───────────────── Lesson 1 ─────────────────
  {
    slug: "what-is-python",
    title: "What is Python, and why it's everywhere",
    subtitle: "The most-used general-purpose language — and the one that gets out of your way.",
    estimatedMinutes: 8,
    skills: ["pythonBasics"],
    blocks: [
      {
        type: "markdown",
        md: "Python is a general-purpose programming language designed in 1989 by Guido van Rossum, with a single philosophy: **code is read more often than it's written**. That choice — readability over cleverness — is why Python now sits behind data science, web backends, automation, AI, and a thousand other quiet things you use every day.",
      },
      {
        type: "callout",
        tone: "tip",
        title: "Mental model",
        md: "Python is the *English* of programming languages. It won't be the fastest. It won't be the strictest. But almost every problem has a Python answer, and almost every other engineer can read what you wrote.",
      },
      {
        type: "heading",
        level: 2,
        text: "Your first program",
      },
      {
        type: "markdown",
        md: "The simplest useful Python program is one line:",
      },
      {
        type: "code",
        lang: "python",
        code: `print("Hello, world.")`,
      },
      {
        type: "markdown",
        md: "Run that in any Python REPL or save it to `hello.py` and run `python hello.py`. The output is `Hello, world.`. No `main()` ceremony, no semicolons, no curly braces. The language is staying out of your way.",
      },
      {
        type: "heading",
        level: 2,
        text: "Variables: names that point at things",
      },
      {
        type: "markdown",
        md: "A variable in Python is a **name** bound to a **value**. The `=` sign is *assignment*, not equality.",
      },
      {
        type: "code",
        lang: "python",
        code: `name = "Ada"
age = 36
is_active = True

print(name, age, is_active)
# Ada 36 True`,
      },
      {
        type: "callout",
        tone: "info",
        title: "No type declarations",
        md: "Notice we never said `int age` or `str name`. Python figures out the type from the value. This is called **dynamic typing** — flexible during exploration, more responsibility at scale (we'll cover the trade-off in Lesson 2).",
      },
      {
        type: "heading",
        level: 2,
        text: "Comments and the `#`",
      },
      {
        type: "code",
        lang: "python",
        code: `# This whole line is a comment.
total = 100  # This part is a comment too.

# Use comments for the WHY, not the WHAT.
discount = total * 0.1  # 10% loyalty discount`,
      },
      {
        type: "quiz",
        prompt: "Which line throws an error?",
        multi: false,
        choices: [
          { id: "a", label: "`x = 5`", correct: false },
          { id: "b", label: "`x = \"hello\"`", correct: false },
          { id: "c", label: "`5 = x`", correct: true, explain: "Assignment goes right-to-left only. The left side must be a name." },
          { id: "d", label: "`x = True`", correct: false },
        ],
      },
      {
        type: "heading",
        level: 2,
        text: "The REPL is your best friend",
      },
      {
        type: "markdown",
        md: "Python has an interactive shell called the **REPL** (Read-Eval-Print Loop). Type `python` in your terminal — you get a `>>>` prompt where any expression is evaluated immediately. Use it constantly to check your assumptions.",
      },
      {
        type: "code",
        lang: "text",
        code: `>>> 2 + 2
4
>>> "hello".upper()
'HELLO'
>>> len([1, 2, 3])
3`,
      },
      {
        type: "tryIt",
        instruction: "Open your Python REPL (or run a file). Print your name and the year you started learning to code. Use a variable for each.",
        lang: "python",
        starter: `# your code here\n`,
        expected: `name = "Nadia"
started_year = 2023
print(name, started_year)`,
      },
      {
        type: "keyTakeaways",
        points: [
          "Python optimises for **readability**. That's the whole brand.",
          "Variables are names bound to values via `=`. No type declarations needed.",
          "Comments start with `#`. Use them for the *why*, not the *what*.",
          "The REPL is a free, instant way to test any expression.",
        ],
      },
      {
        type: "reflect",
        prompt: "What's a small task in your job or life you'd like Python to automate? Write it in one sentence — we'll come back to it in Lesson 6.",
      },
    ],
  },

  // ───────────────── Lesson 2 ─────────────────
  {
    slug: "python-types-and-the-mutable-trap",
    title: "Types, mutability, and the trap that catches every beginner",
    subtitle: "Why `a = b` doesn't always do what you think.",
    estimatedMinutes: 12,
    skills: ["pythonTypes"],
    blocks: [
      {
        type: "markdown",
        md: "Python has dynamic types — the **value** carries the type, not the variable. This is freeing for small scripts and a footgun at scale. Today we cover the four types you'll touch every day, and the one concept that explains 80% of beginner bugs: **mutability**.",
      },
      {
        type: "heading",
        level: 2,
        text: "The four types you'll see daily",
      },
      {
        type: "markdown",
        md: "| Type | Example | Mutable? |\n|---|---|---|\n| `int` | `42` | no (immutable) |\n| `float` | `3.14` | no |\n| `str` | `\"hello\"` | no |\n| `bool` | `True`, `False` | no |\n| `list` | `[1, 2, 3]` | **yes** |\n| `dict` | `{\"a\": 1}` | **yes** |\n| `tuple` | `(1, 2, 3)` | no |\n| `set` | `{1, 2, 3}` | yes |",
      },
      {
        type: "markdown",
        md: "Use `type(x)` to ask Python what something is, and `isinstance(x, int)` to check.",
      },
      {
        type: "code",
        lang: "python",
        code: `>>> type(42)
<class 'int'>
>>> type("hello")
<class 'str'>
>>> isinstance(42, int)
True`,
      },
      {
        type: "heading",
        level: 2,
        text: "Mutability — the one concept that explains every weird bug",
      },
      {
        type: "markdown",
        md: "**Immutable** means: once created, the value can never change. Numbers, strings, tuples are immutable.\n\n**Mutable** means: you can modify the value in place. Lists, dicts, sets are mutable.\n\nThis matters because of how Python handles **assignment**.",
      },
      {
        type: "code",
        lang: "python",
        code: `# IMMUTABLE — strings can't be modified in place
a = "hello"
b = a            # b also points at "hello"
b = b + " world" # b now points at a NEW string
print(a)         # "hello"   ← unchanged
print(b)         # "hello world"`,
      },
      {
        type: "code",
        lang: "python",
        code: `# MUTABLE — lists can be modified in place
a = [1, 2, 3]
b = a            # b ALSO POINTS AT THE SAME LIST
b.append(4)
print(a)         # [1, 2, 3, 4]   ← surprise!
print(b)         # [1, 2, 3, 4]`,
      },
      {
        type: "callout",
        tone: "warn",
        title: "The classic trap",
        md: "When you do `b = a` with a list, you didn't copy the list. Both names point at the **same** list. Modify it through one name, you see the change through the other.\n\nWhen this catches you, the fix is to copy explicitly: `b = a.copy()` or `b = list(a)` or `b = a[:]`.",
      },
      {
        type: "heading",
        level: 2,
        text: "Truthiness — what counts as `True` in an `if`?",
      },
      {
        type: "markdown",
        md: "Every value in Python has a *truthiness*. The following are all **falsy**:\n\n- `False`\n- `None`\n- `0`, `0.0`\n- `\"\"` (empty string)\n- `[]`, `{}`, `()` (empty containers)\n\nEverything else is truthy.",
      },
      {
        type: "code",
        lang: "python",
        code: `users = []

# Pythonic: rely on truthiness
if users:
    print(f"{len(users)} users")
else:
    print("no users yet")
# "no users yet"`,
      },
      {
        type: "callout",
        tone: "tip",
        md: "Don't write `if len(users) > 0:` — Python idiom is `if users:`. Empty list is falsy, full list is truthy. Reads better and is harder to get wrong.",
      },
      {
        type: "quiz",
        prompt: "After this code runs, what does `print(numbers)` show?\n\n```python\nnumbers = [1, 2, 3]\nbackup = numbers\nbackup.append(99)\n```",
        multi: false,
        choices: [
          { id: "a", label: "`[1, 2, 3]`", correct: false, explain: "`backup` and `numbers` are the same list. Modifying through one is seen through the other." },
          { id: "b", label: "`[1, 2, 3, 99]`", correct: true, explain: "Both names point at the same mutable list, so the append shows up in both." },
          { id: "c", label: "Error: can't append.", correct: false },
          { id: "d", label: "`None`", correct: false },
        ],
      },
      {
        type: "tryIt",
        instruction: "Make a *real* copy of the list so the original stays unchanged.",
        lang: "python",
        starter: `original = [1, 2, 3]
backup = original   # fix this line
backup.append(99)
print(original)     # should still be [1, 2, 3]`,
        expected: `original = [1, 2, 3]
backup = original.copy()    # or list(original) or original[:]
backup.append(99)
print(original)             # [1, 2, 3]`,
      },
      {
        type: "keyTakeaways",
        points: [
          "Values carry types in Python; variables don't.",
          "**Immutable** types (int, str, tuple) cannot change in place — assignment of a 'modified' value creates a new value.",
          "**Mutable** types (list, dict, set) can change in place — `b = a` shares the same object, so changes are visible through both names.",
          "Use truthiness (`if users:`) instead of `if len(users) > 0:`.",
          "When in doubt, copy explicitly: `.copy()`, `list(x)`, `dict(x)`, or `x[:]` for lists.",
        ],
      },
    ],
  },

  // ───────────────── Lesson 3 ─────────────────
  {
    slug: "python-control-flow",
    title: "Control flow: if, for, while",
    subtitle: "How a program decides what to do, and how it does it again.",
    estimatedMinutes: 13,
    skills: ["pythonControlFlow"],
    blocks: [
      {
        type: "markdown",
        md: "Three constructs unlock 90% of Python programs: `if` (decide), `for` (do it for each), `while` (do it until). Master these three and you can build real things.",
      },
      {
        type: "heading",
        level: 2,
        text: "if / elif / else",
      },
      {
        type: "code",
        lang: "python",
        code: `score = 87

if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"
elif score >= 70:
    grade = "C"
else:
    grade = "F"

print(grade)  # B`,
      },
      {
        type: "callout",
        tone: "warn",
        title: "Indentation is syntax",
        md: "Python uses indentation (4 spaces, by convention) to mark blocks. There are no curly braces. Mixing tabs and spaces will hurt you — pick one and stay with it. Most editors auto-fix this; let them.",
      },
      {
        type: "heading",
        level: 2,
        text: "for: do something for each item",
      },
      {
        type: "code",
        lang: "python",
        code: `names = ["Ada", "Grace", "Alan"]

for name in names:
    print(f"Hello, {name}.")

# Hello, Ada.
# Hello, Grace.
# Hello, Alan.`,
      },
      {
        type: "markdown",
        md: "The `f\"...\"` syntax is an **f-string** — Python interpolates anything inside `{...}` directly. Use it for almost all string formatting.",
      },
      {
        type: "heading",
        level: 2,
        text: "range() — for when you need a counter",
      },
      {
        type: "code",
        lang: "python",
        code: `# range(stop)        — 0 up to stop, exclusive
for i in range(5):
    print(i)
# 0, 1, 2, 3, 4

# range(start, stop)  — start to stop, exclusive
for i in range(2, 6):
    print(i)
# 2, 3, 4, 5

# range(start, stop, step)
for i in range(0, 10, 2):
    print(i)
# 0, 2, 4, 6, 8`,
      },
      {
        type: "callout",
        tone: "tip",
        title: "Python's range is exclusive on the right",
        md: "`range(5)` gives you `0, 1, 2, 3, 4` — five numbers. Not 0 to 5. This matches almost every other modern language and the math convention `[start, stop)`.",
      },
      {
        type: "heading",
        level: 2,
        text: "while: do until a condition flips",
      },
      {
        type: "code",
        lang: "python",
        code: `attempts = 0
password = "letmein"

while password != "correct horse":
    attempts += 1
    print(f"Try {attempts}…")
    password = input("Password: ")

print(f"In after {attempts} tries.")`,
      },
      {
        type: "callout",
        tone: "warn",
        title: "The infinite loop trap",
        md: "If your `while` condition never becomes false, you're stuck. When debugging, Ctrl+C is your friend. Use `while` only when you don't know how many iterations you need; reach for `for` first.",
      },
      {
        type: "heading",
        level: 2,
        text: "break and continue",
      },
      {
        type: "code",
        lang: "python",
        code: `# break — exit the loop entirely
for n in [1, 2, 3, 4, 5]:
    if n == 3:
        break
    print(n)
# 1, 2

# continue — skip to next iteration
for n in [1, 2, 3, 4, 5]:
    if n % 2 == 0:
        continue
    print(n)
# 1, 3, 5`,
      },
      {
        type: "sortableSteps",
        prompt: "Drag these steps into the order they execute when this code runs:\n\n```python\nfor n in [1, 2, 3]:\n    if n == 2:\n        continue\n    print(n)\n```",
        hint: "`continue` skips the rest of the body for that iteration.",
        items: [
          { id: "a", label: "n becomes 1", detail: "first iteration starts" },
          { id: "b", label: "print(1)", detail: "n is not 2, so we print" },
          { id: "c", label: "n becomes 2", detail: "second iteration" },
          { id: "d", label: "continue runs", detail: "skip the rest of the body" },
          { id: "e", label: "n becomes 3", detail: "third iteration" },
          { id: "f", label: "print(3)", detail: "n is not 2, so we print" },
        ],
      },
      {
        type: "tryIt",
        instruction: "Print every multiple of 3 between 1 and 30 (inclusive). Use `range` and a `for` loop.",
        lang: "python",
        expected: `for n in range(3, 31, 3):
    print(n)

# or, with a filter:
for n in range(1, 31):
    if n % 3 == 0:
        print(n)`,
      },
      {
        type: "keyTakeaways",
        points: [
          "Indentation defines blocks — pick spaces, stay consistent.",
          "`for x in iterable:` works on any sequence — list, string, range, file.",
          "`range(stop)` is exclusive of `stop` — `range(5)` is 0..4, five numbers.",
          "Reach for `for` first; `while` only when the iteration count is unknown.",
          "`break` exits, `continue` skips to the next iteration.",
        ],
      },
    ],
  },

  // ───────────────── Lesson 4 ─────────────────
  {
    slug: "python-functions",
    title: "Functions: the unit of thought",
    subtitle: "Why every script over 30 lines should be made of named pieces.",
    estimatedMinutes: 13,
    skills: ["pythonFunctions"],
    blocks: [
      {
        type: "markdown",
        md: "A function is a **named piece of behavior**. Once you have it, you can use it without remembering how it works. That's the whole game of programming at scale: build little pieces with simple names, then compose them.",
      },
      {
        type: "code",
        lang: "python",
        code: `def greet(name):
    return f"Hello, {name}."

print(greet("Ada"))
# Hello, Ada.`,
      },
      {
        type: "markdown",
        md: "Anatomy:\n- `def` declares a function.\n- `greet` is the name.\n- `(name)` is the **parameter list** — names for the inputs.\n- The indented body runs when the function is called.\n- `return` produces the output. A function with no `return` returns `None`.",
      },
      {
        type: "heading",
        level: 2,
        text: "Default arguments",
      },
      {
        type: "code",
        lang: "python",
        code: `def greet(name, greeting="Hello"):
    return f"{greeting}, {name}."

greet("Ada")              # "Hello, Ada."
greet("Ada", "Hi")        # "Hi, Ada."
greet("Ada", greeting="हेलो")  # keyword argument
# "हेलो, Ada."`,
      },
      {
        type: "callout",
        tone: "warn",
        title: "The mutable default argument trap",
        md: "**Never** use a mutable value (`[]`, `{}`, `set()`) as a default argument. It's evaluated **once**, at function definition time, and shared across every call. This is the most-debated Python wart.",
      },
      {
        type: "code",
        lang: "python",
        code: `# DO NOT DO THIS
def add_item(item, items=[]):
    items.append(item)
    return items

print(add_item("apple"))   # ["apple"]
print(add_item("banana"))  # ["apple", "banana"]   ← !
print(add_item("cherry"))  # ["apple", "banana", "cherry"]   ← !!`,
      },
      {
        type: "code",
        lang: "python",
        code: `# DO THIS
def add_item(item, items=None):
    if items is None:
        items = []
    items.append(item)
    return items

print(add_item("apple"))   # ["apple"]
print(add_item("banana"))  # ["banana"]   ← fresh list each call`,
      },
      {
        type: "heading",
        level: 2,
        text: "Scope: where names live",
      },
      {
        type: "markdown",
        md: "Names defined inside a function are **local** to that function. Names defined at module level are **global**. A function can read globals, but assigning to a name creates a new local unless you say otherwise.",
      },
      {
        type: "code",
        lang: "python",
        code: `count = 0   # global

def increment():
    count = count + 1   # ← UnboundLocalError

increment()`,
      },
      {
        type: "markdown",
        md: "Why? On the left side, Python sees you're assigning to `count`, so it makes `count` a local. On the right, you read `count` before assigning — error.\n\nFor real programs you almost never need to mutate globals — pass values as parameters, return new values.",
      },
      {
        type: "heading",
        level: 2,
        text: "Type hints (optional but worth it)",
      },
      {
        type: "code",
        lang: "python",
        code: `def total_revenue(orders: list[float], discount: float = 0.0) -> float:
    return sum(orders) * (1 - discount)`,
      },
      {
        type: "markdown",
        md: "Type hints don't enforce anything at runtime — but they make your code self-documenting and let tools (mypy, pyright, your IDE) catch bugs. **Use them.**",
      },
      {
        type: "quiz",
        prompt: "What does this print?\n\n```python\ndef double(x):\n    x = x * 2\n    return x\n\nn = 5\ndouble(n)\nprint(n)\n```",
        multi: false,
        choices: [
          { id: "a", label: "`5`", correct: true, explain: "Inside `double`, `x` is a local name. Reassigning `x` doesn't change `n` outside. We never used the return value either." },
          { id: "b", label: "`10`", correct: false, explain: "We didn't assign the return value back to `n`." },
          { id: "c", label: "`None`", correct: false },
          { id: "d", label: "Error", correct: false },
        ],
      },
      {
        type: "tryIt",
        instruction: "Write a function `top_n(values, n=3)` that returns the top n largest values from a list, in descending order. Default n is 3.",
        lang: "python",
        expected: `def top_n(values, n=3):
    return sorted(values, reverse=True)[:n]

print(top_n([5, 2, 9, 1, 7, 3]))      # [9, 7, 5]
print(top_n([5, 2, 9, 1, 7, 3], n=2))  # [9, 7]`,
      },
      {
        type: "keyTakeaways",
        points: [
          "Functions are named, reusable pieces of behavior. Compose your program out of them.",
          "Use **keyword arguments** at the call site for clarity (`greet(name=\"Ada\")`).",
          "**Never use a mutable default argument** — use `None` and check.",
          "Local names shadow globals; pass values as parameters and return new values.",
          "Add **type hints** even though Python won't enforce them — your tools and your future self will thank you.",
        ],
      },
    ],
  },

  // ───────────────── Lesson 5 ─────────────────
  {
    slug: "python-collections",
    title: "Lists, dicts, and the pythonic way",
    subtitle: "The four containers you'll use 95% of the time, and how to pick the right one.",
    estimatedMinutes: 13,
    skills: ["pythonCollections"],
    blocks: [
      {
        type: "markdown",
        md: "The single most common question after \"how do I write an `if`?\" is **\"which container should I use?\"**. There are four answers in Python: list, tuple, dict, set. Here's how to pick.",
      },
      {
        type: "animatedTimeline",
        title: "Pick the right container",
        steps: [
          {
            label: "Need an ordered sequence you can change?",
            body: "Use a **list**. `[1, 2, 3]`. The default answer for most collections.",
            code: "scores = [88, 92, 71]\nscores.append(95)",
          },
          {
            label: "Need an ordered sequence that should never change?",
            body: "Use a **tuple**. `(1, 2, 3)`. Fixed-length, hashable. Good for coordinates, return groups, dict keys.",
            code: "point = (10, 20)\nx, y = point  # tuple unpacking",
          },
          {
            label: "Need to look up by name/key?",
            body: "Use a **dict**. `{\"name\": \"Ada\"}`. The workhorse — JSON, configs, lookup tables.",
            code: "person = {\"name\": \"Ada\", \"city\": \"London\"}\nperson[\"name\"]  # 'Ada'",
          },
          {
            label: "Need uniqueness or fast \"is x in here?\" checks?",
            body: "Use a **set**. `{1, 2, 3}`. No duplicates, O(1) membership tests.",
            code: "tags = {\"sql\", \"data\", \"sql\"}\n# {'sql', 'data'} — duplicates removed",
          },
        ],
      },
      {
        type: "heading",
        level: 2,
        text: "Lists: the everyday container",
      },
      {
        type: "code",
        lang: "python",
        code: `nums = [1, 2, 3, 4, 5]

nums[0]      # 1     — index from 0
nums[-1]     # 5     — negative indexes from the end
nums[1:4]    # [2, 3, 4]   — slice
len(nums)    # 5
3 in nums    # True
nums.append(6)         # add to the end
nums.remove(3)         # remove first occurrence of 3
nums.sort()            # in place
sorted(nums, reverse=True)  # returns a new sorted list`,
      },
      {
        type: "heading",
        level: 2,
        text: "Dicts: where most real work happens",
      },
      {
        type: "code",
        lang: "python",
        code: `customer = {
    "name": "Ada Lovelace",
    "city": "London",
    "plan": "pro",
}

customer["name"]              # 'Ada Lovelace'
customer.get("phone")         # None — no KeyError
customer.get("phone", "—")    # '—' — default

# Iterate
for key, value in customer.items():
    print(key, "=", value)

# Add / update
customer["plan"] = "enterprise"`,
      },
      {
        type: "callout",
        tone: "tip",
        title: ".get() vs []",
        md: "`d[\"key\"]` raises `KeyError` if the key is missing. `d.get(\"key\")` returns `None`. `d.get(\"key\", default)` returns `default`. Use `.get` whenever the key might not be there.",
      },
      {
        type: "heading",
        level: 2,
        text: "Comprehensions — the pythonic move",
      },
      {
        type: "markdown",
        md: "A comprehension is a one-line way to build a list/dict/set from another. Once it clicks you'll write them in your sleep.",
      },
      {
        type: "code",
        lang: "python",
        code: `# Build a new list from each item
nums = [1, 2, 3, 4, 5]
squared = [n * n for n in nums]
# [1, 4, 9, 16, 25]

# With a filter
evens = [n for n in nums if n % 2 == 0]
# [2, 4]

# Dict comprehension
prices = {"apple": 50, "bread": 30, "cheese": 200}
expensive = {k: v for k, v in prices.items() if v > 40}
# {'apple': 50, 'cheese': 200}

# Set comprehension
words = ["sql", "data", "sql", "joins"]
unique = {w for w in words}
# {'sql', 'data', 'joins'}`,
      },
      {
        type: "callout",
        tone: "warn",
        title: "Don't nest more than 2 levels",
        md: "Comprehensions are great for one transform + optional filter. Two-level nesting is the line where they become unreadable. If you're tempted to write a 3-level comprehension, write a `for` loop instead — your future self will thank you.",
      },
      {
        type: "heading",
        level: 2,
        text: "When in doubt: collections.Counter",
      },
      {
        type: "code",
        lang: "python",
        code: `from collections import Counter

words = "the quick brown fox jumps over the lazy dog the fox".split()
counts = Counter(words)
print(counts.most_common(3))
# [('the', 3), ('fox', 2), ('quick', 1)]`,
      },
      {
        type: "markdown",
        md: "`Counter` is a dict that knows how to count. The standard library is full of these — `defaultdict`, `deque`, `OrderedDict`. Read `collections` once and you'll skip a lot of reinvention.",
      },
      {
        type: "quiz",
        prompt: "Which of these is the most pythonic way to get the unique cities from a list of customer dicts?",
        multi: false,
        choices: [
          { id: "a", label: "`unique = []\\nfor c in customers:\\n    if c[\"city\"] not in unique:\\n        unique.append(c[\"city\"])`", correct: false, explain: "Works, but verbose. Sets exist for exactly this." },
          { id: "b", label: "`unique = {c[\"city\"] for c in customers}`", correct: true, explain: "A set comprehension — concise, clear intent, deduplicates automatically." },
          { id: "c", label: "`unique = list(set([c[\"city\"] for c in customers]))`", correct: false, explain: "Works, but you build a list just to throw it away. Set comprehension is cleaner." },
          { id: "d", label: "`unique = customers.distinct(\"city\")`", correct: false, explain: "That's not a Python list method — you're thinking of SQL." },
        ],
      },
      {
        type: "tryIt",
        instruction: "Given a list of orders, return a dict of `{customer_id: total_spent}`. Use a normal `for` loop or a comprehension — your choice.",
        lang: "python",
        starter: `orders = [
    {"customer_id": 1, "total": 25},
    {"customer_id": 2, "total": 18},
    {"customer_id": 1, "total": 12},
    {"customer_id": 3, "total": 50},
]

# your code here`,
        expected: `from collections import defaultdict

totals = defaultdict(float)
for o in orders:
    totals[o["customer_id"]] += o["total"]

print(dict(totals))
# {1: 37, 2: 18, 3: 50}`,
      },
      {
        type: "keyTakeaways",
        points: [
          "**list** = ordered, mutable. Default choice.",
          "**tuple** = ordered, immutable. Coordinates, fixed records, dict keys.",
          "**dict** = lookup by key. Most real work happens here.",
          "**set** = unique items + fast `x in s` checks.",
          "Comprehensions are the pythonic one-liner for transform + filter.",
          "When you need to count or default, `from collections import Counter, defaultdict`.",
        ],
      },
    ],
  },

  // ───────────────── Lesson 6 ─────────────────
  {
    slug: "python-putting-it-together",
    title: "Putting it together: build a CSV analyzer",
    subtitle: "Turn the building blocks into a real, useful script.",
    estimatedMinutes: 12,
    skills: ["pythonProblemSolving", "pythonCollections", "pythonFunctions"],
    blocks: [
      {
        type: "markdown",
        md: "You know the parts. Now let's build something real: a script that reads a CSV file of orders and answers business questions. Same shape as you'd write at work — a fistful of small functions, each named for what it does.",
      },
      {
        type: "heading",
        level: 2,
        text: "The data",
      },
      {
        type: "code",
        lang: "text",
        code: `# orders.csv
order_id,customer,city,total,status
101,Ada,London,2500,paid
102,Ada,London,1800,paid
103,Grace,New York,900,refunded
104,Alan,London,4200,paid
105,Margaret,Mumbai,1500,paid
106,Linus,Mumbai,3000,paid
107,Hedy,Mumbai,2200,refunded`,
      },
      {
        type: "heading",
        level: 2,
        text: "Step 1: Read the file",
      },
      {
        type: "code",
        lang: "python",
        code: `import csv

def load_orders(path: str) -> list[dict]:
    """Read a CSV file and return a list of order dicts."""
    with open(path) as f:
        reader = csv.DictReader(f)
        return [
            {**row, "total": int(row["total"])}  # cast price to int
            for row in reader
        ]`,
      },
      {
        type: "callout",
        tone: "tip",
        title: "csv.DictReader",
        md: "The first row of the CSV becomes the keys. Every subsequent row becomes a dict. Saves you writing column-name-to-index code.",
      },
      {
        type: "heading",
        level: 2,
        text: "Step 2: One function per question",
      },
      {
        type: "code",
        lang: "python",
        code: `from collections import defaultdict

def total_paid_revenue(orders: list[dict]) -> int:
    """Sum totals of orders with status 'paid'."""
    return sum(o["total"] for o in orders if o["status"] == "paid")


def revenue_by_city(orders: list[dict]) -> dict[str, int]:
    """{city -> total paid revenue from that city}."""
    totals = defaultdict(int)
    for o in orders:
        if o["status"] == "paid":
            totals[o["city"]] += o["total"]
    return dict(totals)


def top_customers(orders: list[dict], n: int = 3) -> list[tuple[str, int]]:
    """Top n customers by paid revenue, descending."""
    totals = defaultdict(int)
    for o in orders:
        if o["status"] == "paid":
            totals[o["customer"]] += o["total"]
    return sorted(totals.items(), key=lambda kv: kv[1], reverse=True)[:n]`,
      },
      {
        type: "callout",
        tone: "tip",
        title: "lambda is just a function",
        md: "`lambda kv: kv[1]` is a tiny anonymous function that takes one argument `kv` and returns `kv[1]`. We use it as a sort key. For anything more than one expression, write a real `def`.",
      },
      {
        type: "heading",
        level: 2,
        text: "Step 3: Wire it together",
      },
      {
        type: "code",
        lang: "python",
        code: `def main():
    orders = load_orders("orders.csv")

    print(f"Total paid revenue: \${total_paid_revenue(orders):,}")
    print()
    print("Revenue by city:")
    for city, total in revenue_by_city(orders).items():
        print(f"  {city}: \${total:,}")
    print()
    print("Top customers:")
    for name, total in top_customers(orders):
        print(f"  {name}: \${total:,}")


if __name__ == "__main__":
    main()`,
      },
      {
        type: "callout",
        tone: "info",
        title: "What is `if __name__ == \"__main__\":`?",
        md: "It's the line that says \"only run `main()` if this file was executed directly, not imported by another module.\" Standard Python idiom — put it on every script.",
      },
      {
        type: "heading",
        level: 2,
        text: "Run it",
      },
      {
        type: "code",
        lang: "text",
        code: `$ python orders.py
Total paid revenue: $15,200

Revenue by city:
  London: $8,500
  Mumbai: $4,500

Top customers:
  Alan: $4,200
  Linus: $3,000
  Ada: $4,300`,
      },
      {
        type: "heading",
        level: 2,
        text: "The shape of every script you'll write",
      },
      {
        type: "animatedTimeline",
        steps: [
          { label: "Read input", body: "Load data from a file, an API, or stdin. Cast types early." },
          { label: "One function per question", body: "Each question gets a small named function. Test them in isolation." },
          { label: "Compose in main()", body: "`main` is just orchestration — call the functions, format output." },
          { label: "`if __name__ == \"__main__\":`", body: "So your file works as both a script and an importable module." },
        ],
      },
      {
        type: "tryIt",
        instruction: "Add a `refund_rate(orders)` function that returns the percentage of orders with status='refunded' (rounded to 1 decimal place). Wire it into `main()` to print it.",
        lang: "python",
        expected: `def refund_rate(orders: list[dict]) -> float:
    refunded = sum(1 for o in orders if o["status"] == "refunded")
    return round(refunded / len(orders) * 100, 1)

# In main():
print(f"Refund rate: {refund_rate(orders)}%")`,
      },
      {
        type: "keyTakeaways",
        points: [
          "Real Python is mostly: read input → call small named functions → format output.",
          "Use `csv.DictReader` for CSV. Cast types early after reading.",
          "`defaultdict(int)` is the cleanest way to build a count/sum-by-key.",
          "`if __name__ == \"__main__\":` makes a file usable as both script and module.",
          "Compose. Don't nest. Each question its own function.",
        ],
      },
      {
        type: "reflect",
        prompt: "Remember the task you wrote in Lesson 1's reflection? Sketch which functions you'd need to automate it. What's the input? What's the output? What's the smallest function you could write today?",
      },
    ],
  },
];
