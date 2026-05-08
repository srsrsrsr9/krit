# Lesson 2 — Claude Code: Your Pair Engineer

**Target duration:** ~11:00
**Chapter marks (sec):** 0 / 80 / 220 / 410 / 560

---

## SCENE

Same Bengaluru office, late afternoon. The lecturer has a terminal open on the projector. They are about to walk a room of senior engineers through the difference between *running Claude Code* and *running it well*. Half the room thinks it is fancy autocomplete. The other half has burned a Saturday on a runaway session. Both are about to be corrected. Speaks with a warm Indian-English accent.

## SAMPLE CONTEXT

The listener is an engineer who has at least tried Claude Code. They've had moments of magic and moments of horror. They are about to learn the two moves — planner-doer split, and CLAUDE.md as kernel — that turn it from luck into leverage. Indian-English accent throughout — same lecturer as previous lessons.

## SPEAKER 1

**Recommended voice (true Indian accent):**
- Google Cloud TTS — `en-IN-Chirp3-HD-Charon` *(default)*
- Azure — `en-IN-PrabhatNeural`
- ElevenLabs — *Niraj (Indian English Male)*

**Fallback in Gemini Composer:** Charon *(Informative)* with `[Indian-English accent, calm Bengaluru lecturer tone]` prepended to the first speech block.

**Temperature:** `0.85` *(consider 0.9 — this lesson rewards conviction)*

---

### Speech block 1 — *Why Claude Code is different*  *(target 0:00 – 1:20)*

[Indian-English accent, calm Bengaluru lecturer tone] [wry, slowly] Most engineers meet Claude Code expecting fancy autocomplete. [pause] They open the terminal. They type — *"add a login button."* They watch it run for forty minutes. They get either something brilliant, or something that touched fourteen files including the build config.

[dry] Both feel like luck. Both *are* luck.

[firm] Claude Code is not autocomplete. It is a junior engineer with shell access and your repo open. Without structure, it is that engineer at two a.m. on caffeine in your filesystem. [emphatic] With structure, it is the most leveraged hour of your day.

[matter-of-fact] Today's lesson installs the structure. Two named moves. The planner-doer split. And `CLAUDE.md` as the kernel that survives between sessions. We'll also touch subagents and hooks, briefly, because they are how the structure scales.

[gentle] One opinion before we start, and I will defend it for the rest of the lesson. [emphatic] *Claude Code without `CLAUDE.md` is just expensive autocomplete.* If you take nothing else from today, take that and write a kernel file tomorrow morning.

---

### Speech block 2 — *Mental model: planner vs doer*  *(target 1:20 – 3:40)*

[curious] Picture pair-programming with a junior engineer. Before they touch a single file they say — *"so the plan is, change the User type, then update three call sites, then add a migration, then run the tests."* You nod. Or you push back. Then they execute, narrating as they go.

[matter-of-fact] If you skip the plan step, you are not pair-programming. You are watching a junior wing it on the keyboard.

[firm] Claude Code is exactly the same. Two roles. Planner. Doer. Often the same model running in different modes. Never blur them.

[wry] What most people do, and I include myself when I am tired — they open Claude Code, they describe a feature in one paragraph, they hit enter, and they hope. [scoffs lightly] Hope is not a development methodology. It is what you do when you have not separated the planner from the doer.

[matter-of-fact] The planner reads. The planner investigates. The planner does not modify. The planner produces an artifact — usually `docs/PLAN.md` — that lists the goal, the files about to change, the approach, the risks, and the rollback. You read that plan in two minutes. You approve or push back. *Then* the doer runs.

[emphatic, slowly] The plan is not a bureaucratic step. The plan is what makes the execution sane.

[switching to Hinglish, warm] Ek scene yaad aaya. Pune ki ek B2B SaaS, eighteen-engineer team. Tech lead ne Claude Code ko bola — *"migrate karo Express se Fastify."* [pause] Forty-seven minute baad, eighty-four files badal chuke the. Build broken. Half the routes five-hundred maar rahi thi. Tech lead ne git reset kara. Phir kya kiya? `CLAUDE.md` likha. Plan first kara. Phir bola — *karo.* Eleven din lage, but zero rollback. Same model. Same task. Completely different outcome.

