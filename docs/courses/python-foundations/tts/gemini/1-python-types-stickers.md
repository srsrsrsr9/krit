# Lesson 1 — Variables Are Stickers, Not Boxes

**Target duration:** ~11:00
**Chapter marks (sec):** 0 / 80 / 220 / 410 / 560

---

## SCENE

A Bengaluru engineering classroom in the late afternoon. Whiteboard behind the lecturer is half-full of scribbled boxes and arrows. The lecturer — mid-thirties, dry, slightly amused — stands holding a small printed sticker between two fingers. They have shipped enough Python to be unimpressed by clever one-liners and amused by their own. Speaks with a calm Indian-English accent, Bengaluru product-manager-telling-a-story-over-chai energy.

## SAMPLE CONTEXT

The listener has decided to take Python seriously. Maybe they've copy-pasted from Stack Overflow for two years. Maybe they wrote a script last week that mutated production data and they don't quite know how. They are about to learn that the bug is in their *mental model of `=`*, not in their fingers. Indian-English accent throughout — a senior engineer who teaches well and refuses to make Python sound mystical.

## SPEAKER 1

**Recommended voice (true Indian accent):**
- Google Cloud TTS — `en-IN-Chirp3-HD-Charon` *(default)*
- Azure — `en-IN-PrabhatNeural`
- ElevenLabs — *Niraj (Indian English Male)*

**Fallback in Gemini Composer:** Charon *(Informative)* with `[Indian-English accent, calm Bengaluru lecturer tone]` prepended to the first speech block.

**Temperature:** `0.85`

---

### Speech block 1 — *Opening: why your variable bug isn't what you think*  *(target 0:00 – 1:20)*

[Indian-English accent, calm Bengaluru lecturer tone] [dry] Welcome to Python. Or — if you have been writing Python for two years already — welcome to *actually* writing Python.

[matter-of-fact] You have come here to learn a programming language. You will instead, in the next eleven minutes, fix a bug you didn't know you had. The bug is in your head, not your terminal. [pause] It is also responsible for roughly thirty percent of every real Python bug you'll ever ship.

[wry] The bug has a name. The name is, *"I think `=` copies things."*

[firm] It does not.

[curious] Other languages — C, Java, Go — taught you that variables are *boxes.* You declare a box, you put a value inside, you copy the value into another box, life makes sense. Python is not that language. Python *looks* like that language and Python deliberately *does not* behave like that language.

[emphatic, slowly] In Python — names — are stickers. They peel off. They stick onto things. The thing they stick onto exists once. Two stickers, one thing. [pause] If you mutate the thing through one sticker, the other sticker is also pointing at the mutation. Because — there is only one thing.

[dry] If that sentence felt obvious, congratulations, you've already been bitten. If it felt confusing, also congratulations — you're about to stop getting bitten. Either way, this is the whole lesson. Two moves and one trap. Let's start.

---

### Speech block 2 — *Mental model: stickers, not boxes*  *(target 1:20 – 3:40)*

[curious] Picture a small paper bag with three apples in it. The bag, in your imagination, has the address `0x7f...whatever`. The bag exists once. There is only one bag.

[matter-of-fact] You walk up to it and stick a sticker on it that says `a`. Now you can find the bag by saying `a`. Some time later you write — *`b equals a`*. You did not just create a second bag. You did not copy three apples. You walked up to the same bag and stuck a second sticker on it that says `b`. [pause] Two stickers. One bag.

[firm] If you eat an apple from the bag, the bag now has two apples. If someone reads the bag through `a`, two apples. If they read it through `b`, also two apples. Because, [emphatic] there is only one bag.

[wry] This is what *aliasing* means in Python. The `=` operator does not copy. It points. Re-read this sentence whenever a variable bug surprises you, because nine times out of ten, you wrote `=` when you needed `.copy()` or `list(x)` or `dict(x)`.

[switching to Hinglish, warm] Bhai, Mummy ne ek tiffin pack kiya — name `lunch`. Tu office mein bola, *"papa ke liye bhi same khaana lekar jaa raha hoon, isko `papa_lunch` bol."* `papa_lunch = lunch`. [pause] Ab dono ek hi tiffin hai. Tu lunch khaayega toh papa_lunch bhi khali. Yeh `=` ka kaam tiffin copy karna nahi tha. Bas dusra **sticker** chipka diya same tiffin pe.

