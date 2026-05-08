# Lesson 1 — What a PM Actually Does

**Target duration:** ~11:00
**Chapter marks (sec):** 0 / 80 / 220 / 410 / 560

---

## SCENE

A small classroom in a Bengaluru co-working building, late afternoon. Whiteboard behind the lecturer has the words *Translate. Sequence. Repeat.* in slightly crooked marker. The lecturer is mid-thirties, sleeves pushed up, one hand holding a chai cup, the other gesturing at the room. They have shipped enough features — and killed enough features — to be allergic to PM theatre. Speaks with a warm Indian-English accent.

## SAMPLE CONTEXT

The listener is a first-time product manager, or someone considering moving into the role from engineering, design, or operations. They believe — incorrectly — that the PM job is to write JIRA tickets and chair standups. They are about to be relieved of this belief, gently. Indian-English accent throughout — same lecturer for all five lessons.

## SPEAKER 1

**Recommended voice (true Indian accent):**
- Google Cloud TTS — `en-IN-Chirp3-HD-Charon` *(default)*
- Azure — `en-IN-PrabhatNeural`
- ElevenLabs — *Niraj (Indian English Male)*

**Fallback in Gemini Composer:** Charon *(Informative)* with `[Indian-English accent, calm Bengaluru lecturer tone]` prepended to the first speech block.

**Temperature:** `0.85`

---

### Speech block 1 — *Opening: the JIRA-monkey trap*  *(target 0:00 – 1:20)*

[Indian-English accent, calm Bengaluru lecturer tone] [warm] Welcome to product management. [pause] Or as your engineers will call you for the first six months — *the ticket person.*

[dry] On day one, every new PM thinks the job is to write JIRA tickets, run standups, and chase engineers. By month six, the good ones realise the job is something else entirely.

[firm] The job is *translation* — converting a vague founder ask into a thing engineers can build, a thing users will adopt, and a thing sales can sell. And *sequencing* — deciding what gets built first, second, and never. Tickets and standups are the byproduct. Not the work.

[matter-of-fact] If you remember nothing else from this course, remember this. [emphatic, slowly] A PM with a great roadmap and no translation skill ships features nobody uses. A PM with translation skill and no roadmap ships nothing — but at least nobody is angry. [pause] You want both. We will build both.

[wry] Today, two named moves. Outcome over output. And a three-question scope test that survives Slack at 11 PM on a Friday. [chuckles] Yes, that is when most PM work actually happens.

---

### Speech block 2 — *Mental model: PM as translator and sequencer*  *(target 1:20 – 3:40)*

[curious] Picture three rooms.

[matter-of-fact] Room one — *Users.* They say what they want. They mean something else. They will explain a problem and then, in the same breath, demand the wrong solution. With confidence.

[matter-of-fact] Room two — *Engineers.* They need specifics. Edge cases. The why. They cannot ship *"a referral program."* They can ship *"a copy-link button on the dashboard that issues a unique slug and credits ten percent off the next invoice."* The difference between those two sentences is the difference between three weeks and three months.

[matter-of-fact] Room three — *Sales and the CEO.* They need a story and a date. Preferably this quarter. The story is what they tell prospects on the call. The date is what shows up in the renewal deck.

[firm] Each room speaks a different language. Each has different incentives. The PM is *the door between them.* Not above. Not below. The door. Your value is whatever loss in translation you prevent.

[wry] On top of that — sequencing. Given finite engineers and infinite asks, you decide which ask gets built this sprint, which next quarter, which gets a polite no. Translation makes the asks legible. Sequencing makes them shippable. [pause] Drop either half and the role collapses into theatre.

[switching to Hinglish, warm] Bhai, scene yeh hai. CEO ne bola *"Priority 1."* PM ne meeting mein likha *"Priority 1.5, but really P1."* Engineer ne JIRA mein likha *"P3, looks like a nice-to-have."* Designer ne bola — *"Yeh next quarter ka hai na?"*

[returning to English, dry] Same ticket. Four people. Four meanings. The ticket itself just says *TBD.* [pause] This is your daily problem in one sentence — same words, four meanings, zero alignment. The day that stops happening is the day you have actually started doing the job.

<!-- EN-ONLY ALTERNATIVE
[dry] The CEO calls it P1. The PM writes 'P1.5, but really P1' in the doc. The engineer files it as P3. The designer asks if it's next quarter's work. All four are looking at the same ticket. The ticket says 'TBD'. Same words, four meanings, zero alignment. That is the PM's daily problem in one sentence.
-->

---

### Speech block 3 — *Move 1: outcome over output*  *(target 3:40 – 6:50)*

[firm] First named move. *Outcome over output.*

[matter-of-fact] Output is what you ship. Outcome is what changes for the user. Most PMs measure themselves on output because output is countable. Features shipped. Tickets closed. Sprints completed. [pause] But shipping a feature nobody uses is not progress. [emphatic, slowly] It is debt.

[wry] A Bengaluru SaaS I worked with shipped forty-seven features in one year. Their daily-to-monthly active ratio was zero point one four. The CEO was proud of the velocity. [chuckles] The CEO was wrong. They had built a museum of features. Not a product. Beautiful exhibits. No visitors.

[firm] The move is to *state every initiative as an outcome before you state it as an output.* Not *"ship the new invoicing module"* — that's an output. Try [slowly] *"reduce time-to-first-invoice from four days to under one day for new SMB customers."* [pause] Now you can tell, three months later, whether it worked. The module is one possible answer. The outcome is the actual question.

