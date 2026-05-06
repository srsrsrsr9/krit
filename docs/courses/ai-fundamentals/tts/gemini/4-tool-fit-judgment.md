# Lesson 4 — When AI Is the Right Tool (and When It Isn't)

**Target duration:** ~11:00
**Chapter marks (sec):** 0 / 80 / 220 / 410 / 560

---

## SCENE

Same Bengaluru classroom, Thursday. The lecturer is in their groove now — one foot on the chair-rung, slightly leaning forward, dispatching opinions briskly. The mood is *let me give you the framework I use to evaluate every AI feature pitch I see, in under a minute.* Indian-English accent, calm but slightly faster pacing today.

## SAMPLE CONTEXT

The listener has the mental model (lesson 1), the prompt structure (lesson 2), and the hallucination playbook (lesson 3). They now know that some use cases need RAG and some need refusing. This lesson hands them the three-axis framework to *triage* candidate use cases at the pitching stage — before the prompt or RAG even gets written. Indian-English accent throughout — same lecturer.

## SPEAKER 1

**Recommended voice (true Indian accent):**
- Google Cloud TTS — `en-IN-Chirp3-HD-Charon` *(default)*
- Azure — `en-IN-PrabhatNeural`
- ElevenLabs — *Niraj (Indian English Male)*

**Fallback in Gemini Composer:** Charon *(Informative)* with `[Indian-English accent, calm Bengaluru lecturer tone]` prepended to the first speech block.

**Temperature:** `0.85`

---

### Speech block 1 — *Opening: the framing that picks features*  *(target 0:00 – 1:20)*

[Indian-English accent, calm Bengaluru lecturer tone] [matter-of-fact] Lesson four. Tool-fit judgment. The skill of looking at a candidate AI feature and knowing — in about sixty seconds — whether to greenlight it, scope it for human-in-the-loop, or refuse it.

[wry] You have probably noticed — *picking the right use case* is a more important skill than *picking the right model.* The features that ship and the features that get rolled back, in my experience, differ less in their engineering than in their initial framing. The wrong feature with the best model still gets rolled back. The right feature with the second-best model usually ships fine.

[dry] Today I am going to give you a three-axis framework. It fits in your head. It takes about a minute per use case. It will save you and your team from the next big "we built it but had to roll it back" post-mortem.

[firm] One mental model — *volume × stakes × verifiability.* Two named moves — *the high-volume low-stakes sweet spot,* and *human-in-the-loop as the pragmatic compromise.* Plus one named trap — *the CEO-PR vs engineer-fit gap,* which is the reason most companies' flagship AI features are also their most rolled-back features.

[curious] By the end of this lesson, you will have an opinion — a strong one — about every AI feature pitch you hear from this point on. You will also have the language to defend that opinion in a meeting where everyone else is excited.

[emphatic] Take sides. Refusal is a feature.

---

### Speech block 2 — *Mental model: volume × stakes × verifiability*  *(target 1:20 – 3:40)*

[thoughtful] Three axes. They pick the use case for you.

[matter-of-fact, slowly] *Axis one — volume.* How many decisions or outputs per day? Per week? Per month? Higher volume amortizes the cost of building. Higher volume is also where AI shines — you don't care if a single output is mediocre, because there are ten thousand more, and the average is what matters. Low volume — twenty outputs a year — does not amortize anything. The build cost crushes the unit economics.

[firm] *Axis two — stakes.* What is the cost of one wrong output? Bounded — annoyance, retry, mild embarrassment, the user clicks regenerate. Unbounded — legal liability, patient harm, regulatory penalty, the company's name in the newspaper. The further toward unbounded, the more guardrails you need. Past a certain threshold, no amount of guardrails are enough; you refuse.

[curious] *Axis three — verifiability.* Can the user, or a downstream system, detect a wrong output cheaply? *Spotting a bad summary* is easy — you read it, you see something off, you regenerate. *Spotting a fictional Supreme Court citation* is hard — you'd need to look up the citation in a real database. *Spotting a subtly wrong financial calculation* is hard — the wrong number looks like a right number. High verifiability is your safety net. Low verifiability is the open trapdoor.

[matter-of-fact] Multiply the three. *High volume × low stakes × high verifiability* is the sweet spot. Customer-support ticket triage. Internal docs Q&A with citations. Email-tone rewriting. Bulk classification. These are the features that ship in 2026 and stay shipped.

[firm, slowly] *Low volume × high stakes × low verifiability* is the never-ship zone. AI-drafted final medical consent. AI-generated annual strategy decks for the board. AI-determined custody recommendations. *Don't ship.* No model is good enough to flip these.

[wry] Most rolled-back AI features have one of two patterns. Either they were pitched as *sweet spot* but were actually *never-ship zone in disguise* — somebody under-counted the stakes. Or they were genuinely sweet-spot features but somebody under-counted the verifiability problem.

