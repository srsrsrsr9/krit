# Lesson 1 — What Claude Is Actually Good At

**Target duration:** ~11:00
**Chapter marks (sec):** 0 / 80 / 220 / 410 / 560

---

## SCENE

A Bengaluru product office, the lecturer at the front of a small room. They've spent the morning watching engineers and PMs hammer Claude with the wrong prompts on the wrong surfaces and burn through tokens like it was 2009 Google. They are about to install the one mental model that, once held, makes every other Claude lesson trivial. Speaks with a warm Indian-English accent.

## SAMPLE CONTEXT

The listener has used Claude. They've had brilliant moments and they've had ten-tab disasters. They cannot reliably explain *why* a session went one way or the other. They are about to find out it was almost never the model — it was the surface choice and the lack of context. Indian-English accent throughout.

## SPEAKER 1

**Recommended voice (true Indian accent):**
- Google Cloud TTS — `en-IN-Chirp3-HD-Charon` *(default)*
- Azure — `en-IN-PrabhatNeural`
- ElevenLabs — *Niraj (Indian English Male)*

**Fallback in Gemini Composer:** Charon *(Informative)* with `[Indian-English accent, calm Bengaluru lecturer tone]` prepended to the first speech block.

**Temperature:** `0.85`

---

### Speech block 1 — *Why this lesson exists*  *(target 0:00 – 1:20)*

[Indian-English accent, calm Bengaluru lecturer tone] [wry, slowly] Most people use Claude the way they used Google in 2009. [pause] They type a question, they hope. [dry] That works for trivia. It fails for everything else.

[matter-of-fact] So before we touch a prompt, before we open a single chat window, we are going to install one picture in your head. The picture is this. [emphatic] Claude is not a search engine. Claude is not an oracle. Claude is not a coworker who has read your docs.

[firm] Claude is a fast, articulate junior. Infinite patience. Zero memory between sessions. And — this is the part that hurts — a worrying willingness to make things up when there is no source.

[wry] Hold that picture. Every other rule in this course just falls out of it.

[gentle] Today's lesson has two named moves. The capability map — which surface for which job. And don't ask, show — how to feed Claude enough context that it stops hallucinating. Plus the part nobody tells you, which is when *not* to open Claude at all. We will end with a clear set of takeaways and a reflection prompt you can actually run on Monday morning.

---

### Speech block 2 — *Mental model: the fast junior with infinite patience*  *(target 1:20 – 3:40)*

[curious] Picture the most willing junior you have ever worked with. They have read every book in the library. They will do anything you ask. They will not push back unless you ask them to. They will not check their work unless you tell them how. They will write eighteen hundred confident words on any topic. [pause] And they cannot tell when they are wrong.

[matter-of-fact] That is your Claude. It is not less than this. It is not more. The trap most people fall into is they oscillate — they treat Claude like a peer in the morning and like a search engine in the evening. Both are wrong. The picture you want is the junior. Always.

[wry] In 2026, Anthropic ships three models that all share this junior personality. Opus four point seven — that is the heavy reasoning model with the one million token context window. Sonnet four point six — your default workhorse, ninety percent of the cost, eighty percent of the quality, suits ninety-five percent of jobs. And Haiku four point five — the cheap, fast one for repetitive work at scale.

[firm] Same junior. Three brain sizes. Different price points. Don't pay Opus prices for Haiku-shaped work — that is twenty rupees of API for a five rupee job. And don't run Haiku on a Supreme Court argument — that is a five rupee model on a twenty rupee question.

[switching to Hinglish, warm] Bhai, picture this scene. New intern joined Monday. IIT-types, nine point two CGPA, padha hua sab kuch hai, calls you Sir. [pause] Day one, manager bola — *"thoda research karwao Claude se."* Intern ne pure two hundred line PR Claude se generate kara. Code review mein senior ne pucha — *"line forty-seven kya kar rahi hai?"* [pause] Pin-drop silence. Pure team ka chai break ban gaya forty-five minutes ka.

[returning to English, dry] Lesson? Claude is the intern. You are the senior. Read line forty-seven before you push.