[returning to English, dry] If you ever want to take an actual second tiffin to your colleague, the function call is `lunch.copy()` — or better, `dict(lunch)` if it's a dict, `list(lunch)` if it's a list. The cost is one extra call. The cost of *not* doing it is your weekend.

<!-- EN-ONLY ALTERNATIVE
[dry] Imagine you label one lunchbox `lunch` and tell a colleague to call the same lunchbox `papa_lunch`. There's still one lunchbox. Two labels. You eat from it, both labels report empty. The fix in Python is the same as in real life — bring an actual second lunchbox. `lunch.copy()`. `dict(lunch)`. `list(lunch)`. The cost is one extra call.
-->

[gentle] Hold the picture in your head. Names are stickers. Objects are bags. Assignment peels and re-sticks. It does not duplicate the bag.

---

### Speech block 3 — *Move 1: name binding and rebinding*  *(target 3:40 – 6:50)*

[firm] First named move. *Name binding* versus *rebinding* versus *mutation*. You have to be able to read any one line of Python and tell me which of those three is happening, instantly.

[matter-of-fact] Three flavors. One — *binding.* You wrote `a equals 5`. You took a sticker that says `a` and put it on the integer five. New sticker, no previous sticker, fresh attachment.

[matter-of-fact] Two — *rebinding.* You wrote `a equals 5`, then later wrote `a equals 6`. You did not edit the integer five. The integer five still exists somewhere if anything else points to it. You peeled the sticker off five and stuck it on six. The object you used to point at, you no longer point at.

[matter-of-fact] Three — *mutation.* You wrote `a equals a list of one, two, three`, then later wrote `a dot append four`. The sticker hasn't moved. The bag the sticker is on now has a fourth thing in it. *Same bag, more apples.*

[emphatic, slowly] Binding. Rebinding. Mutation. Three different events. The first two are about the sticker. The third is about the bag.

