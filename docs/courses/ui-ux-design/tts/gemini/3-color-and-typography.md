# Lesson 3 — Color and Typography Without the Cargo Cult

**Target duration:** ~11:00
**Chapter marks (sec):** 0 / 80 / 220 / 410 / 560

---

## SCENE

Same studio, mid-morning. The whiteboard has been wiped and now reads, in capital letters: "HEX CODES ARE TECHNICAL DEBT." A junior designer is squinting at it skeptically. The lecturer, third coffee in hand, is about to make a case for retiring `#FF0000` from your codebase, and explain why your "Modern Minimalist" font choice is doing nothing for you. Speaks with a warm Indian-English accent, opinionated, slightly conspiratorial.

## SAMPLE CONTEXT

The listener has finished lessons one and two. They squint at their screens. They have an 8-point grid. They are now ready to discover that the colours and fonts they've been picking are doing approximately nothing — because they are not part of a system. We will install a type scale and a token-based colour system. Indian-English accent throughout — same lecturer.

## SPEAKER 1

**Recommended voice (true Indian accent):**
- Google Cloud TTS — `en-IN-Chirp3-HD-Charon` *(default)*
- Azure — `en-IN-PrabhatNeural`
- ElevenLabs — *Niraj (Indian English Male)*

**Fallback in Gemini Composer:** Charon *(Informative)* with `[Indian-English accent, calm Bengaluru lecturer tone]` prepended to the first speech block.

**Temperature:** `0.85`

---

### Speech block 1 — *Opening: the cargo cult of #FF0000*  *(target 0:00 – 1:20)*

[Indian-English accent, calm Bengaluru lecturer tone] [dry] Welcome back. Lesson three. [pause] Today's victims — your colour palette, and your font choices.

[wry] Quick survey. Open your codebase. Search for `#FF0000`. Count the matches. [pause] If it appears more than three times, this lesson is going to feel personal. [chuckles]

[matter-of-fact] Most designers treat colour and type as decoration — *let's pick a nice red, let's try this trendy font.* Then they ship. Six months later, the brand wants a new red. The team finds out there are seventeen reds in the codebase, none of them documented, and three are subtly different from each other for reasons nobody remembers.

[firm] That is not a colour problem. That is a *systems* problem. Today we install one mental model — *type is a hierarchy of voices* — and two named moves: *the type scale ratio* and *tokens, not hex codes.* By the end you will have the spec for a colour system that survives a rebrand without a rewrite.

[gentle] Side-note for the audience. I have strong opinions on this lesson. Hex codes scattered across a codebase are technical debt. Trendy free fonts changing every quarter are technical debt. Style is not the bug — *unsystematic style is the bug.* Onwards.

---

### Speech block 2 — *Mental model: type is a hierarchy of voices*  *(target 1:20 – 3:40)*

[curious] Stop thinking about typography as font choices. Start thinking about it as *casting voices for a play.*

[matter-of-fact] Every screen is a small theatre. The page heading is the narrator — speaks once, loud, sets the scene. The section headings are the lead actors — speak often, with weight. The body text is the chorus — speaks the most, but quietly. Captions and labels are the stagehands — present, useful, almost invisible.

[wry] When designers say *"the typography is off,"* what they usually mean is the casting is wrong. Two actors are speaking at the same volume. The narrator and the chorus are using the same voice. The stagehands are stealing focus from the leads. [pause] The play is incoherent.

[firm] A type system is not "which font you picked." A type system is the *defined relationships between sizes, weights, and line-heights* that let those voices play their parts.

[matter-of-fact] Two questions to ask before any typography decision. One — what role does this text play on the page? Heading, body, caption, label, micro-copy? Two — does it have a defined size, weight, and line-height in our type scale? If not, you are inventing a new role. Most designs have too many roles.