[returning to English, dry] Same junior. Once with a manual, once without. The difference is structure, not the model. If your team is debating whether Claude Code is *ready for production* — they have skipped the planner step. Fix that first. Then re-evaluate.

<!-- EN-ONLY ALTERNATIVE
[dry] A Pune SaaS asked Claude Code to migrate from Express to Fastify in one shot. Eighty-four files later the build was broken. They git reset, wrote a CLAUDE.md kernel, ran /plan first, then /implement. The second pass took eleven days with zero rollback. Same model. Same task. Structure was the variable.
-->

[gentle] Hold that picture. Planner. Pause. Doer. Always two steps. Always a written plan in between.

---

### Speech block 3 — *Move 1: the planner-doer split in practice*  *(target 3:40 – 6:50)*

[firm] First named move. The planner-doer split.

[matter-of-fact] Mechanically, this looks like a slash command. Run `/plan` for anything that touches three or more files. Run it for anything in auth, payments, schema migrations, or rate-limited code. Run it for anything where you are not one hundred percent sure of the right approach. [wry] Run it even when you are sure. You will be surprised how often you weren't.

[firm] The Plan subagent reads the codebase. Asks clarifying questions. Writes `docs/PLAN.md` in a canonical format. Goal. Files touched. Approach. Risks. Rollback. Then it stops. It does not modify a single file.

[matter-of-fact] You read the plan. Two minutes. If the plan says it is going to touch your Stripe webhook handler and a billing migration in the same shot, you say no. If the plan looks sane, you approve, and a separate run executes the plan.

[brisk] Three reasons this split is worth installing. One. Planning catches contradictions before they become fourteen broken files. Two. The plan is reviewable in two minutes; the diff is reviewable in two hours. Three. A paused plan is cheap to throw away; a half-done execution is expensive.

[wry] Engineers who skip the plan step are not faster. They feel faster for the first hour. Then they spend the next four debugging a refactor that introduced two regressions because the model conflated `User` with `Account` halfway through. [scoffs lightly] You did not save time. You moved your typing to a debugger.

[firm] One more thing. Use Opus four point seven for the plan. Use Sonnet four point six for the execution. Opus is heavier, slower, more expensive, but it actually reasons about contradictions in your codebase. Sonnet is the typist who follows the spec. Pay Opus for the planning hour. Pay Sonnet for the implementation day. That ratio is how you make the bill rational.

[switching to Hinglish, warm] Bengaluru ki ek fintech, payments team. They had a rule — Stripe webhook code mein koi bhi change Claude Code se *direct* nahi hoga. Sirf plan, plan ko engineer review karega, phir engineer khud diff likhega. [pause] Six months later, zero Claude-induced production incident in payments. Aur same period mein, support team ne Claude Code se forty internal tools banaye. *Right level of paranoia in the right places.*

[returning to English, dry] Production code with money on the line — engineer writes the diff, Claude only plans. Internal tooling that you can roll back in two minutes — let Claude run. The split is not religion. It is engineering judgement applied to where the cost of being wrong is high.

<!-- EN-ONLY ALTERNATIVE
[dry] A Bengaluru fintech has a rule: any Claude Code change to their Stripe webhook code stops at the plan. The engineer writes the diff. Six months in, zero Claude-induced production incident in payments. Same six months, the support team built forty internal tools with Claude Code on the loose. Right paranoia, right place.
-->

---

### Speech block 4 — *Move 2: CLAUDE.md as the kernel*  *(target 6:50 – 9:20)*

[firm] Second named move. The kernel file. `CLAUDE.md`.

[matter-of-fact] Claude Code reads `CLAUDE.md` at the root of your repo at the start of every session. It is the only file with this property. Whatever you put in there is loaded into context, automatically, every time. This is your kernel.

[wry] Most teams I see either don't have a `CLAUDE.md`, or they have a one-line file that says *"use TypeScript, please."* [scoffs lightly] That is not a kernel. That is a sticky note.