[switching to Hinglish, warm] Mummy ke kitchen mein two scenarios. Scenario one — thirty logon ka roti chahiye. Volume high, stakes low (ek roti jali toh OK), verifiability high (Mummy dekh leti hain). *AI assistant for roti-rolling? Sure, ship it.* [pause] Scenario two — Daadi-ji's birthday cake. Naani ka recipe. Single batch. Seventy saal ka tradition. Volume low, stakes high, verifiability low (cake banane ke baad pata chalega galat hai). *AI assistant? Refuse. Mummy khud banayegi.*

[returning to English, dry] Same kitchen. Same Mummy. Different fit. The kitchen is the same; the use case decides. The judgment is what you're being trained on, not the model.

<!-- EN-ONLY ALTERNATIVE
[dry] Thirty rotis for a party — high-volume, low-stakes, easy to spot a bad one. Perfect for an AI assistant. Grandmother's birthday cake from a seventy-year recipe — low-volume, high-stakes, no second chance. Refuse. The kitchen is the same; the use case decides.
-->

---

### Speech block 3 — *Move 1: high-volume + low-stakes is the sweet spot*  *(target 3:40 – 6:50)*

[firm] Move one. Lean into the sweet spot. Build there first. Build there often. The sweet spot is where AI provides actual leverage and the failure modes are bounded.

[matter-of-fact, slowly] What lives in the sweet spot. *Customer-support triage.* Thousands of tickets per day. Each wrong category is a one-click fix. Verification is built into the workflow because a human eventually answers the ticket. Sweet spot.

[curious] *Internal docs Q&A.* Hundreds of queries per day. Wrong answers are caught by the asker because they have domain context. Verification is the asker's expertise. Sweet spot.

[matter-of-fact] *Code review assistance.* Many PRs per day. Wrong suggestions are ignored by the reviewer. Verification is the reviewer's existing job. Sweet spot.

*Bulk content generation with human selection.* Twenty taglines, pick three. Forty subject lines, A/B test the best five. Generation cost is low. Verification is the human's pick. Sweet spot.

*Summarization for spot-checking.* Daily reports condensed for a manager who'll read the source if anything looks off. Verification is the source document, one click away. Sweet spot.

[firm] What does *not* live in the sweet spot, even if it sounds similar. *AI-drafted customer responses, sent automatically without review.* Volume is high — but stakes are unbounded (one wrong response goes viral) and verifiability is low (nobody catches it before it ships). Move it to HITL or don't ship it.

