# Lesson 5 — Building an AI-Augmented Workflow

**Target duration:** ~12:00
**Chapter marks (sec):** 0 / 90 / 240 / 440 / 600

---

## SCENE

Friday evening, the last class of the AI Fundamentals course. The Bengaluru classroom is quieter; the lecturer is closing the loop with the satisfaction of someone who has been promising a complete system since Tuesday and is about to deliver it. The mood is *lab-notebook serious* — less philosophy, more practice. Calm, dry, occasionally emphatic when something matters. Indian-English accent throughout.

## SAMPLE CONTEXT

The listener has the mental model (lesson 1), the prompt structure (lesson 2), the hallucination playbook (lesson 3), and the tool-fit framework (lesson 4). They now need the production loop — how to actually build, ship, and maintain an AI feature without it silently degrading. This is the lesson that turns four separate frameworks into a single repeatable practice. Indian-English accent, same lecturer.

## SPEAKER 1

**Recommended voice (true Indian accent):**
- Google Cloud TTS — `en-IN-Chirp3-HD-Charon` *(default)*
- Azure — `en-IN-PrabhatNeural`
- ElevenLabs — *Niraj (Indian English Male)*

**Fallback in Gemini Composer:** Charon *(Informative)* with `[Indian-English accent, calm Bengaluru lecturer tone]` prepended to the first speech block.

**Temperature:** `0.85`

---

### Speech block 1 — *Opening: production AI is a feedback loop*  *(target 0:00 – 1:30)*

[Indian-English accent, calm Bengaluru lecturer tone] [matter-of-fact] Last lesson. Workflow design. The thing that separates *we built an AI feature* from *we shipped an AI feature that still works in three months.*

[wry] Most teams treat AI work as *engineer a prompt.* Sit down, write the prompt, demo it on Friday, ship it on Monday. Production AI is not engineered prompts. Production AI is *engineered loops.* If you cannot draw the feedback loop on a whiteboard, you don't have a workflow — you have a one-shot demo that will drift in production.

[dry] Today we are going to draw the loop. Five stages. Then we are going to talk about the single most important artifact you build on day one — the eval set — and the single most important habit you maintain on day fourteen and every fourteen days after — the audit.

[firm] By the end of this lesson, you will be able to start any AI feature this week, ship it next week, and have a system in place that catches drift before your customers do. That is the entire deliverable.

[curious] One mental model — *engineer the loop, not the prompt.* Two named moves — *the five-stage workflow loop,* and *the fourteen-day production audit.* Plus one named trap — *ship and forget,* which is responsible for almost every silent AI feature degradation in production.

[emphatic] One more thing. Take this seriously. *If you can't write an eval, you can't ship the feature.* That sentence is going to come back three times in this lesson.

---

### Speech block 2 — *Mental model: the loop, not the prompt*  *(target 1:30 – 4:00)*

[thoughtful] Engineer the loop, not the prompt.

[matter-of-fact] A prompt is a one-shot artifact. A loop has feedback. A loop runs forever. A loop is what allows the workflow to *improve* over time, instead of degrading.

[firm, slowly] Five stages. Define the output. Prototype the prompt. Evaluate against held-out examples. Instrument production traffic. Iterate. Then back to define. The loop never closes; it just turns.

[curious] *Stage one — define the output.* Before you write a single prompt, write the output spec. What shape does a *good* output have? What shape does a *bad* one have? What are the ten edge cases? What are the contractual fields if you're producing JSON? You're not writing a prompt yet. You're writing the contract the prompt has to fulfil.

[matter-of-fact] *Stage two — prototype the prompt.* Now you write the prompt. R, C, T, F, E from lesson two. Run it on five examples. Eyeball the output. Iterate quickly. This is the only stage that feels like *prompting* in the popular sense — and it should take an afternoon, not a week.

*Stage three — evaluate against held-out examples.* This is where most teams stop and ship. They shouldn't. You build an eval set — fifty to two hundred hand-labeled examples — and you measure your prompt's output against the labels. Pass rate, precision, recall, depending on the task. The eval set is the contract; the prompt has to clear the contract before it ships.

