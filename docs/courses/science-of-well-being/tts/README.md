# Science of Well-Being — TTS narration scripts

Pre-rendered audio narration for each of the 5 lessons. One mp3 per lesson, dropped under:

```
public/audio/science-of-well-being/<lesson-slug>.mp3
```

The course JSON's `lessonMeta.audioChapters` matches the chapter labels inside each script. Keep timings within ±15s of the listed chapter marks so the chapter chips on the player jump cleanly.

| # | Lesson | Script | Target | Chapter marks (sec) |
|---|---|---|---|---|
| 1 | Miswanting | `miswanting-basics.md` | 12:00 | 0 / 90 / 220 / 410 / 580 |
| 2 | Hedonic Adaptation | `hedonic-adaptation.md` | 12:00 | 0 / 80 / 200 / 380 / 560 |
| 3 | G.I. Joe Fallacy | `g-i-joe-fallacy.md` | 13:00 | 0 / 90 / 240 / 420 / 620 |
| 4 | Two Cheat Codes | `two-cheat-codes.md` | 13:00 | 0 / 80 / 280 / 520 / 660 |
| 5 | Wellbeing Diagnostics | `wellbeing-diagnostics.md` | 14:00 | 0 / 90 / 230 / 470 / 700 |

---

## Voice direction (use for every script)

- **Persona:** A dry-funny university lecturer who likes their subject, respects the listener, and never patronizes. Closer to *Tim Urban reading aloud* than *Audible thriller narrator*.
- **Pace:** ~150 words per minute. Slightly slower for the mental-model callouts. Brief pauses on heading transitions.
- **Tone:** Warm. Curious. Occasionally amused. Never breathless.
- **Articulation:** American or Indian-English neutral. Avoid heavy regional accent. Hindi/Hinglish phrases inside cultural asides should be pronounced with light Indian-English colouring; do not perform them as comedy.
- **Emphasis cues:** I've put **bold** around words to stress and *italics* around words to read more lightly. Do not pause around them; just modulate.
- **Numbers:** Read full forms ("twenty thousand rupees" not "twenty K"). "₹1 lakh" reads as "one lakh rupees."

---

## Recommended engines

| Engine | Notes |
|---|---|
| **ElevenLabs** (Multilingual v2 / Turbo v2.5) | Best for the cultural asides; handles Hinglish correctly with most voices. Recommended voices: *Jessica*, *Adam*, *Charlie*. |
| **OpenAI tts-1-hd** | Good English narration. Will mispronounce Hindi-Roman words — see the *English-only fallback* note below. |
| **Google Cloud TTS WaveNet** | Decent multilingual. Use `en-IN-Wavenet-D` for Indian-English coloring. |
| **Azure Neural TTS** | Use `en-IN-NeerjaNeural` or `en-US-JennyNeural`. Supports SSML phonemes for tricky words. |

---

## English-only fallback

If your TTS engine is English-only (OpenAI, basic Polly, etc.), substitute the **English-only sidebar** that appears in each cultural-aside section. The course's `culturalAside` block already ships `en` variants of every Hinglish box, so swapping is faithful to the rendered lesson.

Each script marks these explicitly with:

```
[CULTURAL ASIDE — narrate Hinglish version OR substitute English version below]
```

---

## Pronunciation guide (Hinglish)

| Word | Pronunciation hint |
|---|---|
| bhai | "bh-aa-ee" — soft *bh*, long *aa* |
| yaar | "yaa-r" — long *aa*, soft trailing *r* |
| naani | "naa-nee" — long *aa*, light *n* |
| mummy | as in English "mommy" with shorter *u* |
| dahi | "duh-hee" |
| matlab | "mut-lub" |
| scene | as in English "seen" |
| set hai | "set hai" — *hai* like English *high* |
| chai | "chai" — single syllable, like English "chai latte" |
| paani | "paa-nee" |
| sambhar | "sahm-bahr" |
| Mahindra | "muh-HIN-druh" |
| Thar | rhymes with English "tar" |
| IIT | spell out: *eye-eye-tee* |
| JEE | spell out: *jay-ee-ee* |
| FIRE | spell out: *F-I-R-E* (financial-independence acronym) |
| Bengaluru | "ben-guh-LOO-roo" |
| Aarav | "AA-ruv" |
| Aanya | "AAN-yuh" |
| Vikram | "VIK-rum" |
| Aakash | "AA-kush" |
| Sneha | "snay-huh" |
| Tanya | "TAHN-yuh" |
| Priya | "PREE-yuh" |
| Rohan | "ROH-hun" |
| Rina | "REE-nuh" |
| Ananya | "uh-NUN-yuh" |
| Nani | "NAA-nee" |

---

## File format

Output **mp3, 128 kbps, 44.1 kHz, mono** for the player. Stereo is fine but unnecessary; mono saves bandwidth.

If your engine outputs WAV, convert with:

```bash
ffmpeg -i input.wav -c:a libmp3lame -b:a 128k -ac 1 -ar 44100 output.mp3
```

---

## Smoke test

After dropping each mp3 in place, open `/learn/science-of-well-being/<lesson-slug>` in a browser. The audio player at the top should:

1. Show duration matching the script's target ±15s.
2. Show all 5 chapter chips clickable; clicking each should jump to roughly the right point in the audio.
3. Track progress as it plays.

If the duration is wildly off, re-record at a faster/slower pace, or update the chapter marks in the course JSON and re-import.