<!-- EN-ONLY ALTERNATIVE
[dry] There is a version of this scene in every team. The new hire generates a two hundred line pull request from Claude in their first week. The reviewer asks what line forty-seven does. The silence is louder than the chai machine. Claude is the intern. You are the senior. Read line forty-seven.
-->

[gentle] If you only take one thing from today, take that. Every other move in this course assumes you have stopped treating Claude as a search engine, and started treating it as a junior who needs context, supervision, and a senior on the keyboard.

---

### Speech block 3 — *Move 1: the capability map*  *(target 3:40 – 6:50)*

[firm] First named move. The capability map.

[matter-of-fact] Anthropic ships Claude on three surfaces. They are not interchangeable. Wrong surface plus wrong model is a ten times cost mistake or a ten times quality mistake. Knowing the map saves you from both.

[brisk] Surface one. Claude dot AI. The web chat. Projects. Artifacts. Web search. This is the surface for *thinking with you*. You paste in a strategy memo, you brainstorm three positioning angles, you have it draft a board update. Reasoning happens. Files do not change. Use Opus or Sonnet here.

[brisk] Surface two. Claude Code. The CLI in your terminal. File access. Shell access. The thing that actually edits your repo. This is the surface for *changing files for you*. Refactor twenty-three files. Migrate Express to Fastify. Add Stripe webhooks across your codebase. Use Sonnet four point six by default. Opus when the reasoning load is real.

[brisk] Surface three. The Anthropic API. Raw access for your own software. This is the surface for *doing the same thing one thousand times for you*. Tag every support ticket. Translate every page. Summarise every transcript. Use Haiku four point five at scale and put a cache in front of it.

[emphatic, slowly] Claude dot AI for thinking with you. Claude Code for changing files for you. API for doing it a thousand times for you. Memorise the column labels before the model names.

[wry] The most expensive mistake I see in Bengaluru fintechs right now is teams using Claude dot AI for tasks that belong in Claude Code. They paste twenty-three files into a chat window. Claude makes confident edits. They paste them back into VS Code. Half don't apply. Three subtly break the build. They wonder why this AI thing is overhyped. [scoffs lightly] You used a notepad to do a refactor. Of course it was overhyped.

[switching to Hinglish, warm] Aur Pune ki ek SaaS company ka manager mujhe kal hi bola — *"Claude bahut accha kaam kar raha hai, but bahut slow."* Maine pucha — *"kya kar rahe ho?"* Bola — *"har customer ka invoice text Claude dot AI mein paste kar ke summary nikaal raha hoon, ek ek kar ke."* [pause] Yaar, woh API ka kaam hai. Batch mein bhejo. Haiku se. Cache laga ke. Ten thousand invoices in twenty minutes, not three days of copy-paste.

[returning to English, dry] Right tool, right model, right surface. The capability map saves you from both bills.

<!-- EN-ONLY ALTERNATIVE
[dry] A founder I met last month was running ten thousand invoice summaries by pasting them one at a time into Claude dot AI. Three days of copy-paste for a job that is twenty minutes of API plus a Haiku call plus a cache. Same model would have done it. Wrong surface.
-->

[firm] So before you type a single prompt, ask yourself the verb. Are you thinking? Changing files? Or doing the same thing many times? The verb tells you the surface. The surface narrows the model. Three seconds of thought saves you three hours of wrong work.

---

### Speech block 4 — *Move 2: don't ask, show*  *(target 6:50 – 9:20)*

[firm] Second named move. Don't ask. Show.

[matter-of-fact] The single biggest gap between a brilliant Claude session and a useless Claude session is the amount of *context* you fed it before you asked the question. Most people give Claude one sentence and expect a customised answer. That is asking a junior to design your kitchen without telling them how many people live in your house.

[wry] Watch how a beginner uses Claude. *"Write me a cold email."* [pause] Claude writes a generic cold email. Beginner is disappointed. Concludes Claude is generic. [scoffs lightly] No, you were generic.