[firm] *Stage four — instrument production traffic.* When the feature is live, you log every prompt and every response. You sample some percentage — say five percent — and you grade them, either with another model or with a human. You watch the pass rate over time.

*Stage five — iterate.* When the eval set or production grading shows quality dropping, you go back to stage one. You don't just tweak the prompt and re-deploy. You re-examine the output spec; you check if the data distribution has shifted; you update the eval set; then you change the prompt.

[wry] One stage at a time. The discipline is the point. Most teams skip stages three and four — eval and instrumentation — because they feel like the *boring* parts. Those are the parts that make AI features survive.

[switching to Hinglish, warm] Naani ka tiffin service thirty saal chala. Loop yeh tha — Sharma uncle ko less spicy, Patel ji ko Jain food, Kumar ji ko diabetic-friendly. Monday ka tiffin prototype. Tuesday subah feedback. Phone call hota tha agar koi galat tiffin. Wednesday ka tiffin updated. [pause] Naani ne *ML pipeline* phrase kabhi nahi suni thi. Loop chal raha tha. Same shape. Different domain.

[returning to English, dry] Production AI is the same shape, different domain. Define the output, deliver, get feedback, instrument, iterate. The loop has worked for tiffin services since 1900. It will work for your AI feature in 2026. Skip a stage and Naani's customers leave.

<!-- EN-ONLY ALTERNATIVE
[dry] Every successful tiffin service runs the same five-stage loop you need for production AI — define output spec per customer, deliver, get feedback, instrument complaints, iterate. The loop has worked for a century. Production AI is the same shape, different domain. Skip a stage and customers leave.
-->

---

### Speech block 3 — *Move 1: define output, prototype prompt, evaluate*  *(target 4:00 – 7:20)*

[firm] Move one. Stages one, two, three. The build phase. Day one to day three of any AI feature.

[matter-of-fact, slowly] *Stage one — define the output, in concrete terms.* For an email classifier, define the categories — ten or fewer, mutually exclusive, exhaustive. Define the JSON schema — category, confidence, reason. Define what *missing* looks like — *unable to classify* with a reason field. Define the ten edge cases — multilingual, no body, attachments only, replies, automated bounces.

[curious] You're writing the spec the way you would write any API spec. The reason most AI features drift is that the spec was never written down — *category* meant one thing in week one and a different thing in week six because the team's understanding shifted and nobody updated anything.

[matter-of-fact] *Stage two — prototype the prompt.* Five examples. Five iterations. R, C, T, F, E. The prototype should land in three hours, not three weeks. If you're spending three weeks on the prompt, you're missing a few-shot example or your output spec is wrong. Go back to stage one.

[firm] *Stage three — eval set.* Fifty to two hundred hand-labeled examples. Hand. Labeled. *By you, by your team, with the actual ground truth, frozen in a file.*

[emphatic] *If you can't write an eval, you can't ship the feature.* Second time I'm saying that. It will come back once more.

[matter-of-fact, slowly] How to build an eval set in four hours. Pull a hundred real examples from your data. Label them yourself, by hand, with the *correct* output. Mark each one with a difficulty tag — *easy, medium, hard, edge.* Save it as a JSON file. Commit it to the repo. Freeze it.

[curious] Now you have ground truth. Run your prompt against the eval set. Compare. Compute pass rate by tag. *Easy — ninety-five percent. Medium — eighty percent. Hard — fifty-five percent. Edge — thirty percent.* That is your starting line. Every prompt change from now on is measured against the same eval set, so you know whether you're improving or just shifting failures around.

[firm] What happens when teams skip the eval set. They ship. Quality drifts. Users complain. The team scrambles. The post-mortem says *"we don't know what changed because we weren't measuring."* Same post-mortem, written by different teams, every quarter. Don't be in this post-mortem.

