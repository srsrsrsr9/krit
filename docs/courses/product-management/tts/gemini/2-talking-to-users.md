# Lesson 2 — Talking to Users Without Getting Lied To

**Target duration:** ~11:00
**Chapter marks (sec):** 0 / 80 / 220 / 410 / 560

---

## SCENE

The same Bengaluru classroom, next morning. Whiteboard now reads *Tell me about the last time…* in fresh marker. The lecturer has a transcript printed out, marked up in red pen — they will refer to it occasionally, with mild despair. They have run, by their own admission, several hundred bad interviews before they got the hang of it. Speaks with a warm Indian-English accent.

## SAMPLE CONTEXT

The listener has finished lesson one. They now know the PM job is translation plus sequencing, and they have started to suspect they might be measuring the wrong thing. They are about to discover that the user research they were planning to do — *"asking users what they want"* — is the most expensive way to build the wrong product. Indian-English accent throughout — same lecturer as the previous lesson.

## SPEAKER 1

**Recommended voice (true Indian accent):**
- Google Cloud TTS — `en-IN-Chirp3-HD-Charon` *(default)*
- Azure — `en-IN-PrabhatNeural`
- ElevenLabs — *Niraj (Indian English Male)*

**Fallback in Gemini Composer:** Charon *(Informative)* with `[Indian-English accent, calm Bengaluru lecturer tone]` prepended to the first speech block.

**Temperature:** `0.85` *(consider 0.9 — this lesson rewards expressive tags)*

---

### Speech block 1 — *Opening: the polite-Indian problem*  *(target 0:00 – 1:20)*

[Indian-English accent, calm Bengaluru lecturer tone] [warm] Yesterday we said the PM job is translation. [pause] Today we look at the room where most translation begins — [dry] *the user interview.* And where most translation goes wrong.

[matter-of-fact] Users will lie to you. Not maliciously. Politely. Helpfully. With smiles. They will say they love your product. They want your dark mode. They would absolutely pay for the new tier.

[wry, slowly] None of it predicts what they will do.

[firm] This is a special problem in India, where saying no to a stranger is mildly impolite, and saying no to a stranger who is *clearly trying their best* is socially expensive. [chuckles] Your interview transcripts are a museum of well-meaning lies.

[gentle] The fix is not to call your users liars. The fix is to *stop asking the questions that produce lies.* Today, two named moves. *"Tell me about the last time."* And *the silence move* — what to do after they finish answering. Both of them feel slightly awkward the first time. Both of them work.

---

### Speech block 2 — *Mental model: stated want vs revealed need*  *(target 1:20 – 3:40)*

[curious] Treat every user statement as having two channels.

[matter-of-fact] Channel A — what they say. Loud. Polite. Optimistic. Designed to make you feel good. *"I would absolutely use a dark mode."* *"Yes, I'd pay for that tier."* *"Your product is so much better than what we use today."*

[matter-of-fact] Channel B — what they actually do. Did. Are doing right now, this minute, on their phone in their pocket. Quiet. Often invisible. Always more accurate. They have not opened your app in three weeks. They are using a competitor at twelve PM every Wednesday. They paid for the cheapest tier and never upgraded.

[firm] Good interviews tune the volume on Channel B. [pause] Bad interviews crank Channel A and call it research.

[wry] The failure mode for a junior PM is not asking the wrong questions. It's asking *future-tense* questions — *"would you use,"* *"would you pay for,"* *"how often would you"* — and treating the answers as data. [emphatic] They aren't data. They are aspirations.

[matter-of-fact] A user telling you they would *"definitely use a feature"* is, statistically, telling you they would not. Not because they're dishonest. Because *they have not yet had to make the decision.* The decision lives in the moment of friction. The interview is a fantasy room with no friction.

[switching to Hinglish, warm] Bhai, scene yeh hai. PM gaya aunty ke ghar product dikhane. Aunty ne chai pilayi, biscuit khilaye, app dekha. PM ne poocha — *"Aunty, kaisa laga? Use karoge?"* [pause] Aunty: *"Beta, bahut acchha hai. Zaroor karungi. Mera number bhi de do, app daal ke batati hoon."*

