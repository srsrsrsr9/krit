# Lesson 3 — The Hallucination Problem

**Target duration:** ~11:00
**Chapter marks (sec):** 0 / 80 / 220 / 410 / 560

---

## SCENE

Same Bengaluru classroom, mid-week. The lecturer is a little quieter today, a little more pointed. This is the lesson where the course gets serious — the one where they have seen too many products rolled back to be glib about it. Calm, dry, occasionally firm; the energy of *let me tell you what is actually shipping and what is actually getting shipped to court.* Indian-English accent.

## SAMPLE CONTEXT

The listener has the mental model from lesson one (fast pattern-matcher, no memory) and the prompt structure from lesson two (R-C-T-F-E, few-shot dominates). They have written one good prompt this week. Today we explain why even a perfectly-prompted model will, sometimes, confidently produce a citation that does not exist — and what to actually do about it. Indian-English accent throughout — same lecturer.

## SPEAKER 1

**Recommended voice (true Indian accent):**
- Google Cloud TTS — `en-IN-Chirp3-HD-Charon` *(default)*
- Azure — `en-IN-PrabhatNeural`
- ElevenLabs — *Niraj (Indian English Male)*

**Fallback in Gemini Composer:** Charon *(Informative)* with `[Indian-English accent, calm Bengaluru lecturer tone]` prepended to the first speech block.

**Temperature:** `0.85`

---

### Speech block 1 — *Opening: confident liars and the cost of being wrong*  *(target 0:00 – 1:20)*

[Indian-English accent, calm Bengaluru lecturer tone] [matter-of-fact] Lesson three. The hallucination problem. The single biggest reason AI features get shipped on Monday and rolled back on Friday.

[dry] You have probably already met the failure mode. You ask the model for something specific. It produces something specific. The output looks correct. You ship it. A week later somebody — a customer, a regulator, a journalist — points out that the citation is fake, the API endpoint doesn't exist, the case law was invented. [pause] The model wrote *the most plausible-looking* answer. Plausible is not the same as true.

[firm] Today we are going to do three things. We are going to explain *why* hallucination happens — because it is structural, not a bug. We are going to give you the canonical fix, RAG. And we are going to talk about when even RAG is not enough, and the right answer is to refuse the use case entirely.

[wry] One mental model — *hallucination is structural, not a defect.* Two named moves — *retrieval-augmented generation,* known to its friends as RAG, and *refuse-the-use-case judgment.* Plus one named trap — *the confident liar shipped to customers,* which has cost more product launches than any other AI mistake in the last two years.

[curious] By the end of this lesson, you will have an opinion about every AI feature pitch you hear — *does this need RAG? does this need human review? does this need to not be built?*

[emphatic] Take sides. The cost of being neutral here is enormous.

---

### Speech block 2 — *Mental model: why hallucination is structural*  *(target 1:20 – 3:40)*

[thoughtful] Hallucination is not a temporary defect that better models will fix. It is a direct consequence of how LLMs work.

[matter-of-fact, slowly] Three facts. The model produces the *most probable* continuation of your prompt. *Most probable* and *true* overlap most of the time but not always. The model has no internal mechanism to verify truth — only patterns of how true-sounding text *looks.*

[firm] So when you ask *"cite three Indian Supreme Court rulings on data-protection liability,"* the model produces three citations that follow the *pattern* of Supreme Court citations — case name in the right format, year in the right range, parties in the right shape. Some may be real. Some are fictional but follow the pattern perfectly.

[wry] The model is not lying. *Lying* requires intent and knowledge of truth. The model has neither. It is producing the most probable next token, and *the most probable next token after "v." in a Supreme Court citation* is some plausible-looking surname, regardless of whether that case actually exists.

[curious] This is why hallucinations are so confident. The model can't be uncertain about the truth of its output, because it has no concept of truth. It is uncertain only about *which probable continuation to pick.* And on that, it is highly confident.

[firm, slowly] Hallucination is what happens when the model's confidence in *pattern* is interpreted as confidence in *fact.* That interpretation is yours, not the model's.

[matter-of-fact] One more thing. Hallucination rate goes *down* with frontier models, but it does not go to zero. A 2026 frontier model might hallucinate on five percent of citations. Five percent is too high for a citation. Five percent is *fine* for brainstorming taglines. The hallucination rate is not the issue; the *cost of one wrong output in your use case* is the issue.

[switching to Hinglish, warm] Hostel ka ek topper hota tha. Tu kuch bhi pucho — confident jawab. Last 4 ranks UPSC ke kaunsa? — *"Aman Sharma, Pranav Goyal, Kavya Iyer, Aditya Singh."* Bhai impressed. [pause] Phir tu Google kara — sab fake names. Topper ne *probable Indian names* generate kar diye in *probable order.* Confidence high. Truth zero.

[returning to English, dry] Every batch had this person. The model is the same. Pattern recognition is real. Verification is not. If you want verified output, you need to give the model the verified source — that's what we'll do next.