[wry] The eval set takes four hours. You will not find four hours that are higher leverage than this in the entire feature lifecycle. Not the prompt iteration. Not the model upgrade. Not the launch announcement. The eval set is the four hours that turn a science project into a product.

[switching to Hinglish, warm] Tu workflow ship karna chahta hai. Time pressure hai. Eval set banane ke liye 4 ghante chahiye. Tu sochta hai *"production traffic se data aa jaayega."* [pause] Yeh trap hai. Production data labeled nahi aata — koi nahi bata raha kis output ne kaam kara, kisne nahi. Tu silently failing hai but pakad nahi paa raha. [pause] Fix — 4 ghante invest kar. 50 hand-labeled examples banao. Yeh frozen ground truth hai. Production traffic ko measure karo against this. Ek baar kar liya, lifelong asset.

[returning to English, dry] Production data is unlabeled. You cannot measure quality against unlabeled data. The four hours you spend hand-labeling fifty examples is the gate that separates *shipping a feature* from *hoping no one notices when it drifts.* Build the eval set first. Ship second.

<!-- EN-ONLY ALTERNATIVE
[dry] Production data is unlabeled. You can't measure quality against unlabeled data. Spending four hours hand-labeling fifty examples is the gate that separates "shipping a feature" from "hoping no one notices when it drifts." Build the eval set first; ship second.
-->

---

### Speech block 4 — *Move 2: the fourteen-day production audit*  *(target 7:20 – 10:00)*

[firm] Move two. The fourteen-day production audit. Stages four and five. The maintenance phase. Day fourteen of any shipped AI feature, and every fourteen days after, forever.

[matter-of-fact, slowly] Once your feature is live, you have two streams of signal. *The eval set,* which is frozen — useful for catching prompt-side regressions but not data-side drift. And *production traffic,* which is real, fresh, and unlabeled — useful for catching the world changing under you.

[curious] The fourteen-day audit is the practice that combines them. Three steps. Twenty minutes per audit. Mandatory.

[firm] *Step one — pull twenty fresh production samples.* Random, not curated. Across the time window. Stratify by user segment if you have one.

[matter-of-fact] *Step two — hand-label them.* You, or someone qualified, labels what the *correct* output should have been. This takes ten to fifteen minutes for twenty samples in most domains.

[firm] *Step three — measure agreement.* What percent of production samples did the AI get right? Compare to your eval-set pass rate. Compare to last fortnight's audit. Track over time.

[curious] Now you have two numbers each fortnight — eval-set pass rate (frozen ground truth) and production-audit pass rate (fresh ground truth). Watch the gap.

*Eval-set rate steady, audit rate dropping?* Data drift. The world changed; your prompt didn't. Time to update the eval set with new examples and re-tune the prompt.

*Both rates dropping?* Prompt regression. Something you changed broke things. Roll back the most recent change.

*Audit rate steady, eval-set rate dropping?* Eval set is becoming irrelevant. Refresh it.

*Both rates climbing?* Congratulations. Don't change anything. Ship more.

[matter-of-fact] Pair this with three alert thresholds. Pass rate drops more than five points in a fortnight — page the on-call. New error pattern appears more than three times in a fortnight's audit — investigate. User-reported complaints exceed your usual baseline by two-x — escalate.

[firm, slowly] Three practices. Eval set on day one. Twenty-sample audit every fourteen days. Three alert thresholds. None of this is glamorous. All of it is non-negotiable for any AI feature past prototype.

[wry] Most teams will tell you they don't have time for the audit. They're right — they don't, until the day a customer screenshots a bad output to Twitter, and then they suddenly have time for a three-week incident response. The fortnightly audit is the cheap insurance that makes that incident impossible.

[emphatic] Third time. *If you can't write an eval, you can't ship the feature.* That sentence is the entire engineering culture you need to import into AI work.

