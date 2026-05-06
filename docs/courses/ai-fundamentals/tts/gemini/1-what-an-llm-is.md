# Lesson 1 — What an LLM Actually Is (And What It Isn't)

**Target duration:** ~11:00
**Chapter marks (sec):** 0 / 80 / 220 / 410 / 560

---

## SCENE

A Bengaluru classroom on a humid Tuesday afternoon. The lecturer is opening a five-lesson run on AI — and they have heard exactly enough hype this quarter to last a lifetime. Calm, dry, slightly bemused at how much money is being spent on misunderstanding the same three sentences. Speaks with a warm Indian-English accent. The energy is *first day of a course where the lecturer wants you to unlearn before you learn.*

## SPEAKER 1

**Recommended voice (true Indian accent):**
- Google Cloud TTS — `en-IN-Chirp3-HD-Charon` *(default)*
- Azure — `en-IN-PrabhatNeural`
- ElevenLabs — *Niraj (Indian English Male)*

**Fallback in Gemini Composer:** Charon *(Informative)* with `[Indian-English accent, calm Bengaluru lecturer tone]` prepended to the first speech block.

**Temperature:** `0.85`

---

### Speech block 1 — *Opening: the hype, the math, the gap*  *(target 0:00 – 1:20)*

[Indian-English accent, calm Bengaluru lecturer tone] [matter-of-fact] Welcome to AI Fundamentals. Five lessons. By the end you will know what an LLM is, how to prompt it, when it lies, when to refuse it, and how to build a workflow around it that doesn't fall apart in production. [pause]

[wry] We are starting here, with the most basic question in the whole course, because almost everything that goes wrong with AI in industry — wrong feature shipped, wrong customer expectation set, wrong rollback in week six — traces back to the wrong mental model in week one.

[dry] You have heard, this year alone, that LLMs are *almost AGI*, *the next electricity*, *thinking machines*, and *a junior engineer in a box*. [pause] [emphatic] None of these are accurate. All of them are expensive.

[thoughtful] Here is the actual sentence. An LLM is a function that takes a sequence of tokens and outputs probabilities for the next token. That is the entire engine. Everything else — agents, RAG, tools, memory, *vibes* — is engineering scaffolding bolted on top.

[curious] One mental model. Two named moves. *Tokens, context, temperature in plain English.* And *the capability map — what it can and cannot do.* Plus one named trap, the magic black box, that has cost more product roadmaps than any other AI mistake.

[firm] By the end of this lesson, you will be able to look at any AI feature pitch — yours or your colleague's — and tell, in about thirty seconds, whether the underlying request even matches what the technology can do.

---

### Speech block 2 — *Mental model: a fast pattern-matcher with no memory of yesterday*  *(target 1:20 – 3:40)*

[thoughtful] Treat the model as a very fast pattern-matcher with no memory of yesterday.

[matter-of-fact] It read, during training, roughly the internet's worth of text. Books, code, Stack Overflow, judgments, recipes, your old Reddit posts. From all of that it learned one thing — given some words, what tends to come next. That's it. There is no internal database of facts. There is no little person inside checking whether the answer is true. There is a giant statistical engine for *plausible continuation.*

[firm, slowly] Three consequences fall out of this — and these three are doing all the work in the rest of the course.

[matter-of-fact] One. *No memory across conversations.* Each call starts blank. The only memory the model has is whatever you put inside the current context window. Yesterday's conversation, the company's internal docs, the last user's complaint — none of it is in there unless you literally paste it in.

Two. *Confident even when wrong.* The model produces the most probable continuation of your prompt, not the most truthful. These overlap roughly eighty percent of the time. The other twenty percent is the entire reason this course exists.

Three. *Performance is contextual.* Same model, different prompt, wildly different output. The prompt is the API.

[wry] Notice what is *not* on this list. Reasoning. Understanding. Knowing. [pause] Those are words humans use about humans. The model is doing something that, on the surface, *looks* like reasoning — and on the surface is exactly where the trouble starts. We will get into where the surface breaks down throughout the course.