[matter-of-fact] Watch how a senior uses Claude. *"Here are the last five cold emails I sent. Here is the response rate on each. Here are two from a competitor that I think are good. Here is the prospect's LinkedIn. Now write me a cold email in my voice that gets to the calendar invite in four lines."* Same model. Same minute. Wildly different output.

[emphatic] Show is the entire game. Show your past work. Show good examples. Show bad examples. Show the constraint. Show the audience. Show the tone.

[firm] When the answer matters — and most things you would automate matter — start the prompt with at least three artifacts. Past work, target output, hard constraints. Then your one-line ask. The ratio you want is four to one — four parts context, one part question. If your prompt is a single line, the output is going to be a single line of useful, padded with a thousand words of generic.

[switching to Hinglish, warm] Aur ek aur baat. Sample dene mein sharam mat karo. Mummy ki tarah cross-examination karo Claude ka. *"Kahaan se laaya yeh number? Source dikha. Aur kya assume kar raha hai jo maine bola nahi tumhe?"* [pause] Claude actually tells you. *"Maine assume kiya tha India ka tax structure thirty percent hai aur user pre-paid customer hai."* Bas. Ab tum check kar sakte ho dono assumptions sahi hain ya nahi.

[returning to English, dry] Most people never ask the second question. They get the answer, they ship it. They are surprised when the assumption was wrong. The senior asks. The intern guesses. You are the senior.

<!-- EN-ONLY ALTERNATIVE
[dry] Most people accept Claude's first answer and ship. The single highest-leverage habit you can build is asking *"what assumptions did you make that I did not give you?"* The model will tell you. Half the time, one of those assumptions is the bug.
-->

[gentle] Don't ask, show. And after Claude shows you back, ask one more time — *what did you assume?* Two-question discipline. Most of the value of being a Claude power user is in those two extra rounds.

---

### Speech block 5 — *When NOT to use Claude, recap, takeaways*  *(target 9:20 – 11:00)*

[warm] Last move. The one nobody puts in the marketing brochure. When *not* to open Claude at all.

[firm, slowly] Three cases. Memorise them.

[matter-of-fact] One. When the answer must be auditable in court, in regulation, or in a board meeting and you cannot trace it back to a source. Claude does not cite. Claude rationalises after the fact if you ask, but the rationalisation is itself generated. For SEBI filings, RBI submissions, contractual language, you write it. Claude can review. Claude does not author.

[matter-of-fact] Two. When the work is below your time-cost and inside your competence. The two-line email to your co-founder. The Slack reply to your manager. The customer text where the relationship is the message. Opening Claude here costs you forty seconds and your voice. Just send it.

[matter-of-fact] Three. When you do not yet know what good looks like. If you cannot articulate the rubric for a great answer, Claude cannot deliver one — and worse, you cannot tell whether what came back is great or merely confident. In those moments, learn first. Then come back to Claude with a rubric.

[wry] If you skip those three cases, you will be the person who runs every email through Claude, ships generic prose to people who know your real voice, and wonders why the team's pet name for you is suddenly *Claude-anna*. [chuckles]

[firm] Recap. Move one — the capability map. Claude dot AI for thinking, Claude Code for files, API for scale. Move two — don't ask, show. Four parts context, one part question. Plus, ask what was assumed.

[firm] Five takeaways. [pause] One. Claude is a fast junior with infinite patience and zero memory; treat it accordingly. Two. The surface choice matters more than the model choice; pick the surface first. Three. Sonnet four point six is the default; Opus four point seven only when the reasoning load is real; Haiku four point five at scale. Four. Don't ask, show — four parts context, one part ask. Five. Three places not to use Claude — auditable, sub-cost, no rubric.

[gentle] Reflection prompt. *Pick one task from your last week where you opened Claude and were disappointed. Was it the wrong surface, the wrong model, or no context?* [pause] Almost always, the answer is one of the three. Sit with that one for a minute.

[warm] Lesson two is next. We open Claude Code, write our first kernel file, and find out why every line of `CLAUDE.md` is worth more than ten lines of prompt. [wry] The fast junior is about to get a manual.