[matter-of-fact] Worked example. CEO Slacks you — *"We need to build a referral program."* This is an output disguised as a strategy. Six engineers could spend two months on it and you would still not know if it worked.

[curious] Step back. What behavior change would make the CEO happy? Probably more new signups from existing customers without paying Google. Now you have a direction.

[firm] Frame it. *Increase organic signups attributed to existing-customer referrals from four percent to twelve percent of monthly new signups, by end of Q2.* Specific. Measurable. Time-boxed.

[matter-of-fact] *Then,* and only then, brainstorm outputs. A referral code. A friend-invite flow. A public testimonials page. A customer-advocacy programme. Each is a hypothesis. The cheapest one to test wins. Ship copy-link referral in one sprint, measure for four weeks, and decide.

[gentle] If you remember nothing else — *output is countable, outcome is informative.* Counting outputs is how you ship forty-seven features and have no idea which three mattered. [emphatic] Counting outcomes is how you stop.

---

### Speech block 4 — *Move 2: the three-question scope test*  *(target 6:50 – 9:20)*

[firm] Second named move. *The three-question scope test.*

[matter-of-fact] Friday, eleven PM. The founder Slacks you a feature ask. *"Can we add a Hindi UI? A few warehouse customers asked."* Twelve people are in the channel. Engineering is reading. Your impulse — and I have been there — is to say *"Yes, on it."* in under two minutes, because that's what a responsive PM does.

[wry] That is what a JIRA-monkey does. A PM does something else.

[firm, slowly] A PM asks three questions. Out loud. In the doc. Before any commitment.

[matter-of-fact] Question one. *Whose problem is this, really?* If the answer is *"a few customers asked,"* you don't have a problem yet, you have a request. Find out — is this two warehouse customers worth ten lakhs a year, or is it twenty customers worth three crores? Both are real numbers. Only one moves the roadmap.

[matter-of-fact] Question two. *What outcome would tell us this worked?* A Hindi UI is an output. The outcome might be *"warehouse customer activation up from forty percent to sixty percent within ninety days of signup."* If you cannot define an outcome that this feature would move, the feature is theatre.

[matter-of-fact] Question three. *What do we drop to make room?* Engineers are not infinite. If you say yes to this, what slips? The bulk-edit feature your CS team has been begging for? The audit log that legal needs by August? Name the trade-off out loud. If nothing slips, you were lying about your existing roadmap.

[switching to Hinglish, warm] Founder ne pooch liya — *"yaar, bas chhota sa change hai, ek hafte mein ho jaayega na?"* [pause] Bhai, ek hafte mein kuch nahi hota. Ek hafte mein sirf scope discover hota hai. Engineer ne dekha — translation files chahiye, language picker chahiye, RTL nahi but font swap chahiye, customer-facing emails bhi Hindi mein chahiye, support ko bhi training chahiye. *"Bas ek hafta"* nikla doh mahine ka project.

[returning to English, dry] You have lived this conversation. The three questions are how you avoid living it again. Ask them out loud, in the doc, *before* the engineer estimates anything.

<!-- EN-ONLY ALTERNATIVE
[dry] Founders love the phrase 'just a small change, one week max.' Engineering knows that one week is when you discover the actual scope. Translation files. Language picker. Font swaps. Customer emails in Hindi. Support training. The 'one week' becomes two months. Asking the three questions before estimating is how you avoid this conversation entirely.
-->

[firm] Translate. Sequence. Push back. Three motions. The push-back is not rude. The push-back is *the entire job.*

---

### Speech block 5 — *Try it and reflect*  *(target 9:20 – 11:00)*

[warm] Time to run the moves on a real ask.

[firm] Pick the next vague request that lands in your DMs or Slack. Doesn't have to be a product ask — a project at college, a feature at work, a side project, your housing-society WhatsApp group asking for *"better communication."* Anything. [pause]

[matter-of-fact] Run the loop, in writing.

[brisk] One. Restate the request as an outcome. *"Better communication"* becomes *"reduce average response time on society maintenance issues from five days to forty-eight hours within ninety days."* Two. Apply the three-question scope test. Whose problem. What outcome. What drops. Three. Write a one-paragraph reply that includes a proposed scope, an owner, a date, and one explicit trade-off.

[wry] Notice what just happened. The original ask had no owner, no metric, no date, no trade-off — just a feeling. Your reply has all four. The conversation has moved from emotion to engineering. [chuckles] Welcome to the job.

[firm] Recap. Move one — outcome over output. State every initiative as the change you want for the user, before you state the thing you'll build. Move two — the three-question scope test. Whose problem, what outcome, what drops. Apply both, every time, even when it feels excessive. *Especially* when it feels excessive.

[gentle] Five takeaways. [pause] One. The PM job is translation plus sequencing. Tickets and standups are byproducts. Two. Output is countable; outcome is informative. Count the second. Three. Every initiative needs a measurable outcome before you brainstorm features. Four. The three-question scope test — whose problem, what outcome, what drops — survives any Slack thread. Five. Pushing back is not rude; pushing back *is the job.*

[warm] Reflection prompt. *Look at your last week. How many of your decisions were about output, and how many were about outcome?* [pause] Be honest. Most first-year PMs are at ninety-ten in the wrong direction. That's normal. The work of this course is to flip it.

[wry] Lesson two — talking to users without getting lied to. [dry] Spoiler — they will lie. Politely. With smiles. We will learn to hear the truth anyway.