[switching to Hinglish, warm] PG mein mess hai. Mess waala ek hi roti banata hai roz. Eval set — Mummy ka roti. Production traffic — daily 30 logon ko khilana. Mess waala kabhi *"daily roti is fine because no one complained"* bolta hai. Yeh galat hai. Ek din 50 roti ate, agle din 25. Distribution shift ho raha hai. Eval set se measure karna padega. [pause] *Mess ka discipline = production AI ka discipline.* Frozen ground truth, daily measurement, intervention threshold. Bina iske mess band hota hai.

[returning to English, dry] A mess hall isn't *good* because no one complained today. It's good because each batch matches a frozen quality bar — the chef's mom's roti, basically. Same with production AI — ship against an eval set, audit against fresh traffic, intervene at thresholds. The absence of complaints is not evidence of quality. It is evidence that you're not measuring.

<!-- EN-ONLY ALTERNATIVE
[dry] A mess hall isn't "good" because no one complained today. It's good because each batch matches a frozen quality bar — the chef's mom's roti, basically. Same with production AI: ship against an eval set, audit against fresh traffic, intervene at thresholds. Absence of complaints is not evidence of quality.
-->

[firm] Named trap. *Ship and forget.* Most rolled-back AI features were shipped without a monitoring loop. Quality drifted. Users complained. The team scrambled. The post-mortem said *"we don't know what changed because we weren't measuring."* Don't end up in that post-mortem. Eval set on day one. Audit every fourteen days.

---

### Speech block 5 — *Try it, reflect, and where you are now*  *(target 10:00 – 12:00)*

[warm] Pick one AI feature you're working on or planning to work on. Five minutes.

[firm] Three artifacts. *One — write the output spec in three sentences.* What does a good output look like? What does a bad one? What are three edge cases? Two — *list the first ten examples for your eval set, even if you haven't labeled them yet.* You can label them tomorrow morning. Ten is the minimum. Three — *put a recurring fortnightly calendar event* called *AI feature audit* on your calendar, starting two weeks from launch.

[matter-of-fact] If you can do those three things in five minutes, you have started the loop. Most teams haven't. You now have.

[curious] One reframe before you go. *Building the prompt feels like the work.* Building the eval set feels like a chore. The eval set is the work; the prompt is the easy part. If you reverse that intuition, you have the entire engineering culture this lesson is trying to install.

[wry, slowly] Where you are now. [pause]

[warm] Five lessons in. You walked in with hype and uncertainty. You are walking out with — one mental model. *LLMs are fast pattern-matchers with no memory of yesterday.* The prompt API. *R-C-T-F-E and few-shot dominates.* The hallucination fix. *RAG with citations is not optional in regulated domains.* The tool-fit framework. *Volume × stakes × verifiability — sweet spot is high-low-high.* And the production loop. *Five stages, eval set on day one, fourteen-day audit forever.*

[firm] That's a complete system for using AI well — and refusing it deliberately. [emphatic] Ship it.

[brisk] Five takeaways for this lesson. [pause] One. Engineer the loop, not the prompt; the loop has five stages. Two. Define the output spec before you write a single prompt. Three. The eval set is non-negotiable — fifty hand-labeled examples, four hours, frozen forever. Four. The fourteen-day production audit catches what the eval set misses, namely the world changing under you. Five. *If you can't write an eval, you can't ship the feature* — third and final time.

[gentle] The reflection prompt. *What is the eval set for the AI feature you most want to ship in the next sixty days, and on what date will you have hand-labeled the first fifty examples?* [pause]

[warm] If you can answer that with a date, you are already operating differently from most engineers shipping AI in 2026. The capstone is next — it asks you to triage five candidate AI use cases through the volume-stakes-verifiability framework, and recommend ship, reframe, or refuse for each. By the time you get there, the answers will feel almost obvious.

[wry, slowly] That's the point of the course. The frameworks compound. [pause]

[matter-of-fact] One last sentence. The bro on LinkedIn outsourcing his entire hackathon project to ChatGPT is not your competition. *You* are not your competition. The team three companies down the street that has an eval set, a fourteen-day audit, and the discipline to refuse the wrong use cases — *that* is your competition. Now you have the same playbook.

[warm] See you in the capstone.