[switching to Hinglish, warm] Hostel mein ek topper hota tha — har sawaal ka confident jawab. Tu pucha *"Aurangzeb ka birth year?"* Wo bola *"1618."* Sahi hai. Tu pucha *"Tu ne ye kahaan padha?"* Wo bola *"NCERT Chapter 7 mein hai."* [pause] Galat ho sakta hai. **Confidence equal to truth nahi hai.** LLM bilkul same hai. Probability nikalta hai phrase aati hai — high probability. Verify karne ka mechanism nahi hai.

[returning to English, dry] Confidence is a feature of the next-token math, not of the underlying truth. Calibrate your trust accordingly.

<!-- EN-ONLY ALTERNATIVE
[dry] Every batch had that one student who answered every question with the same confident voice — including the questions they had no idea about. The model is the same. Confidence is built into how it generates. Truth is not. Calibrate accordingly.
-->

---

### Speech block 3 — *Move 1: tokens, context, temperature in plain English*  *(target 3:40 – 6:50)*

[firm] Move one. The three words that decide every interaction with the model. *Tokens. Context. Temperature.* You will hear these in every meeting; most people in those meetings don't know what they actually mean. Let's fix that.

[matter-of-fact, slowly] *Tokens.* The model does not see characters. It does not see words. It sees *tokens* — chunks of text, roughly four characters or three-quarters of a word in English. *Bengaluru* is one token. *Krit* might be one or two. Hindi text often takes more tokens per character than English. [pause] Why do you care? Because pricing is per token. Context limits are in tokens. Speed is per token. The token count is the meter running on every API call.

[curious] *Context.* The context window is the model's short-term memory for this single call. Modern frontier models have context windows from one hundred twenty-eight thousand to over a million tokens. Sounds like a lot. It is also the *only* memory the model has for this call. If you didn't put it in the context, the model doesn't know it. [pause] No, it doesn't remember last week's conversation. No, it doesn't know your customer's order history. No, it doesn't know the new policy you wrote on Monday — unless you pasted it in.

[matter-of-fact] *Temperature.* A number, usually between zero and one, sometimes up to two. Temperature controls how much the model samples from less-probable continuations. Temperature zero — the model picks the single most likely next token, every time. Same input, almost the same output. Boring. Predictable. Good for code, classification, structured extraction.

[firm] Higher temperature — say zero point seven, zero point nine — the model samples more freely. Same input, different output each time. Good for creative writing, brainstorming, anything where you actually want variety.

[wry] Most production AI features that *feel* unreliable are running at temperature zero point seven when they should be running at zero. Most AI features that *feel* boring are running at temperature zero when they should be at zero point five. Get this knob right and half your problems go away before you've written a single eval.

[curious] One more. *Streaming.* The model produces one token at a time. You can either wait for the whole response, or stream tokens to the user as they arrive. Streaming feels twice as fast even though the total time is identical. This is a UX decision masquerading as a technical one.

[firm] That's the API surface. Tokens, context, temperature, streaming. Four words. Anyone using more jargon than that is either (a) building the model, or (b) selling you something.

---

### Speech block 4 — *Move 2: the capability map — what it can and cannot do*  *(target 6:50 – 9:20)*

[firm] Move two. The capability map. What this thing can do, what it absolutely cannot do, and what it can do *with help*. [pause] If you remember nothing else from this lesson, remember the map.

[matter-of-fact, slowly] *Things LLMs do well, out of the box.* One — *transformation tasks.* Take input X, give me output Y in a different format. Summarize this email. Translate this paragraph. Convert this JSON to a table. The model is excellent at these because the answer is implicit in the input.

Two — *style and tone matching.* Rewrite this in the voice of a polite Indian customer-support agent. Make this sound less corporate. The model trained on every register of English; it can do them all.

Three — *brainstorming and ideation.* Give me twenty taglines for a credit card aimed at first-time earners. The model isn't *picking the best* — it is generating plausible variations and you are picking. That's the right division of labour.