[matter-of-fact] A real kernel has six things. The stack — what languages, frameworks, versions. The hard rules — what must never happen — *no `any` without a comment*, *no inline styles*, *no autonomous commits*. The architecture — where things live and why. The slash commands — `/plan`, `/spec`, `/bugfix`, `/ship` — that load the right docs at the right time. The failure tiers — what is catastrophic, what is annoying, what is fine. And finally, the load-on-demand index — *for styling, read `docs/STYLE.md`; for queries, read `docs/DATABASE.md`*. The kernel is small. The full docs are loaded only when needed.

[firm] Why this matters. Claude has zero memory between sessions. You can either remind it of your standards in every prompt — and you will forget — or you can write the standards once and let the kernel remind it for you. Same model. Same task. Vastly different output. The difference is the four kilobytes of `CLAUDE.md` that loaded automatically.

[emphatic] Without the kernel, every session starts from a generic Claude with generic opinions about your codebase. With the kernel, every session starts from a Claude that already knows you. That is not a small difference. That is the difference between a contractor you have to brief every Monday and a teammate.

[switching to Hinglish, warm] Aur ek important baat — `CLAUDE.md` likhne mein over-engineer mat karo. Two-page kernel chalega. Six rules. Three slash commands. Ek failure tier table. Bas. Aur agar koi rule baar baar break ho rahi hai — woh rule kernel mein nahi hai. Add it. Iterate the kernel like you iterate code. Mahine mein ek baar refresh kar lo.

[returning to English, dry] The kernel is not a constitution. It is a working document. When you find yourself writing the same correction in three sessions, that's a kernel update waiting to happen.

<!-- EN-ONLY ALTERNATIVE
[dry] Don't over-engineer the kernel. Two pages. Six rules. Three slash commands. One failure-tier table. Iterate it like code. If you keep correcting Claude on the same point in three sessions, that correction belongs in CLAUDE.md, not in your prompt.
-->

[firm] So. Step one this week — write a `CLAUDE.md`. Even a draft. Step two — run `/plan` before any non-trivial change. Step three — pay attention to which corrections you keep retyping, and put them in the kernel. The kernel is what compounds.

---

### Speech block 5 — *Subagents, hooks, recap, takeaways*  *(target 9:20 – 11:00)*

[warm] Last move. Subagents and hooks, very briefly, because they are how the kernel scales.

[matter-of-fact] A subagent is a small Claude with one job and a clean context. A planner subagent reads code, writes a plan, exits. A test-writer subagent reads a function, writes tests, exits. A migration subagent reads two schemas, writes the migration, exits. Each one is bounded. Each one is debuggable. Each one is replaceable.

[wry] What you don't want — and I have watched a Pune team do this — is one giant Claude session that runs for six hours, spawns its own subagents, makes architectural decisions on its own, and produces a thousand-file diff at the end. [scoffs lightly] Nobody is reviewing that diff. You have outsourced your codebase to a model with no accountability. Don't do that.

[matter-of-fact] Hooks are the other half. A hook is a script that runs at a fixed point in Claude Code's lifecycle — before a commit, after a tool call, on session start. The most useful hook in production: a pre-commit hook that scans for secrets in the staged diff and blocks the commit if it finds any. The model is not perfect at this. The hook is. Always pair Claude with deterministic checks at the boundaries where mistakes are catastrophic.

[firm] Recap. Move one — planner-doer split. Always plan before execute. Opus for the plan, Sonnet for the execution. Move two — `CLAUDE.md` as the kernel. Six things. Two pages. Iterate like code.

[firm] Five takeaways. [pause] One. Claude Code without `CLAUDE.md` is expensive autocomplete; the kernel is non-negotiable. Two. Always run `/plan` before any change touching three or more files; the plan is the artifact, the execution is just typing. Three. Subagents must be small and bounded; long sessions are not productive, they are unreviewable. Four. Hooks catch what models miss — secrets, formatting, commit messages — keep them in your repo. Five. Money-touching code: engineer writes the diff, Claude only plans.

[gentle] Reflection prompt. *Open your repo right now. If `CLAUDE.md` does not exist, that's your task this week. If it does exist, read it. Is it actually your kernel — or is it a sticky note pretending?* [pause] Be honest with yourself for one minute.

[warm] Lesson three is next. We leave the terminal and walk into Slack, email, and meetings — the place where Claude looks easy and is actually the most dangerous. [wry] The draft engine is coming.
