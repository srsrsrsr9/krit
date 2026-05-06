# Lesson 2 — Prompting Without the Cargo Culture

**Target duration:** ~11:00
**Chapter marks (sec):** 0 / 80 / 220 / 410 / 560

---

## SCENE

Same Bengaluru classroom, second day of the course. The lecturer has had two coffees and is now mildly impatient with the state of the *prompt engineering* discourse on LinkedIn. Tone is dry and slightly conspiratorial — *let me show you what's actually moving the needle and what's just theatre.* Indian-English accent, calm Bengaluru lecturer.

## SAMPLE CONTEXT

The listener has just finished lesson one. They now have the mental model — fast pattern-matcher, no memory, prompts are the API. They've also tried two prompts and seen the difference between transformation and citation. This lesson hands them the actual prompt structure used by people who ship working AI features. Indian-English accent throughout — same lecturer as previous lesson.

## SPEAKER 1

**Recommended voice (true Indian accent):**
- Google Cloud TTS — `en-IN-Chirp3-HD-Charon` *(default)*
- Azure — `en-IN-PrabhatNeural`
- ElevenLabs — *Niraj (Indian English Male)*

**Fallback in Gemini Composer:** Charon *(Informative)* with `[Indian-English accent, calm Bengaluru lecturer tone]` prepended to the first speech block.

**Temperature:** `0.85`

---

### Speech block 1 — *Opening: most prompts are vague*  *(target 0:00 – 1:20)*

[Indian-English accent, calm Bengaluru lecturer tone] [matter-of-fact] In lesson one, we established that the prompt is the API. Today we are going to talk about how most people are using that API badly — and the five-part structure used by the people whose AI features actually ship.

[wry] You have seen the LinkedIn posts. *"Just add 'You are an expert' before any prompt."* *"Add 'take a deep breath, think step by step.'"* *"Use this 87-line system prompt I just drafted in five minutes."* [pause] Some of this is harmless. Some of it is cargo cult — copying the surface ritual of an AI engineer without understanding which parts are doing the work.

[dry] Today we are going to separate the ritual from the lever. There is one lever in prompting that does roughly eighty percent of the work. We will name it. The rest is decoration. Useful decoration sometimes — but decoration.

[firm] By the end of this lesson, you will be able to look at any prompt — yours, your team's, the one in the LinkedIn screenshot — and tell, in about thirty seconds, which parts are load-bearing and which parts are theatre.

[curious] One mental model — *prompts are an API, not a wish.* Two named moves — *the five-part structure,* and *few-shot examples as the dominant lever.* Plus one named trap — *the just-ask-nicely fallacy,* which is responsible for ninety percent of the *AI is dumb* complaints I have heard this year.

---

### Speech block 2 — *Mental model: prompts are an API*  *(target 1:20 – 3:40)*

[thoughtful] Treat your prompt like an API contract, not a request to a person.

[matter-of-fact] When you call a function in Python, you don't write *"hey function, please do something nice with this list."* You write the function name, the arguments, the types, the expected return shape. The function does exactly what you specified — no more, no less.

[firm, slowly] The model is the same. It reads patterns. Vague phrasing produces vague outputs that match the vagueness. Precise phrasing produces precise outputs. There is no extra credit for politeness, and no penalty for being direct. Be direct.

[wry] I want to repeat this because it sounds obvious and it isn't. Most professional prompts I read in companies still start with *"Hi! Could you please…"* and end with *"…thanks so much!"* This is not wrong. It is just not load-bearing. The model is not making decisions based on whether you said *please.*

[curious] Here is the rule of thumb. Every production prompt should answer five questions explicitly. *Role* — who is the model being? *Context* — what is the situation? *Task* — what specifically do I want produced? *Format* — in what shape? *Examples* — show me one or three.

[matter-of-fact] R, C, T, F, E. Five letters. The next two chapters are about how to use them.

[switching to Hinglish, warm] Tu darji ke paas gaya. Bola — *"shirt banao."* [pause] Darji puchega — *"size? cloth? colour? collar style? sleeves? aage button ya peeche zip?"* Agar tu sab confidently nahi bata sakta, darji ka best-guess shirt aayegi. Probably fit nahi hogi. Tum complaint karoge — *"darji bekaar hai."*