[returning to English, dry] App install nahi hua. Contact bhi nahi kiya. But in those thirty minutes the PM was sure the product was on fire. [chuckles] Aunty did not lie. Aunty was *polite.* Politeness is the loudest noise in your research data — and you have to learn to filter it without becoming rude in the process.

<!-- EN-ONLY ALTERNATIVE
[dry] You demo your product to a friend's parent. They serve you tea, listen patiently, smile, say 'this is wonderful, I'll definitely use it, send me the link.' They never install it. They never reply. They didn't lie. They were polite. Politeness is the loudest noise in your research data, and you have to learn to filter it without becoming rude in the process.
-->

---

### Speech block 3 — *Move 1: tell me about the last time*  *(target 3:40 – 6:50)*

[firm] First named move. [slowly] *Tell me about the last time you…*

[matter-of-fact] The single most useful sentence in user research. It does three things at once.

[firm] One. It forces past-tense. The user can't aspire — they have to *remember.* Memory is messy. But messy memory is closer to truth than confident future-tense.

[firm] Two. It forces specifics. *"Tell me about the last time you exported data"* produces a story with a date, a tool, a workaround, a frustration. *"Would you use an export feature"* produces a polite yes. Same user. Different planet.

[firm] Three. It surfaces the *absence.* If they cannot recall a single instance — *"umm, I don't think I have"* — that is *the most valuable answer in the interview.* [pause] Stated demand without a single recent instance of the underlying behavior is theoretical demand. [emphatic] Theoretical demand does not pay engineers.

[wry] A Mumbai fintech I consulted with was about to build a complex bill-splitter. Six months of engineering. Their pre-research interview asked *"would you use a bill-splitter?"* — seventy-eight percent said yes. CEO was thrilled. [chuckles]

[matter-of-fact] We re-ran it. Same users, different question. *"Tell me about the last time you split a bill."* Seventy percent had not split one in the last ninety days. *"Yeah, I just Venmo my friend whatever, we sort it out."* *"My roommate handles it."* *"We don't really split, we just take turns."*

[firm] Project killed. Six months saved. *Two crore four lakh rupees* not lit on fire. [pause] One question. That is the leverage.

[curious] Now, the technique. You don't ask the question once and stop. You follow the workaround. *"Tell me about the last time you exported."* They say — *"I copy-pasted into Excel."* You ask — *"Walk me through that. Tab by tab. What broke?"* You probe for absence — *"When was the last time you didn't bother and just gave up?"* You count workarounds, not wishes. [emphatic] Five users with the same Google Sheet beats fifty users saying *"that would be cool."*

[matter-of-fact] Pre-launch, write down the one decision the interview must help you make. Draft five to seven past-tense questions. Strike every *would you* from your script. Pick a notetaker. Decide what *gold signal* would look like — usually, three or more independent workarounds for the same problem. [firm] If you don't define gold before the interview, you will see gold everywhere.

---

### Speech block 4 — *Move 2: the silence move*  *(target 6:50 – 9:20)*

[firm] Second named move. *The silence move.*

[matter-of-fact] When a user finishes answering, the worst thing you can do is fill the silence. You will want to. Your brain will scream — *"awkward! ask the next question! reassure them!"* [pause] Don't.

[wry, slowly] Wait. Three seconds. Five. Up to seven if you can stand it.

[matter-of-fact] Most users have a *prepared answer* and a *real answer.* The prepared answer comes first — short, polite, slightly curated. The real answer comes after the silence, when they realise you are still listening and they have not actually said the thing they meant.

[firm] *Tell me about the last time you exported data.* [pause] *"I just used Excel."* [long pause] *"…actually, the last time, I asked our intern to do it manually because the export crashed on rows over ten thousand. Took her four hours. We've been doing it that way for two months."*

[emphatic] *That* is the interview. The first answer was the cover. The silence is what unlocked the rest.

