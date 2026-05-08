# Gemini 3.1 Flash TTS — Composer scripts (Testing with Playwright)

Five drop-in scripts for Google AI Studio's Gemini 3.1 Flash TTS Composer (Playground → Composer mode). Each file is paste-ready for one lesson's audio file.

```
public/audio/testing-with-playwright/<lesson-slug>.mp3
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

9. Drop the final mp3 at `public/audio/testing-with-playwright/<lesson-slug>.mp3`.
10. Open the lesson page; the chapter chips should now scrub through your audio.

---

## Voice — Indian-English accent

The Krit narrator for this course is *a dry-funny SDET-turned-lecturer who has watched too many on-call rotations get burned by `waitForTimeout`.* Closer to a Bengaluru staff engineer doing a brown-bag with chai than a YouTube tutorial voice. They take strong sides — *"CSS selectors are the problem, getByRole is the answer"*, *"if your test sleeps, your test is wrong"* — and they back the sides with numbers from real Indian fintech / SaaS rooms.

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
| **Niraj** (Indian English Male) | Mature, informative — best lecturer match for this course |
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
| Kore | Firm, measured | Heavier register; suits the *flake-and-debugging* lesson |
| Aoede | Breezy, friendly | Lighter register; suits the *test-pyramid* lesson openings |

If accent fidelity matters, use one of the three options above. If "approximately neutral with light Indian rhythm" is good enough, Composer will do.

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
`[thoughtful]` `[amused]` `[dry]` `[warm]` `[curious]` `[wry]` `[matter-of-fact]` `[conspiratorial]` `[firm]` `[deadpan]` `[gentle]` `[emphatic]`

**Reactions**
`[chuckles]` `[short laugh]` `[sighs]` `[scoffs lightly]`

**Pacing**
`[pause]` `[long pause]` `[slowly]` `[brisk]`

You can layer them: `[wry, slowly]` is fine.

---

## Hinglish handling

Each script keeps the cultural-aside content in Hinglish, with the audio tag `[switching to Hinglish, warm]` opening the section and `[returning to English]` closing it. Gemini 3.1 Flash multilingual mode handles this well in our testing.

If you're producing an English-only edition, look for the `<!-- EN-ONLY ALTERNATIVE -->` block under each cultural-aside section and use that block instead. The course's `culturalAside` schema already stores parallel `en` and `hi-IN` variants, so the audio matches whichever the listener has selected.

---

## File list

| # | Lesson | Composer script | Target | Chapter marks (sec) |
|---|---|---|---|---|
| 1 | Why Tests Survive | `1-why-tests-survive.md` | 12:00 | 0 / 80 / 220 / 410 / 560 |
| 2 | Test Pyramid | `2-test-pyramid.md` | 11:45 | 0 / 80 / 220 / 410 / 560 |
| 3 | Playwright Fundamentals | `3-playwright-fundamentals.md` | 11:55 | 0 / 80 / 220 / 410 / 560 |
| 4 | Flake and Debugging | `4-flake-and-debugging.md` | 12:00 | 0 / 80 / 220 / 410 / 560 |
| 5 | CI and Coverage | `5-ci-and-coverage.md` | 12:00 | 0 / 80 / 220 / 410 / 560 |

---

## Course voice guardrails

The lecturer for this course always:

- **Takes a side.** *"CSS selectors are the problem; getByRole is the answer."* *"If your test sleeps, your test is wrong."* *"Coverage is a vanity metric until you weight it by criticality."* No "it depends" without a follow-up rule.
- **Cites real Playwright API.** `getByRole`, `getByLabel`, `page.route`, `page.clock`, `expect.poll`, `--trace=on-first-retry`, `--shard=1/4`, web-first assertions. No invented APIs.
- **Anchors to India.** Pune SaaS migrating from Selenium. Bengaluru fintech on-call paged at 3am. UPI checkout flows. Mumbai local trains as the pyramid analogy. Numbers in lakhs and INR.
- **Uses concrete numbers.** *14% flake rate to 0.4% after one fix.* *47 sleeps removed.* *28-minute CI cut to 7 with sharding.* *₹24 lakh per year on two SDETs.* Round numbers feel made up; specific numbers feel real.
- **Punches up at the institution, not the listener.** Senior dev jokes about themselves and about cargo-cult Selenium habits, never at the intern who wrote 47 sleeps for a demo.
</content>
</invoke>