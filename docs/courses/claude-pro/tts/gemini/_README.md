# Gemini 3.1 Flash TTS — Composer scripts (Claude Pro)

Five drop-in scripts for Google AI Studio's Gemini 3.1 Flash TTS Composer (Playground → Composer mode). Each file is paste-ready for one lesson's audio file in the *Claude Pro: Cowork, Code, Design* course.

```
public/audio/claude-pro/<lesson-slug>.mp3
```

---

## How to use one of these scripts

1. Open Google AI Studio → Playground → switch to **Composer** mode.
2. Pick the model: **Gemini 3.1 Flash TTS Preview**.
3. Copy the **SCENE** field from the script into the Composer's `Scene` box.
4. Copy the **SAMPLE CONTEXT** field into `Sample Context`.
5. Set the speaker voice + temperature per the recommendations at the top of each script.
6. For each speech block (one per chapter), click **+ Add speech block** and paste the block content verbatim, including `[bracketed]` tags.
7. Click **Run**, then download the resulting mp3.
8. If the engine outputs a single long take, that's your final file. If it outputs separate clips per block, concatenate with `ffmpeg`:

```bash
ffmpeg -i "concat:1.mp3|2.mp3|3.mp3|4.mp3|5.mp3" -c copy <lesson-slug>.mp3
```

9. Drop the final mp3 at `public/audio/claude-pro/<lesson-slug>.mp3`.
10. Open the lesson page; the chapter chips should now scrub through your audio.

---

## Voice — Indian-English accent

The Krit narrator for *Claude Pro* is *a dry-funny Bengaluru lecturer who has actually shipped Claude across a real company*. Lower energy than a launch keynote, more opinionated than a tutorial. They take strong sides — *"Claude Code without `CLAUDE.md` is just expensive autocomplete"* — and they use Indian product examples without translating them down for a global audience.

**Important caveat: Gemini 3.1 Flash TTS Composer voices do not have a true Indian-English accent.** Zephyr, Charon, Kore, Aoede etc. are all American/British-neutral. SCENE direction can nudge the rhythm slightly, but the *accent itself* won't be Indian.

For a genuine Indian-English accent, render the audio outside Gemini Composer. Three good options:

### Option 1 — Google Cloud TTS (recommended; cheapest + sounds great)

The `en-IN` Chirp 3 HD voices are excellent and natural-sounding. Use one of:

| Voice ID | Vibe | Best for |
|---|---|---|
| **`en-IN-Chirp3-HD-Charon`** | Informative, calm Indian male | **Default for this course — lecturer tone** |
| `en-IN-Chirp3-HD-Sadachbia` | Warm Indian male | Slightly softer alternative |
| `en-IN-Chirp3-HD-Aoede` | Breezy Indian female | Lighter female read |
| `en-IN-Chirp3-HD-Kore` | Firm Indian female | More gravitas |
| `en-IN-Wavenet-D` | Mature Indian male | Older lecturer feel; slightly less natural than Chirp3 |

Pricing: Chirp 3 HD is ~$30 per 1M characters. Each lesson is ~12K characters → all 5 lessons cost ~$1.80 total.

The Composer-style audio tags `[wry]`, `[chuckles]`, `[pause]` etc. don't translate directly to Google Cloud TTS, so you have two paths:

1. **Strip the tags** before sending. Use the `gcloud-prep.sh` snippet at the bottom of this README.
2. **Convert to SSML.** Replace `[pause]` with `<break time="500ms"/>`, `[long pause]` with `<break time="1500ms"/>`, `[emphatic]` with `<emphasis level="strong">…</emphasis>`. Other emotional tags get dropped.

### Option 2 — ElevenLabs (best voice quality, handles Hinglish + audio tags)

Best results overall. The Multilingual v2 / Turbo v2.5 models handle Hinglish gracefully. Recommended Indian-English voices from the public library:

| Voice | Vibe |
|---|---|
| **Niraj** (Indian English Male) | Mature, informative — best lecturer match |
| Raju (Indian English Male) | Younger, casual |
| Monika Sogam (Indian English Female) | Warm female alternative |
| Anika (Indian English Female) | Brighter female alternative |

ElevenLabs supports inline expressive tags (`[laughs]`, `[sighs]`, `[whispers]` etc) that map closely to the tags in our scripts. Pricing: ~$0.30/1K characters on the Creator tier.

### Option 3 — Azure Neural TTS

Stable, slightly less expressive than ElevenLabs but supports SSML cleanly.

| Voice ID | Vibe |
|---|---|
| **`en-IN-PrabhatNeural`** | Mature Indian male — recommended for this course |
| `en-IN-NeerjaNeural` | Indian female; expressive styles available |
| `en-IN-AaravNeural` | Younger Indian male |
| `en-IN-AnanyaNeural` | Younger Indian female |

Convert audio tags to SSML the same way as Google Cloud TTS.

---

## If you must stay in Gemini Composer