[returning to English, dry] The tailor is fine. The specifications were missing. Same with prompts. Role, context, task, format, examples — those are the model's measurements. Walk in without them and you get a generic shirt. Walk in with them and you get yours.

<!-- EN-ONLY ALTERNATIVE
[dry] Walking into a tailor and saying "make me a shirt" produces a generic shirt. Walking in with measurements, fabric choice, collar style, button placement produces YOUR shirt. The tailor's skill is identical in both cases. The specifications were not. The model is the tailor.
-->

---

### Speech block 3 — *Move 1: the five-part prompt structure*  *(target 3:40 – 6:50)*

[firm] Move one. The five-part prompt. R, C, T, F, E. We're going to walk through each one, with a concrete example, because abstract prompt advice is the entire problem we're trying to fix.

[matter-of-fact, slowly] *R — Role.* The first sentence of the prompt assigns the model an identity. *"You are a senior Krit course author writing in a dry, opinionated lecturer voice."* This anchors voice, register, and implicit standards. It is not magic. It is just useful. The model has read every register of English; tell it which one you want.

[curious] *C — Context.* The situation, the constraints, the prior decisions. *"The audience is Indian young professionals, twenty-two to thirty-five, who have read lesson one of the AI Fundamentals course. They already know that LLMs are pattern-matchers."* Now the model is not guessing the audience or the prior context. You have set the table.

[matter-of-fact] *T — Task.* The specific output you want. *"Draft three cultural-aside variants for the lesson on prompting."* Specific verb. Specific count. Specific subject. The most common bug I see is people writing T as *"help me with my prompts."* That's not a task. That's a vibe. The model can't fulfil vibes precisely; it will hallucinate the specifics.

[firm, slowly] *F — Format.* The shape of the response. *"Output as a JSON object with keys hindi and english, each containing a string of no more than two hundred characters."* The model now knows exactly what to return. Your downstream code can parse it. No regex on natural language. No guessing.

[matter-of-fact] *E — Examples.* This is the one that does most of the work, and it gets its own chapter. For now, just know that the prompt should end with one or three worked examples — input and the desired output — so the model has a concrete pattern to match.

[wry] If you skip R, the voice will be generic. If you skip C, the answer will be generic. If you skip T, the answer will be off-target. If you skip F, your code will need post-processing. If you skip E — we'll get to that.

[curious] One example, end to end. You want the model to triage incoming customer emails into five categories. The bad prompt — *"please classify these emails into categories."* The good prompt — *"You are a customer-support triage agent for a fintech company. The five categories are: KYC issue, transaction failure, account access, fraud report, general inquiry. For each email, return a JSON object with category, confidence (0 to 1), and reason. Here are three examples." Then you paste the three examples.* [pause] Same model. Hours of difference in output quality.

[firm] Notice what is *not* on the list. *Take a deep breath. Think step by step. You are an expert. This is very important.* Frontier models in 2026 do step-by-step reasoning internally for non-trivial tasks. Adding the phrase to every prompt is the cargo cult. It costs you tokens, occasionally helps a little, mostly does nothing.

[matter-of-fact] R, C, T, F, E. That's the structure. Use it for any prompt that matters.

---

### Speech block 4 — *Move 2: few-shot examples are the real cheat code*  *(target 6:50 – 9:20)*

[firm] Move two. Few-shot examples. The single highest-leverage thing you can do to a prompt.

[matter-of-fact] *Few-shot* means giving the model one, three, or five worked examples of input and the desired output, before the actual input it should respond to. *Zero-shot* means just describing the task in words. The difference in output quality is, in my experience, the largest single lever in prompting.

[wry] Bigger than role. Bigger than context. Bigger than any clever instruction. One good example moves the model more than ten paragraphs of *please be helpful and accurate.*

[curious] Why? Because the model is a pattern-matcher. Words describing a pattern are weaker signal than the pattern itself. If you want emails classified into five categories, telling the model the categories is fine — but showing the model three classified emails *is the categorization rule itself in machine-readable form.*

[firm, slowly] One example moves quality. Three examples is usually the sweet spot for classification, extraction, and stylistic tasks. More than five rarely helps for most use cases — diminishing returns kick in fast.