[wry] *AI-generated legal memos.* Volume is moderate. Stakes — high. Verifiability — low (you'd need a lawyer to catch a wrong cite, which defeats the point of automating it). Refuse, or scope to HITL with a lawyer in the loop.

[matter-of-fact] *AI-determined headcount or hiring recommendations.* Volume is low. Stakes are high (legal, ethical, organizational). Verifiability is low. Hard refuse.

[curious] How to *create* sweet-spot features when the obvious pitch isn't sweet-spot. Three moves.

[firm] *Narrow the scope.* Instead of *AI summarizes all customer calls,* try *AI summarizes the last sixty seconds for the agent before they pick up.* Narrower stakes. Faster verification.

*Increase the volume.* Instead of *AI writes our quarterly board memo,* try *AI drafts five hundred customer-success memos per quarter, the manager reviews ten percent.* Volume justifies the build. Sampling provides verification.

*Add the verifier.* Instead of *AI generates the legal answer,* try *AI generates the legal answer with citations to specific clauses, and the lawyer approves with a checkbox.* Same problem, different feature, three times more shippable.

[matter-of-fact] These three moves convert a never-ship pitch into a sweet-spot pitch. Most product roadmaps don't try them; the pitch dies as a binary *yes or no.* You can be the person in the room who reframes it.

---

### Speech block 4 — *Move 2: human-in-the-loop is the pragmatic fix*  *(target 6:50 – 9:20)*

[firm] Move two. Human-in-the-loop. HITL. The feature pattern that ships in regulated industries every day, while their pure-AI competitors get rolled back.

[matter-of-fact, slowly] HITL is not a *limitation* you reluctantly add to an AI feature. It is the *design pattern* that lets you ship in domains where pure AI cannot ship at all. You should reach for HITL early, not as a last resort.

[curious] Three good HITL patterns. Pick the one that fits.

[matter-of-fact] *Pattern one — AI drafts, human ships.* The AI produces the candidate output. The human reviews, edits if needed, then sends. Email auto-replies for support agents. AI-drafted investment commentary that the analyst signs off on. AI-suggested code changes that the developer accepts.

The win — humans are roughly five-to-ten times faster reviewing than drafting from scratch. The AI does the slow first draft; the human does the fast quality pass.

[firm] *Pattern two — AI flags, human decides.* The AI surfaces candidates for human attention. *These five tickets look like they might be fraud — review.* *These three documents have unusual clauses — review.* The AI is doing prioritization, not deciding. The human still decides every consequential outcome.

The win — humans triage faster when prioritized. Volume goes up, stakes stay bounded by the human's final decision.

[curious] *Pattern three — AI proposes, multiple humans vote.* For higher-stakes decisions, the AI generates options, two or three humans review independently, the system records agreement. This is what content moderation actually looks like at scale.

The win — disagreement among reviewers is information. The AI's job is to surface the candidates; the humans' job is to converge.

[matter-of-fact] What HITL is *not.* It is not *the AI does everything and a human glances.* If the human is just rubber-stamping outputs they don't have time to actually read, you do not have HITL. You have *AI with plausible deniability.* That is worse than pure AI, because it pretends a guardrail exists when none does.

[wry] Real HITL means the human *catches* errors. If the human catches roughly zero errors, the loop isn't working — either the AI is genuinely that good (rare), or the human is overloaded (common). Measure the catch rate. If it's near zero, fix the loop or admit you're shipping pure AI.

[switching to Hinglish, warm] Dabbawala system Mumbai mein chalta hai for over a hundred years. Six sigma reliability. Why? Loop hai — pickup, sort, transit, deliver, return — har stage pe ek banda hai jo cross-check karta hai. Color-coded signature on each tiffin. *AI bhi exactly aise hi work karta hai when it ships.* AI ne pickup kara. Human ne sort kara. AI ne route bata diya. Human ne deliver kara. Six sigma. [pause] Pure-AI delivery service launch karega? *Lost tiffins. Front page news. Rollback.*

[returning to English, dry] HITL is what successful logistics has been doing for a century. AI is the new tool in the loop, not a replacement for the loop. Anyone telling you otherwise is selling, not shipping.

<!-- EN-ONLY ALTERNATIVE
[dry] The Mumbai dabbawala network achieves near-perfect reliability through human cross-checks at every stage of a long pipeline. AI fits neatly into that pattern as one more participant in the loop — but it is not a replacement for the loop. Pure-AI logistics tries to remove the loop and discovers exactly why the loop existed.
-->

[firm] Named trap. *The CEO-PR vs engineer-fit gap.* Pressure to "use AI" usually points engineering teams at flagship low-volume high-stakes features that look good in press releases. Those are the same features that get rolled back. Same press release works for high-volume sweet-spot features — *we automated triage of fifty thousand tickets per quarter* — engineering succeeds, the CEO still gets to say "we use AI." Reframe the pitch.

---

### Speech block 5 — *Try it, reflect, and where you are now*  *(target 9:20 – 11:00)*

[warm] Pick three AI feature pitches you have heard or thought about recently — yours, your team's, your competitor's. Five minutes.

[firm] Score each on the three axes. *Volume* — high, medium, low. *Stakes* — bounded or unbounded. *Verifiability* — high, medium, low.

[matter-of-fact] Now triage. Sweet spot — high volume, low stakes, high verifiability — greenlight. Some axes off — see if you can reframe with the *narrow / increase volume / add verifier* moves. Never-ship zone — refuse, or insist on HITL with a real human catch rate.

[curious] You should now have three pitches, each with a clear verdict — *ship, reframe, refuse.* That is the deliverable. Most teams have these conversations endlessly because nobody has the framework. You now do.

[wry, slowly] Where you are now. [pause]

[warm] You walked in unsure how to evaluate AI feature pitches without arguing about model quality. You are walking out with — one mental model. *Volume × stakes × verifiability.* Two named moves — *the high-volume low-stakes sweet spot,* and *HITL as the pragmatic compromise that ships in regulated domains.* Plus one named trap — *the CEO-PR vs engineer-fit gap.*

[firm] That's the tool-fit playbook. [emphatic] Defend it in your next product meeting.

[brisk] Five takeaways. [pause] One. The right use case matters more than the right model. Two. The three axes are volume, stakes, verifiability — sweet spot is high-low-high. Three. Most rolled-back features are low-volume high-stakes low-verifiability features that were pitched as something else. Four. Three reframing moves — narrow the scope, increase the volume, add the verifier — convert never-ship pitches into sweet-spot pitches. Five. HITL is a design pattern, not a limitation; measure the human catch rate or you don't actually have HITL.

[gentle] The reflection prompt. *Of the three pitches you just scored — which one would you reframe, and what is the specific reframe?* [pause]

[warm] If you can name the reframe, you can drive that conversation in your next planning meeting. That is the senior-engineer move in this domain.

[wry, slowly] Next lesson — workflow design. The five-stage loop that separates *we built an AI feature* from *we shipped an AI feature that still works in three months.* [pause] See you there.