Pick **Charon (Informative)** and add the line `[Indian-English accent, calm Bengaluru lecturer tone]` to the start of every speech block. The accent will be approximate, not authentic. **Temperature:** `0.85`.

| Voice | Vibe | Note |
|---|---|---|
| Charon | Informative, calm, dry | Closest to the lecturer tone — but no real Indian accent |
| Kore | Firm, measured | Heavier register |
| Aoede | Breezy, friendly | Lighter register |

If accent fidelity matters, use one of the three options above. If "approximately neutral with light Indian rhythm" is good enough, Composer will do.

---

## Tone notes specific to *Claude Pro*

This course is more opinionated than *Science of Well-Being*. The narrator is allowed to scoff lightly, take a clear position, and roll their eyes (audibly) at common mistakes. Lean on these tags more than usual:

`[wry]` `[dry]` `[scoffs lightly]` `[matter-of-fact]` `[firm]` `[deadpan]` `[conspiratorial]` `[amused]`

Keep `[gentle]` and `[warm]` for the close of each lesson, where the narrator drops the dryness for a moment of real generosity.

Real product surface to mention by name (do not soften):
- **Claude Opus 4.7** with the **1M-token context window**
- **Sonnet 4.6** as the default workhorse
- **Haiku 4.5** for cheap, repetitive jobs
- **Claude Code** as a CLI agent with file + shell access
- **CLAUDE.md** as the kernel file
- **Subagents**, **hooks**, **MCP** (Model Context Protocol)

India anchors are the default, not the exception. *Bengaluru fintech* rolling out Claude across compliance. *Pune SaaS* migrating Express to Fastify with Claude Code. *Mumbai dabbawalas* as the orchestration analogy. Don't translate them down for a global audience — that's the whole voice.

---

## gcloud-prep.sh — strip tags + convert to SSML

```bash
#!/usr/bin/env bash
# Strip Composer tags, convert known ones to SSML, output to stdout.
sed -E '
  s/\[long pause\]/<break time="1500ms"\/>/g
  s/\[short pause\]/<break time="300ms"\/>/g
  s/\[pause\]/<break time="600ms"\/>/g
  s/\[emphatic\]([^[]+)/<emphasis level="strong">\1<\/emphasis>/g
  s/\[slowly\]([^[]+)/<prosody rate="-15%">\1<\/prosody>/g
  s/\[brisk\]([^[]+)/<prosody rate="+10%">\1<\/prosody>/g
  s/\[switching to Hinglish, [^]]+\]/<lang xml:lang="hi-IN">/g
  s/\[returning to English[^]]*\]/<\/lang>/g
  s/\[[^]]+\]//g
' | sed 's/^/<speak>/; $s/$/<\/speak>/'
```

Pipe each lesson's markdown body (skip the SCENE/SAMPLE CONTEXT/SPEAKER headers) through it, then send to your TTS engine.

---

## Audio-tag taxonomy used in these scripts

The expressive tags below appear inline inside speech blocks. Don't strip them — they are the entire reason we're using the Composer instead of plain TTS.

**Emotional register**
`[thoughtful]` `[amused]` `[dry]` `[warm]` `[curious]` `[wry]` `[matter-of-fact]` `[conspiratorial]` `[firm]` `[deadpan]` `[gentle]`

**Reactions**
`[chuckles]` `[short laugh]` `[sighs]` `[scoffs lightly]`

**Pacing**
`[pause]` `[long pause]` `[slowly]` `[brisk]` `[emphatic]`

You can layer them: `[wry, slowly]` is fine.

---

## Hinglish handling

Each script keeps the cultural-aside content in Hinglish, with the audio tag `[switching to Hinglish, warm]` opening the section and `[returning to English]` closing it. Gemini 3.1 Flash multilingual mode handles this well in our testing.

If you're producing an English-only edition, look for the `<!-- EN-ONLY ALTERNATIVE -->` block under each cultural-aside section and use that block instead. The course's `culturalAside` schema already stores parallel `en` and `hi-IN` variants, so the audio matches whichever the listener has selected.

---

## File list

| # | Lesson | Composer script | Target | Chapter marks (sec) |
|---|---|---|---|---|
| 1 | What Claude Is Actually Good At | `1-what-claude-is-good-at.md` | 12:00 | 0 / 80 / 220 / 410 / 560 |
| 2 | Claude Code: Your Pair Engineer | `2-claude-for-coding.md` | 12:00 | 0 / 80 / 220 / 410 / 560 |
| 3 | Claude as a Coworker | `3-claude-for-cowork.md` | 12:00 | 0 / 80 / 220 / 410 / 560 |
| 4 | Claude Design: Mockups, Copy, Critique | `4-claude-for-design.md` | 12:00 | 0 / 80 / 220 / 410 / 560 |
| 5 | Long-Running Workflows: Subagents, Background Jobs, Memory | `5-claude-as-teammate.md` | 12:00 | 0 / 80 / 220 / 410 / 560 |