[matter-of-fact] How to pick the examples. *Cover the variation.* If your inputs vary on three dimensions — short versus long, formal versus casual, in-domain versus edge-case — your three examples should span that variation. One short formal in-domain. One long casual in-domain. One edge-case. The model now has the pattern *and* the boundary.

[curious] *Show the format precisely.* Whatever shape you want the output in, your examples should be in exactly that shape. JSON keys named the same way. Same casing. Same fields. The model will copy your examples' format, down to the punctuation.

[matter-of-fact] *Include one mildly tricky example.* Edge cases in your few-shot teach the model how to handle ambiguity. Don't just show the easy ones. Show the *almost-but-not-quite* one and how you'd want it labelled.

[firm] One example, end to end. You're building an email classifier. Bad few-shot — three identical-shaped emails, all clearly fraud reports. Good few-shot — one obvious KYC issue, one ambiguous transaction-failure-or-fraud edge case with the *correct* label and a short reason, and one borderline general inquiry. The model now has the rule and the boundary.

[switching to Hinglish, warm] Aunty WhatsApp pe forward karti hai *"yeh recipe banao."* Bas link hai. Tu pucha kis ke liye, kitne log, masala chahiye nahi, taste kya — Aunty bole *"beta tu figure out kar na."* Result — tu kuch bhi banata hai, woh complain karti hai *"tu ne meri jaisi nahi banayi."* [pause] Tab tu kya karega? Tu Aunty se ek baar puchke ek photo le leta hai. *"Aise dikhna chahiye?"* Aunty ne haan bola. Ab pattern lock hai.

[returning to English, dry] One photo of the desired output is worth ten paragraphs of "please make it nice." Same with prompts. Few-shot examples are that photo. They are the dominant lever. Everything else is decoration.

<!-- EN-ONLY ALTERNATIVE
[dry] Family WhatsApp "make this recipe" messages without specs produce dishes that miss the mark. The fix is one photo of the desired result, plus a 30-second clarification. The photo is the few-shot example. It moves quality more than any amount of "please be helpful" framing.
-->

[firm] Named trap. *The just-ask-nicely fallacy.* Politeness has zero effect on quality. Specifications have all the effect. Be polite if you want; just don't pretend the politeness is the lever.

---

### Speech block 5 — *Try it, reflect, and where you are now*  *(target 9:20 – 11:00)*

[warm] Open the same model you used in lesson one. Pick one of your own real-world tasks. Five minutes.

[firm] Step one. Write the prompt the way you would have written it last week — quickly, vaguely, *be helpful please.* Run it. Save the output.

[matter-of-fact] Step two. Rewrite the same prompt with R, C, T, F, E. Add three few-shot examples. Run it. Save the output. [pause] Compare.

[curious] You will see one of two things. Either the second version is significantly better — in which case, that's your standard from now on. Or the second version is not noticeably better — in which case, the task was easy enough that the structure didn't matter. Both are useful data points.

[wry, slowly] Where you are now. [pause]

[warm] You walked in believing prompt engineering was a mystery, or a scam, or both. You are walking out with — one mental model. *Prompts are an API, not a wish.* Two named moves — *the five-part structure (R-C-T-F-E),* and *few-shot examples as the dominant lever.* Plus one named trap — *the just-ask-nicely fallacy.*

[firm] That's the prompting playbook. [emphatic] Use it.

[brisk] Five takeaways. [pause] One. Prompts are an API contract; vague prompts get vague outputs. Two. R, C, T, F, E — role, context, task, format, examples — covers ninety percent of what matters. Three. Few-shot examples are the single highest-leverage move; one good example beats ten paragraphs of instruction. Four. *Think step by step* and *take a deep breath* are cargo cult in 2026; frontier models reason internally by default. Five. Politeness is fine but not load-bearing.

[gentle] The reflection prompt. *Pick one prompt you wrote in the last week. Which of the five parts did you skip? Which one would have helped most?* [pause]

[warm] If you can answer that honestly, you have just upgraded a real workflow. Most people in your office are still writing *please be helpful* and complaining the model is dumb. You will now be the person whose AI workflows actually work.

[wry, slowly] Next lesson — hallucination. Where your perfectly-structured prompt produces a perfectly-structured citation that doesn't exist. [pause] See you there.