[switching to Hinglish, warm] Shaadi ka card soch. Bride aur groom ka naam — sabse bada, sabse weighty, golden font. Date — medium, neat, easy to read. Venue — smaller, supporting. *RSVP karein* — small italic, bottom corner. [pause] Saari information ek card pe. Hierarchy clear hai. Aankh apne aap correct order mein padhti hai. Yahi typography ka kaam hai screens pe.

[returning to English, dry] A wedding card has a perfect type system. Names loud, date medium, venue smaller, RSVP whisper. The eye reads the right thing first without the reader thinking. Your dashboard could learn from your aunt's wedding card.

<!-- EN-ONLY ALTERNATIVE
[dry] A wedding invitation card has a perfect type hierarchy. The names of the couple are loudest. The date is medium-weight, easy to scan. The venue is smaller. The RSVP line is a whisper at the bottom. The eye reads the right thing first, without thinking. Your dashboard could borrow that exact discipline.
-->

[gentle] Type is voice casting. Cast it deliberately, and the page tells the story for you.

---

### Speech block 3 — *Move 1: type scale ratios*  *(target 3:40 – 6:50)*

[firm] First named move. *Type scale ratios.*

[matter-of-fact] Build a type scale from scratch in five minutes. Five steps.

[brisk] One. Set body size — usually sixteen pixels for web, fifteen or sixteen for mobile. That is the size your user reads paragraphs at.

[matter-of-fact] Two. Pick a ratio. Common ones — 1.2 (minor third), 1.25 (major third), 1.333 (perfect fourth), 1.5 (perfect fifth). For most product UI, 1.25 is the safe pick. Editorial designs go larger; data-dense apps go smaller.

[curious] Three. Generate five or six sizes by multiplying. Body sixteen. Sub-heading sixteen times 1.25 — twenty. Heading three — twenty-five. Heading two — thirty-one. Heading one — thirty-nine. Round to whole numbers. That is your scale.

[firm] Four. Name them semantically. Not *text-39px.* That breaks the moment you change the ratio. Name them *display, h1, h2, h3, body, caption.* Roles, not sizes.

[matter-of-fact] Five. Document the line-heights. Body line-height around 1.5 — comfortable for paragraphs. Headings tighter — 1.2 to 1.3 — because shorter lines need less leading. Captions usually 1.4. Document these alongside the sizes; line-height changes the perceived size as much as font-size does.

[wry] Why a ratio at all? Because each step is *mathematically distinct from the previous one.* Hierarchy is automatic. Random sizes — fourteen, sixteen, eighteen, nineteen, twenty-two — do not have hierarchy. They have a buffet. The eye doesn't know which is more important. [chuckles]

[firm, slowly] Ratio gives you hierarchy for free.

[switching to Hinglish, warm] Mumbai ka design studio. Ek senior designer ne tagline banaya — *"jab tak ratio nahin hai, scale nahin hai."* Junior log ke designs review karte time woh sirf ek question puchta hai — *kaunsa ratio use kiya?* Agar jawab nahin aaya, design wapas. [pause] Strict, lekin ek mahine baad pura team apne aap consistent type scales bana rahi hoti hai. Reflex ban jaati hai.

[returning to English, dry] Pick a ratio first, sizes second. Without the ratio, you are picking sizes by feel — and feel is how seventeen reds got into your codebase. [chuckles]

<!-- EN-ONLY ALTERNATIVE
[dry] Pick the ratio before you pick the sizes. A senior designer at a Mumbai studio reviews juniors' work with a single opening question — "what's your ratio?" If there isn't one, the design goes back. Strict, yes, but it builds the reflex. After a month, the team produces consistent type scales without thinking. Without the ratio, you are picking sizes by feel — and feel is how seventeen reds ended up in your codebase.
-->

---

### Speech block 4 — *Move 2: tokens, not hex codes*  *(target 6:50 – 9:20)*

[firm] Second named move. *Tokens, not hex codes.*

[matter-of-fact] Stop putting `#FF0000` in your codebase. Stop putting `#1A73E8`. Stop putting any hex value directly in a component. From this lesson onwards, *every colour reference goes through a token name.*