<!-- EN-ONLY ALTERNATIVE
[dry] Every classroom had that one student who could answer any question with confident detail — half of which was made up. The model is the same. Without retrieval, it generates plausible patterns. With retrieval, it cites real documents. Confidence is identical in both cases; truth diverges.
-->

---

### Speech block 3 — *Move 1: RAG (retrieval) as the real fix*  *(target 3:40 – 6:50)*

[firm] Move one. Retrieval-Augmented Generation. RAG. The canonical structural fix for hallucination.

[matter-of-fact, slowly] The shape is simple. Before the model generates an answer, you *retrieve* the relevant documents from a real source — your company's docs, the actual judgments database, the official RBI circulars — and you paste them into the context window. Then you ask the model to answer *based only on the retrieved documents.* You ask it to cite the documents in its answer.

[curious] Now the model is doing a different task. Instead of *"generate a plausible-looking answer about RBI circulars,"* it's doing *"summarize and cite this specific document I just gave you."* Summarization with citation is a transformation task. Transformation tasks are what the model does well. Hallucination drops dramatically — not to zero, but to a tiny fraction of what it was.

[firm] *RAG with citations is not optional in any regulated domain.* Legal, medical, financial, regulatory. Any feature where the answer might be repeated by a customer, an employee, or a regulator. RAG is the entry ticket.

[matter-of-fact] How RAG actually works, in three lines. One — you store your documents in a *vector database*; each document gets an embedding, which is a numeric fingerprint of its meaning. Two — when a user asks a question, you embed the question, find the most similar documents, and retrieve them. Three — you stuff those documents into the context window with the prompt and ask the model to answer using only them. [pause] That's it. Vector DB, similarity search, context injection.

[curious] The pieces you have to get right. *Chunking.* Split your documents into chunks small enough to fit several into context, big enough to be self-contained. Two hundred to eight hundred tokens is the usual sweet spot. *Embedding model.* Use a known good one; don't roll your own. *Retrieval count.* Pull five to fifteen chunks per query, not one. The model is good at ignoring irrelevant chunks; it cannot conjure missing ones.

[matter-of-fact] *Citation enforcement.* The prompt should require the model to cite the source for every claim — chunk number, document name, line range. If the model can't cite it, it shouldn't claim it. This single rule is responsible for most of RAG's quality gain.

[firm] The places teams get RAG wrong. *Bad chunking* — chunks that split mid-sentence or mid-table. *Stale index* — the underlying docs got updated; the vector DB didn't. *No citation enforcement* — the model is allowed to "synthesize" beyond the retrieved chunks, and you're back to hallucination through the back door. *Single retrieval, no re-ranking* — you pulled five chunks but didn't re-order them by relevance, so the most useful chunk is buried.

[wry] Most "RAG didn't work for us" stories are one of those four. RAG itself works. The implementation is where it fails.

[switching to Hinglish, warm] Tu ne dal makhani banayi. Bhabhi-ji ko bhej ke pucha — *"recipe sahi hai?"* Bhabhi-ji ne phone pe bola — *"haldi 1 chamach, kasoori methi 2 chamach."* [pause] Real cookbook (RAG) — *"haldi half teaspoon, kasoori methi crushed 1 tablespoon."* Bhabhi-ji ka jawab plausible tha. Cookbook ka jawab grounded hai. Tu kis pe trust karega when stakes high? Catering ka order ho toh cookbook. Casual dinner ho toh Bhabhi-ji bhi chalti hai.

[returning to English, dry] Same with the model. Memory-only generation is Bhabhi-ji's recipe. RAG is the cookbook open on the counter. Stakes decide which one you reach for.

<!-- EN-ONLY ALTERNATIVE
[dry] A family member's recipe-from-memory works fine for a casual dinner. A printed cookbook is what you reach for when catering for fifty people. Same input, very different failure modes. The model without RAG is the recipe-from-memory; RAG is the open cookbook on the counter.
-->

---

### Speech block 4 — *Move 2: when to refuse the use case entirely*  *(target 6:50 – 9:20)*

[firm] Move two. Refuse the use case.

[matter-of-fact, slowly] Sometimes RAG is not enough. Sometimes the cost of one wrong output is so high that even a small residual hallucination rate is unacceptable. In those cases, the right answer is not *better prompting,* it is not *more eval data,* it is not *escalate to a bigger model.* The right answer is *don't ship.*

[wry] This is the part of the lesson where I lose half the audience. Refusing to build is professionally unattractive. Building is celebrated. Refusing is the reason your competitor's name shows up in a regulatory order, not yours.

[curious] What does *refuse the use case* actually mean in practice? Three patterns.

[matter-of-fact] *Pattern one — refuse outright.* The use case is fundamentally unsuited to AI. AI-generated final medical diagnoses presented to patients without clinician review. AI-drafted legal contracts signed without lawyer review. AI-determined loan denials without human appeal path. These are not "make the prompt better" problems. These are "this is the wrong tool" problems.