[gentle] You will feel rude. You are not being rude. You are being attentive. The user feels heard, not interrogated. The discomfort is *yours,* not theirs. Train yourself to sit with it.

[wry] One small refinement — when you do speak, repeat their last three words as a question. *"…took her four hours?"* It is the cheapest follow-up in research. It signals *I heard you, tell me more,* without putting any words into their mouth.

[switching to Hinglish, warm] Bhai, ek aur trap hai. Demo dikha rahe ho — user ne bola *"wow, yeh amazing hai, mereko zaroor chahiye, kab aa raha hai?"* [pause] Aapko laga jackpot. Slack pe screenshot daal diya. Founder ko bhej diya.

[returning to English, dry] Three weeks later, the same user has not opened the beta. Has not replied to two follow-ups. The demo enthusiasm is the loudest, *least* predictive signal in the entire research toolkit. *"This is amazing"* is not data. *"I built a Google Sheet last Tuesday because your tool didn't work"* — that is data. Learn to tell which one you just heard.

<!-- EN-ONLY ALTERNATIVE
[dry] On a demo day, a user says 'wow, this is amazing, when can I get it?' You feel like a hero. Three weeks later they haven't opened the beta and haven't replied to two follow-ups. Demo-day enthusiasm is the loudest, least-predictive signal in user research. 'This is amazing' is not data. 'I built a Google Sheet last Tuesday because your tool didn't work' — that is data. Learn to hear the difference.
-->

[firm] Three categories to label every interview answer. *Gold* — a specific past behavior, with a workaround. *Noise* — polite generic praise, no specifics. *Trap* — an unprompted high score, or *"I would definitely use this."* Throw out noise and trap. Build only on gold.

---

### Speech block 5 — *Try it and reflect*  *(target 9:20 – 11:00)*

[warm] Run the moves on one real user this week.

[firm] Pick a real person who uses something adjacent to what you're building. Not a friend. Not a parent. *A user.* Get thirty minutes. [pause]

[matter-of-fact] Prep, in writing, embarrassingly specific.

[brisk] One. Write the *one decision* this interview should help you make. *"Should we build a Hindi UI for warehouse customers?"* Not *"learn about users."* Two. Draft five to seven *past-tense* questions. Each begins with *tell me about the last time…* or *walk me through what happened when…* Three. Write a one-line opener that does *not* pitch the product. *"I'm trying to understand how teams handle X today — not selling anything, just listening."* Four. Decide what *gold* looks like. *"Three independent users mentioning the same Google Sheet."* Write it down before the call. Five. Practice the silence. Three to seven seconds after each answer. Time it on your phone if you must.

[wry] During the interview, *no slides.* No demo. No *"would you."* No *"on a scale of one to ten."* If you catch yourself doing any of those, stop mid-sentence, apologise lightly, ask the past-tense version. [chuckles] Users will respect you more, not less.

[firm] After. Tag every answer Gold, Noise, or Trap. Most of your transcript will be Noise. That's normal. If even one answer is Gold, the interview earned its rent.

[gentle] Recap. Move one — *tell me about the last time.* Past-tense, specific, surfaces absence. Move two — *the silence move.* Wait three to seven seconds. The real answer lives after the prepared one. Throw out future-tense answers. Build only on remembered behaviors.

[firm] Five takeaways. [pause] One. Channel A is what they say; Channel B is what they did. Tune Channel B. Two. Strike every *would you* from your interview script — they don't survive contact with reality. Three. *Tell me about the last time* is the highest-leverage sentence in product research. Four. The silence move pulls the real answer out from behind the prepared one. Five. Count workarounds, not wishes — three users with the same Google Sheet beats fifty users saying *"that would be cool."*

[warm] Reflection prompt. *Pick a feature you, or your team, are about to build based on user requests. Can you name three users who, in the last ninety days, built a workaround for the underlying problem?* [pause] If yes — go build. If no — your demand might be theoretical.

[wry] Lesson three — PRDs and prioritization. [dry] We finally write the document that makes engineers stop asking *"wait, what?"* mid-sprint.