[curious] What is a token? A semantic name for a colour role. *brand-primary.* *text-default.* *background-surface.* *status-error.* The token resolves to a hex value somewhere central — a Tailwind config, a CSS variables file, a Figma styles library. The component just asks for *brand-primary* and gets whatever colour brand-primary is today.

[wry] The classic trap — naming tokens after the colour itself. *blue-500.* *red-700.* *cobalt-light.* These are *bad* tokens. They lock the colour into the name. The day someone decides the brand colour should be teal instead of blue, your codebase is full of references to *blue-500* now resolving to teal. Confusion compounds.

[firm, slowly] Name tokens by *role,* not by *appearance.*

[matter-of-fact] Good token: *brand-primary.* Resolves to teal today, magenta next year, doesn't care. The component meaning is preserved.

[matter-of-fact] Bad token: *cobalt-blue.* Resolves to teal — and now every code review for the next six months involves the question *why is cobalt-blue showing up as teal?*

[wry] Five-step rollout. One — list semantic categories. Brand, surface, text, border, status. Two — pick two or three tokens per category. Don't start with thirty. Three — assign hex values. Four — wire into Tailwind config or CSS variables. Five — migrate one surface end-to-end as proof. The migration shows the rest of the team that it works.

[firm] The payoff is bigger than aesthetics. *Rebrands cost one diff.* Change the hex behind *brand-primary* once, the entire product updates. Dark mode requires fewer overrides because the *roles* stay the same — only the underlying values flip.

[switching to Hinglish, warm] Saree shop ka colour system soch. Owner-uncle bolega — *yeh wedding section, yeh casual section, yeh festival section.* Roles. Sarees ka actual colour seasonal change hota rehta hai. Categories permanent rehti hain. *Wedding section mein iss saal red zyada, agle saal pink zyada — but section ka naam wahi hai.* [pause] Same in design. Roles permanent, hex values seasonal.

[returning to English, dry] Categories outlive colours. Name your tokens by category — by role — not by current pigment. Your future-self running a rebrand will write you a thank-you note. [chuckles]

<!-- EN-ONLY ALTERNATIVE
[dry] A saree shop owner labels sections by occasion, not by colour. The "wedding section" is permanent; the actual reds and pinks rotate every season. Same logic in tokens — name by role, not by current pigment. Your future-self running a rebrand will write you a thank-you note.
-->

[gentle] Hex codes scattered across components are technical debt. Token-based systems are an *option* on future change. Pay the small cost now, collect the big payoff later.

---

### Speech block 5 — *Try it and reflect*  *(target 9:20 – 11:00)*

[warm] Time to put it into practice.

[firm] Open your product. Pick one screen. Run two audits.

[brisk] Audit one — typography. List every text element on the screen. For each, write down its current size, weight, and line-height. Now ask — does it correspond to a defined role in your type scale? If you can't name the role, you don't have a system; you have improvisations.

[matter-of-fact] Audit two — colour. Open the screen's component code. Search for hex values. Count them. Each hex is a token you haven't created yet.

[wry] Don't try to fix everything in one PR. Pick the worst offender — usually the colour with the most copies — and turn it into a token first. The migration takes thirty minutes. The reduction in future cognitive load lasts forever. [pause]

[firm] Five takeaways. [pause] One. Type is voice casting; cast each role deliberately. Two. Build the type scale from a ratio, not by feel — hierarchy comes from the math. Three. Name type roles semantically — *body, h1, caption* — never *text-18px.* Four. Replace every hex code in components with a semantic token. Five. Name tokens by role — *brand-primary* — not by appearance — *blue-500.*

[gentle] Reflection prompt. *If your brand decided tomorrow that the primary colour was no longer blue, how many files would you have to edit? If the answer is more than one, you have homework.* [pause]

[warm] Lesson four is next. We move from how a screen looks to *how it talks back when poked.* [wry] Interaction design and microcopy. Spoiler — *"Something went wrong"* is the worst sentence in your product, and it's about to be retired.