Four — *code in popular languages.* Python, JavaScript, SQL — well. Rust, Haskell, COBOL — less well. Anything internal to your company — not at all, unless you provide it.

[curious] *Things LLMs do badly out of the box.* One — *anything requiring fresh facts.* The model's knowledge is frozen at training time, which was months ago at minimum. It does not know yesterday's news. It does not know your inventory. It does not know what you told the customer last Tuesday.

Two — *arithmetic past about three digits.* Sounds embarrassing for a trillion-parameter model; it is. Use a calculator tool.

Three — *citations.* The model will produce plausible-looking citations that don't exist. We have an entire lesson on this — lesson three. For now, just internalize that *citation* and *source* are the words where models lie most confidently.

Four — *anything requiring you to be wrong only sometimes.* If your use case requires the model to be right ninety-nine point nine percent of the time, and the model is right ninety-five percent of the time, the gap is not closeable by better prompting. We will talk about when to refuse the use case in lesson four.

[matter-of-fact] *Things LLMs can do with help.* Fresh facts — give it retrieval, otherwise known as RAG. Arithmetic and code execution — give it tools. Long workflows — give it scaffolding, sometimes called agents. Domain knowledge — give it your documents in the context window.

[wry] Almost every successful production AI feature in 2026 is in the *can do with help* column. The features stuck in pilot are the ones whose teams thought they were in the *out of the box* column.

[firm] Named trap. *The magic black box.* Stakeholder asks *"can AI do X?"* and the answer *"maybe, depends on…"* gets compressed into *"yes"* by the time it reaches the demo. The model is a fast pattern-matcher with no memory of yesterday. Phrase your asks against that mental model and you will be right ninety-five percent of the time about what to build, and wrong zero percent of the time about what to refuse.

---

### Speech block 5 — *Try it, reflect, and where you are now*  *(target 9:20 – 11:00)*

[warm] Open whichever frontier model you have access to. Two minutes, two prompts.

[firm] Prompt one. Ask it — "give me three Indian Supreme Court rulings on data-protection liability with citations." Read the answer. Look at the citations. *Don't trust them.* Try to find one of them. [pause] You'll see the structural failure mode in about ninety seconds.

[matter-of-fact] Prompt two. Take an email you wrote this morning and ask the model to *rewrite it in three registers — formal, casual, and apologetic.* Read the three. They will be useful. That's a transformation task; the model lives there.

[curious] Two prompts. Same model. Two different worlds. The first one is the failure mode you're going to spend the rest of the course learning to design around. The second one is the value you're going to spend the rest of the course learning to extract.

[wry, slowly] Where you are now. [pause]

[warm] You walked in believing the model was either magic or fraud. You are walking out with — one mental model. *Fast pattern-matcher with no memory of yesterday.* The four-word API surface — *tokens, context, temperature, streaming.* And a capability map with three columns — *out of the box, badly, with help.* Plus one named trap — *the magic black box,* and the discipline to phrase requests against the actual mental model.

[firm] That's the foundation. [emphatic] Everything else is built on top.

[brisk] Five takeaways. [pause] One. The model is a function that predicts the next token; everything else is engineering on top. Two. Confidence and truth are not the same thing inside the model. Three. The four words that decide every interaction are tokens, context, temperature, streaming. Four. The capability map has three columns — *good*, *bad*, *good with help.* Five. Most successful production AI features live in the *good with help* column.

[gentle] The reflection prompt. *Pick one AI feature pitch you have heard recently — at work, on LinkedIn, or in a press release. Which column of the capability map does it actually live in?* [pause]

[warm] If you can answer that honestly — even if the answer is *good with help, and the team is pretending it's out of the box* — you have already learned the most expensive lesson in this course.

[wry, slowly] Next lesson — prompting. Where most teams pretend the magic word is *think step by step,* and the actual lever is something else entirely. [pause] See you there.