[wry] Why does this matter? Because if `a` and `b` are both stickers on the same bag, and you mutate the bag through `a`, `b` sees it. But if you *rebind* `a` — `a equals a new bag entirely* — `b` is still on the old bag, which is unchanged. [pause] So the bug pattern is:  you wrote what you thought was rebinding, but it was actually mutation, and somebody else's sticker just got hit.

[firm] Memorize this diagnostic. Whenever something changes that you didn't expect to change, ask: *am I sure that operation rebinds, instead of mutating?* `list_a equals list_b` rebinds. `list_a equals list_b dot copy of` rebinds — *and* gives you a separate bag. `list_a dot extend list_b` mutates. The first two are safe. The third is the production-data killer.

[switching to Hinglish, warm] Stack Overflow se code paste kara. Test pass ho gaya. Prod mein deploy kara. Aadhi raat 2 baje pager bajne laga. Deep mein dekha — ek `=` tha jaha `.copy()` hona chahiye tha. Pure 4 saal ki user history shared object pe likhi gayi. Migration script ne sabki email same kar di. [pause] Yaad rakh — Python ka `=` matlab "isi cheez ko ek aur naam de." Copy chahiye toh `list(x)` ya `dict(x)` ya `copy.deepcopy(x)` likh.

[returning to English, dry] One equals sign. Four years of user history. Two a.m. pager. The fix took one minute. The lesson took the rest of the night.

<!-- EN-ONLY ALTERNATIVE
[dry] You paste code from Stack Overflow. Tests pass. You deploy. At 2 a.m. the pager goes off — every user's email is suddenly the same. The bug? One `=` where there should have been `.copy()`. Four years of user history written into a shared object. The fix is one line. The lesson takes the rest of the night.
-->

---

### Speech block 4 — *Move 2: the mutable default trap*  *(target 6:50 – 9:20)*

[firm] Second named move. The *mutable default* trap. This one earns its own naming because every Python developer ships it once.

[matter-of-fact] Here is the shape. You write a function. The function takes an argument, and you give the argument a default value, and the default value is a *list* — or a dict, or a set. Empty. Innocent-looking. The kind of default any other language would let you write.

[wry] Python evaluates that default *exactly once* — at the moment the function is defined. Not once per call. *Once total.* For the lifetime of the program. So every call that doesn't pass an explicit argument shares — the same — list. The same bag. The same sticker, attached to a default that everybody in your codebase is now scribbling on.

[emphatic, slowly] The default is not "an empty list every time." The default is "the empty list I created at definition time, which has been collecting everyone's items ever since."

[dry] You discover this when your second test fails. You stare at the test. The list has data from the first test. You did not pass any data. You file a bug against pytest. [chuckles] Pytest is not the bug. You are the bug. Apologies.

[firm] The fix is named, ugly, and non-negotiable. It's called the *None-sentinel pattern*. The default value is `None` — which is immutable, and safe. Inside the function, the very first line, you check — *if the argument is None, then assign a fresh empty list to it now.* That fresh list is created on every call, in the local scope, where it belongs.

[matter-of-fact] Memorize the *shape* of the fix, not the words. If a default value is a container — list, dict, set — the default in the signature is `None`, and the first line of the function constructs the real container. Always. No exceptions. Type checkers will not catch this for you. Reviewers will. Future-you will. Two-a.m.-you will.

[switching to Hinglish, warm] Mummy se puchha *"chips kha sakta hoon?"* — jawab `True` hai. Roz puchhta hai, roz `True` aata hai. Tujhe lagta hai default response = haan. [pause] Day 90: papa ke saamne pucha. Same default *expectation*. Aaj `False` aaya. Pura mood off ho gaya. Default expectation tu fix kara tha at definition time. Reality har call par re-evaluate hoti hai.

[returning to English, dry] Defaults you set once, behavior you expect every call. The mismatch is the trap. Same shape, two domains.

<!-- EN-ONLY ALTERNATIVE
[dry] Imagine asking the same person the same question fifty times and getting "yes" every time. You internalize the default — the answer is yes. Then you ask a different person, expecting the same default. Reality re-evaluates per caller. Default expectations don't compose. Same bug, different domain.
-->

[firm] Whenever you see `def something open paren x equals empty list close paren`, treat it like an unhandled exception in code review. Reject the change. The reviewer who waved it through is now part of the bug.

---

### Speech block 5 — *Try it and reflect*  *(target 9:20 – 11:00)*

[warm] Time to put the model into your fingers.

[brisk] Open a Python REPL. Three exercises. Embarrassingly small. They will lodge the model permanently.

[matter-of-fact] One. Create a list with three items. Bind it to `a`. Bind `b` to `a`. Append a fourth item to `a`. Print `b`. [pause] If you predicted three items, the lesson didn't land. If you predicted four, you've got it. The bag is shared.

[matter-of-fact] Two. Take that same `a`. Now write — *`a equals a new list of just one item, ten`*. Print `b`. [pause] You'll see four items, not one. Because *that* assignment rebound `a` to a new bag. `b` is still on the old bag. Stickers move; bags don't follow.

[matter-of-fact] Three — and this one is the real test. Write a function that takes one argument with a default of an empty list, and appends the string "called" to it, and returns it. Call it three times with no argument. Print the return value each time. [pause] You'll see one, two, three "called" strings stacking up across calls. Now rewrite it with the None-sentinel pattern, run it again. Each call returns a fresh single-item list. *That* is the fix in your fingers.

[firm] Five takeaways. [pause] One. Names are stickers, not boxes; `=` aliases, it does not copy. Two. Binding, rebinding, mutation are three different events — diagnose which one is happening on every line. Three. To copy, call `list(x)`, `dict(x)`, or `copy.deepcopy(x)` — never assume `=` copies. Four. Mutable defaults are evaluated once at definition time and shared across every call — use the None-sentinel pattern. Five. Roughly one-third of your future Python bugs will be in this lesson; come back when one of them bites.

[gentle] Reflection prompt. *Have you ever had a bug where data showed up in a function call you didn't put it there?* [pause] If yes — that was a sticker, mutating a bag you didn't realize you were sharing.

[warm] Lesson two is next. We move from data to control flow — for-loops, if-chains, the exact moment you stop writing C-with-Python-syntax. [wry] The off-by-one bugs are coming.