[firm] *Pattern two — narrow the use case until it fits.* Don't ship AI-generated final medical diagnoses; ship AI-suggested differential diagnoses for clinician review. Don't ship AI-drafted contracts; ship AI-summarized contract clauses that the lawyer reads first. Don't ship AI loan denials; ship AI-flagged risk factors that a human underwriter weighs. Same domain, different feature, ten times more shippable.

[matter-of-fact] *Pattern three — human-in-the-loop, every output.* The AI drafts. The human reviews and ships. This is not a *limitation* of the AI; it is the *design.* HITL features ship in regulated domains every day. Pure-AI features in those same domains get rolled back.

[firm, slowly] Three questions to ask before you build any AI feature. [pause] One — *what is the cost of one wrong output?* If the answer involves the words "lawsuit," "patient harm," "regulatory penalty," or "front page of the newspaper," go straight to refuse-or-narrow. Two — *can the user catch a wrong output cheaply?* If the user is a domain expert reviewing AI output, hallucination is annoying but not catastrophic. If the user is a non-expert receiving AI output as gospel, you need RAG plus HITL plus citation. Three — *is there a human review path?* If yes, you can ship. If no, you should narrow until the answer is yes.

[curious] These three questions, in this order, will save you from the next major rollback in your career.

[switching to Hinglish, warm] Doctor-Aunty ke paas beta gaya. Bukhar hai. Tu Google kiya — *"could be malaria, dengue, typhoid, viral, COVID."* Kuch bhi possibility hai. Doctor-Aunty ne pucha — *"kab se? body ache? rash? travel history? appetite?"* Specific symptoms ke saath, narrows down. *RAG vs no RAG ka real-life version.* [pause] Lekin sometimes Doctor-Aunty bole — *"yeh case mere scope mein nahi hai. Specialist ke paas jao."* That is *refuse the use case.* Doctor-Aunty ne bigger reputation banayi by refusing the cases she shouldn't take.

[returning to English, dry] Refusing is also a deliverable. The best AI engineers in any company are not the ones who ship the most features. They are the ones who refuse the right ones.

<!-- EN-ONLY ALTERNATIVE
[dry] Googling symptoms gives you generic possibilities. A specialist with patient-specific retrieval gives you a grounded answer. A great specialist sometimes also says "this is not my scope, see someone else." That third move — refusing the case — is what separates good engineers from great ones in AI.
-->

[firm] Named trap. *The confident liar shipped to customers.* Launched without RAG, or with bad RAG, confident outputs, mostly correct, occasional egregious failure. Screenshot, Twitter, rollback. The fix is not tighter prompting. The fix is RAG, HITL, or refusal. Most teams reach for prompt tweaks because they're cheaper. Prompt tweaks are not the fix when the failure mode is hallucination.

---

### Speech block 5 — *Try it, reflect, and where you are now*  *(target 9:20 – 11:00)*

[warm] Pick one AI feature your team is currently shipping or planning to ship. Five minutes.

[firm] Run it through the three questions. *What is the cost of one wrong output? Can the user catch a wrong output cheaply? Is there a human review path?* [pause] Write the answers down.

[matter-of-fact] Now look at what you wrote. If the cost is high, the user can't catch errors, and there is no human review — you have a rollback waiting to happen. The most useful thing you can do this week is escalate this honestly to your team, with a proposed narrow-the-scope or add-HITL alternative.

[curious] If the cost is low, errors are cheap to catch, or there is a robust review path — congratulations, you are in the safe zone. Add citation enforcement and ship with confidence.

[wry, slowly] Where you are now. [pause]

[warm] You walked in believing hallucination was a bug that would get fixed by the next model release. You are walking out with — one mental model. *Hallucination is structural; the model has no concept of truth.* Two named moves — *RAG with citation enforcement,* and *refuse the use case when the cost is too high.* Plus one named trap — *the confident liar shipped to customers,* and a three-question test to avoid it.

[firm] That's the trust-calibration playbook. [emphatic] Use it before the next launch.

[brisk] Five takeaways. [pause] One. Hallucination is structural — the model produces probable text, not true text. Two. RAG with citations is the canonical fix in any regulated domain — not optional. Three. Most "RAG didn't work" stories are bad chunking, stale index, no citation enforcement, or no re-ranking. Four. Sometimes the right answer is to refuse the use case or narrow it until human review is in the loop. Five. The three questions before any AI launch — *cost of wrong output, user's ability to catch it, presence of review path.*

[gentle] The reflection prompt. *In the last six months, what is one AI feature you've heard of (yours or someone else's) that should have been refused, narrowed, or wrapped in HITL — and wasn't?* [pause]

[warm] Notice the answer. Notice that you can now articulate *why* it should have been refused. That is the whole skill of this lesson.

[wry, slowly] Next lesson — when AI is the right tool at all. The framework that picks features for you in sixty seconds. [pause] See you there.
