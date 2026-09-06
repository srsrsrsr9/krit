---
name: music
description: Use this guide whenever adding background music or generative audio to a Claude animation or interactive artifact. Covers library selection, implementation patterns, critical gotchas, and science-backed mood design. Always read this before writing any music-related code.
---

# Background Music for Animations

This guide covers everything needed to add background music to browser-based animations — library choice, correct implementation, traps to avoid, and how to design music that actually matches the intended emotional tone.

---

## Library Decision Tree

```
Does the animation live entirely in a Claude artifact (no file hosting)?
├── YES → Use Tone.js (already available, no files needed, synthesize everything in code)
└── NO  → Developer will host audio files
         ├── Music tracks (mp3/ogg) → Use Howler.js
         └── Need fine-grained control or visualizers → Use Web Audio API directly
```

### Tone.js — Primary Choice for Artifacts
**CDN:** Already available as `import * as Tone from 'tone'` in Claude React artifacts.
For HTML artifacts: `<script src="https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.49/Tone.js"></script>`
**License:** MIT | **Repo:** https://github.com/Tonejs/Tone.js | **Docs:** https://tonejs.github.io/docs/

Synthesizes music programmatically — no audio files required. Includes a full DAW-like feature set: Transport (clock/sequencer), synthesizers (Synth, PolySynth, FMSynth, AMSynth), effects (Reverb, Delay, Chorus, Distortion), and a sampler. The right choice when the animation must be self-contained.

### Howler.js — For File-Based Music
**CDN:** `<script src="https://cdnjs.cloudflare.com/ajax/libs/howler/2.2.4/howler.min.js"></script>`
**License:** MIT | **Repo:** https://github.com/goldfire/howler.js
Plays audio files (mp3, ogg, wav, webm). Defaults to Web Audio API with HTML5 Audio fallback for broad coverage. Handles looping, fading, and volume control cleanly. The right choice when the developer supplies real recorded music.

### Web Audio API — Low-Level Escape Hatch
Built into every modern browser. No library needed. Use when: building custom audio visualizers, needing sub-millisecond timing, or wanting fine control over the audio graph. Higher complexity cost — only reach for this when Tone.js or Howler cannot do what is needed.

---

## Critical Rule: The Autoplay Wall

**This is the #1 cause of silent audio in browser animations. There are no exceptions.**

All modern browsers (Chrome since M66, Firefox, Safari) block any audio that starts without a user gesture. An `AudioContext` created on page load is placed in `"suspended"` state — it produces no sound until the user clicks, taps, or presses a key.

### The Pattern — Always Do This

```javascript
// WRONG — silent on page load in all modern browsers
Tone.Transport.start();

// CORRECT — gate all audio behind a user interaction
const startBtn = document.getElementById('start');
startBtn.addEventListener('click', async () => {
  await Tone.start(); // resumes the AudioContext
  Tone.Transport.start();
  startBtn.style.display = 'none';
});
```

For Howler.js:
```javascript
// Howler auto-handles the unlock attempt, but still add explicit unlock
document.addEventListener('click', () => {
  Howler.ctx?.resume();
}, { once: true });
```

### Cross-Origin iframes
Claude artifacts run inside an iframe. The iframe **must** have `allow="autoplay"` on it, otherwise the AudioContext will never be allowed to run regardless of user gestures. This is outside Claude's control — if audio stays silent in an embedded context, flag this to the developer (see Developer Flags section).

### Checking AudioContext State
```javascript
// Detect whether audio is blocked before trying to play
const ctx = new AudioContext();
if (ctx.state === 'suspended') {
  // Show a "click to play music" prompt to the user
}
ctx.resume(); // call this inside a user gesture handler
```

---

## Tone.js Implementation Patterns

### Minimal Looping Background Track

```javascript
import * as Tone from 'tone';

// All setup happens outside the gesture handler
const synth = new Tone.PolySynth(Tone.Synth).toDestination();
const reverb = new Tone.Reverb(3).toDestination();
synth.connect(reverb);

// Sequence of notes — uses Tone notation (C4 = middle C)
const loop = new Tone.Sequence((time, note) => {
  synth.triggerAttackRelease(note, '8n', time);
}, ['C4', 'E4', 'G4', 'B4', 'G4', 'E4'], '8n');

loop.loop = true;

// Gate behind gesture
document.getElementById('play').addEventListener('click', async () => {
  await Tone.start();
  Tone.Transport.bpm.value = 90;
  loop.start(0);
  Tone.Transport.start();
});
```

### Critical: Never Do DOM/Visual Updates Inside Transport Callbacks

Transport callbacks run on a WebWorker thread — not synced to the animation frame. Putting DOM updates inside them creates desync between visuals and audio.

```javascript
// WRONG — visual update inside transport callback
const loop = new Tone.Loop((time) => {
  element.style.opacity = '1'; // DO NOT DO THIS
}, '4n');

// CORRECT — use Tone.Draw to sync visuals to audio
const loop = new Tone.Loop((time) => {
  Tone.getDraw().schedule(() => {
    // This fires on the nearest requestAnimationFrame to AudioContext time
    element.style.opacity = '1';
  }, time);
}, '4n');
```

### Scheduling in Advance (Avoids Pops and Glitches)

```javascript
// Give the audio thread 100ms headroom — imperceptible to users
Tone.Transport.start('+0.1');

// Same when triggering on user input
button.addEventListener('mousedown', () => {
  synth.triggerAttack('C4', '+0.05');
});
```

### Latency Hint for Background Music (Not Interactive)

```javascript
// "playback" hint trades low latency for sustained reliability — right for background music
Tone.setContext(new Tone.Context({ latencyHint: 'playback' }));
```

### Fading In/Out

```javascript
// Fade in over 2 seconds
Tone.Destination.volume.rampTo(0, 2);    // 0 dB = full volume

// Fade out over 3 seconds, then stop
Tone.Destination.volume.rampTo(-60, 3);
setTimeout(() => Tone.Transport.stop(), 3000);
```

### Available Synthesizers Quick Reference

| Synth | Character | Good For |
|---|---|---|
| `Tone.Synth` | Basic oscillator + envelope | Simple melodies |
| `Tone.PolySynth` | Multiple simultaneous notes | Chords, pads |
| `Tone.FMSynth` | Frequency modulation, metallic | Sci-fi, game sounds |
| `Tone.AMSynth` | Amplitude modulation, tremolo-ish | Retro, warm |
| `Tone.PluckSynth` | Karplus-strong, plucked string | Guitar-like, harp |
| `Tone.MetalSynth` | Inharmonic partials | Percussion, bells |
| `Tone.MembraneSynth` | Drum-like decay | Kick, tom sounds |
| `Tone.NoiseSynth` | White/pink/brown noise + envelope | Hi-hats, texture |

### Available Effects Quick Reference

| Effect | Use Case |
|---|---|
| `Tone.Reverb` | Space, atmosphere, depth |
| `Tone.Delay` | Echo, rhythmic texture |
| `Tone.Chorus` | Thickening, shimmer |
| `Tone.Distortion` | Grit, intensity, energy |
| `Tone.Tremolo` | Vintage amplitude wobble |
| `Tone.Vibrato` | Pitch wobble, expression |
| `Tone.AutoFilter` | Sweeping filter, movement |
| `Tone.PingPongDelay` | Stereo echo |
| `Tone.Compressor` | Loudness control |
| `Tone.EQ3` | Tone shaping |

---

## Howler.js Implementation Patterns

### Basic Looping Track

```javascript
const music = new Howl({
  src: ['music.webm', 'music.mp3'],  // webm first for better browser compat
  loop: true,
  volume: 0.5,
  onloaderror: (id, err) => console.error('Load failed:', err),
  onplayerror: (id, err) => {
    // Autoplay blocked — listen for user interaction and retry
    music.once('unlock', () => music.play());
  }
});

// Gate behind gesture — Howler attempts auto-unlock but it is not guaranteed
document.getElementById('play').addEventListener('click', () => {
  music.play();
});
```

### Crossfade Between Tracks

```javascript
function crossfade(from, to, duration = 1000) {
  from.fade(from.volume(), 0, duration);
  to.play();
  to.fade(0, 0.7, duration);
  setTimeout(() => from.stop(), duration);
}
```

### HTML5 Mode for Large Files

```javascript
// Without html5: true, Howler downloads and decodes the full file before playing
// For tracks longer than ~30s, use streaming mode
const music = new Howl({
  src: ['long-track.mp3'],
  html5: true,   // streams instead of fully decoding into memory
  loop: true
});
```

**Gotcha:** `html5: true` disables some Web Audio API features (3D audio, `Howler.ctx` access for visualizers). For background music where you do not need the audio graph, this is fine.

---

## Gotchas Checklist

**Autoplay wall** — Already covered. Never skip the user gesture gate. No exceptions.

**Mobile: Audio locked until tap** — iOS Safari is the strictest. Audio contexts created before the first touch event are suspended. Always test on a real iOS device. The `touchstart` event counts as a gesture but `touchend` is more reliable.

**Memory: Too many AudioBuffers on mobile** — Loading many large audio files can crash mobile browsers during buffer decoding. On constrained devices, use `html5: true` with Howler, or load tracks one at a time and dispose of unused ones.

**Tone.js version mismatch** — The API changed significantly between v13 and v14. The CDN link above is v14. If using npm in a project, pin to `^14.0.0`. Do not mix version docs.

**React/Vue: Multiple AudioContexts** — In React, effects run twice in Strict Mode. Creating a `new AudioContext()` or initializing Tone inside `useEffect` without cleanup creates duplicate contexts. Always clean up and/or wrap initialization in a ref guard:
```javascript
const initialized = useRef(false);
useEffect(() => {
  if (initialized.current) return;
  initialized.current = true;
  // ... setup Tone
  return () => { Tone.Transport.stop(); Tone.Transport.cancel(); };
}, []);
```

**Tone.Transport time is not wall-clock time** — `Tone.Transport.seconds` is the playhead position, not elapsed real time. Do not use it for animation timing; use `requestAnimationFrame` for visuals.

**Howler CORS** — The Web Audio API requires CORS headers when loading audio from a different origin. If the audio file is on a CDN without proper `Access-Control-Allow-Origin` headers, Howler will silently fall back to HTML5 Audio (or fail). Either serve files from the same origin or use `html5: true`.

**Howler sprite timing on Android** — MP3 sprites can have playback start delays on Android Chrome due to codec variability. For precise sprite timing on mobile, WebM (Opus codec) is more reliable.

**Safari + AudioContext** — Safari requires `webkitAudioContext` on older versions. Tone.js handles this automatically. If using Web Audio API directly: `const ctx = new (window.AudioContext || window.webkitAudioContext)()`.

**Tab backgrounding** — When a tab goes to the background, Chrome throttles JavaScript timers. Tone.js's Transport uses a WebWorker to maintain timing accuracy even in background tabs. This is intentional and correct behavior.

**Volume units in Tone.js** — Tone uses decibels (dB) for volume. `0 dB` = full volume. `-60 dB` = near silence. Not a 0–1 scale like Howler. Converting: `volume = 20 * Math.log10(linearLevel)`.

---

## Developer Flags

Flag these to the developer before writing code, or add a visible note in the artifact UI:

| Situation | What to Flag |
|---|---|
| Audio files needed | "I need you to host audio files and provide URLs. Supported formats: mp3 + webm/ogg (provide both for cross-browser coverage)." |
| CORS errors | "The audio file server needs `Access-Control-Allow-Origin: *` headers for Web Audio API to work." |
| Artifact embedded in iframe | "If this is embedded in an iframe, that iframe needs `allow=\"autoplay\"` attribute or audio will be blocked." |
| Mobile iOS testing | "Test on a real iOS device — audio behavior in iOS simulator differs from real hardware." |
| Long tracks | "For tracks over 30 seconds, set `html5: true` to avoid memory issues on mobile." |
| No user interaction possible | "Background music requires at least one user interaction (click/tap) before it can play. I've added a start button — can this be incorporated into the animation's existing UI?" |

---

## Mood Design: The Science

### The Circumplex Framework

The most robust model for mapping music to emotion is Russell's Circumplex Model of Affect (Russell, 1980; Posner, Russell & Peterson, 2005). It places emotional states in a 2D space with two axes:

- **Valence** (horizontal): unpleasant ←→ pleasant
- **Arousal** (vertical): low activation ←→ high activation

This produces four quadrants that map cleanly to musical recipes:

```
                    HIGH AROUSAL
                         │
          Tense/Scared   │   Excited/Triumphant
          (Q2: −V, +A)   │   (Q1: +V, +A)
                         │
NEGATIVE ────────────────┼──────────────────── POSITIVE
VALENCE                  │                     VALENCE
                         │
          Sad/Melancholic│   Calm/Peaceful
          (Q3: −V, −A)   │   (Q4: +V, −A)
                         │
                    LOW AROUSAL
```

Empirical research (Gabrielsson & Lindström, 2001; Husain, Thompson & Schellenberg, 2002; Juslin & Sloboda, 2010) consistently identifies the following musical parameters as the primary controllers of each dimension:

**Arousal is driven by:** tempo, dynamics (loudness), rhythmic complexity, texture density, pitch register
**Valence is driven by:** mode (major/minor), harmony (consonance/dissonance), articulation (staccato/legato), timbre brightness

### Musical Parameters → Emotion Map

#### Tempo (BPM)
| Range | Emotional Quality |
|---|---|
| 40–60 | Solemn, funereal, grief, very slow meditation |
| 60–80 | Sad, introspective, gentle melancholy |
| 80–100 | Nostalgic, romantic, thoughtful |
| 100–120 | Neutral, light, ambling |
| 120–140 | Upbeat, happy, confident |
| 140–160 | Energetic, excited, urgent |
| 160–180 | Frantic, tense, action-driven |
| 180+ | Overwhelming, chaotic, panic |

#### Mode / Scale
| Scale | Emotional Character | Use For |
|---|---|---|
| Major (Ionian) | Happy, bright, resolved | Joy, triumph, playfulness |
| Natural Minor (Aeolian) | Sad, melancholic, introspective | Grief, longing, drama |
| Harmonic Minor | Exotic, dramatic, tense | Mystery, danger, Eastern drama |
| Dorian | Melancholic but hopeful, modal jazz | Bittersweet, introspective, cool |
| Phrygian | Dark, ominous, flamenco | Horror, tension, danger |
| Lydian (#4) | Dreamy, magical, floating | Wonder, fantasy, nostalgia |
| Mixolydian (b7) | Relaxed, bluesy, unresolved | Adventure, folk, laid-back |
| Pentatonic Major | Simple, open, folk | Innocence, nature, folk |
| Pentatonic Minor | Soulful, bluesy, emotional | Soul, blues, Eastern |
| Whole Tone | Ambiguous, floating, impressionistic | Dreaming, hallucination, Debussy-esque |
| Diminished | Very tense, unstable, horror | Terror, danger, instability |
| Chromatic/Atonal | Maximum tension, no tonal center | Horror, chaos, extreme anxiety |

#### Harmony
| Harmony Type | Effect |
|---|---|
| Perfect consonance (unison, 5ths, octaves) | Stable, pure, open, ancient |
| Soft consonance (3rds, 6ths) | Warm, pleasant, resolved |
| Mild dissonance (7ths, 9ths) | Jazz tension, yearning, sophistication |
| Strong dissonance (tritone, min 2nd) | Anxiety, dread, unresolved tension |
| Suspended chords (sus2, sus4) | Ambiguity, anticipation, floating |
| Pedal/drone tone | Meditation, building dread, anchoring |
| Chromatic voice leading | Unease, strangeness, disorientation |

#### Rhythm & Articulation
| Pattern | Effect |
|---|---|
| Steady 4/4, even beats | Grounded, march-like, stable |
| Syncopated (off-beat accents) | Jazz, energy, forward movement |
| Triplet feel / swing | Blues, shuffle, relaxed humanity |
| Rubato (free time) | Emotional, romantic, expressive |
| Staccato (short, separated notes) | Playful, energetic, light |
| Legato (smooth, connected) | Sad, calm, flowing |
| Complex meter (5/4, 7/8) | Unsettling, intellectual, odd |
| Hemiola (3-against-2 cross-rhythm) | Gentle tension, floating |

#### Timbre & Texture
| Choice | Effect |
|---|---|
| High register (C5+) | Bright, light, childlike, ethereal |
| Low register (C2–C3) | Dark, heavy, threatening |
| Sparse texture (1–2 voices) | Lonely, intimate, minimal |
| Dense texture (many voices) | Grand, overwhelming, epic |
| Bright timbre (high harmonics) | Energetic, present, aggressive |
| Dark timbre (low harmonics, muted) | Calm, melancholic, subtle |
| Tremolo/vibrato | Emotion, instability, unease |
| Reverb (long) | Space, distance, dreamlike |
| Dry (no reverb) | Intimate, close, confined |

---

## Mood Recipes for Common Animation Scenarios

These are synthesizable with Tone.js — no audio files needed.

### Joyful / Celebratory
**Russell quadrant:** Q1 (+Valence, +Arousal) | **Hevner group:** 5–6 (Gay, Happy, Playful)
- BPM: 132–160
- Scale: C Major or G Major
- Chords: I → IV → V → I (resolved, bright)
- Rhythm: Staccato eighth notes, syncopated accents
- Timbre: High PolySynth, add glockenspiel-like MetalSynth for sparkle
- Texture: Medium density, strong rhythmic feel
- Effects: Short reverb, light chorus

```javascript
// Tone.js recipe
const synth = new Tone.PolySynth(Tone.Synth, {
  oscillator: { type: 'triangle' },
  envelope: { attack: 0.02, decay: 0.1, sustain: 0.3, release: 0.5 }
}).toDestination();
Tone.Transport.bpm.value = 140;
const seq = new Tone.Sequence((time, note) => {
  synth.triggerAttackRelease(note, '16n', time);
}, ['C5', 'E5', 'G5', 'E5', 'C5', 'G4', 'E5', 'G5'], '8n');
```

### Melancholic / Sad
**Russell quadrant:** Q3 (−Valence, −Arousal) | **Hevner group:** 2–3 (Sad, Dreamy, Tender)
- BPM: 60–76
- Scale: A Natural Minor or D Dorian
- Chords: i → VI → III → VII (minor, descending feel)
- Rhythm: Slow legato, long note durations, gentle rubato feel
- Timbre: Warm PolySynth, PluckSynth for delicacy
- Texture: Sparse — 2 voices maximum
- Effects: Long reverb (Tone.Reverb decay: 5–8s), subtle delay

```javascript
const synth = new Tone.PolySynth(Tone.Synth, {
  oscillator: { type: 'sine' },
  envelope: { attack: 0.3, decay: 0.5, sustain: 0.7, release: 2.0 }
});
const reverb = new Tone.Reverb({ decay: 6, wet: 0.5 }).toDestination();
synth.connect(reverb);
Tone.Transport.bpm.value = 68;
```

### Tense / Suspenseful
**Russell quadrant:** Q2 (−Valence, +Arousal) | **Hevner group:** 7–8 (Agitated, Dramatic)
- BPM: 140–180 (or use slow tempo with dissonance for dread)
- Scale: Phrygian, Diminished, Chromatic
- Harmony: Tritones, clusters, unresolved dissonance
- Rhythm: Irregular accents, off-beat stabs, ostinato (repeating pattern)
- Timbre: Low register, NoiseSynth for texture, FMSynth for metallic edge
- Effects: Short reverb, dry + close, tremolo for instability
- Trick: Pedal tone on low note + chromatic melody above = maximum tension

```javascript
// Tension ostinato — low tritone pulse
const bass = new Tone.Synth({
  oscillator: { type: 'sawtooth' },
  envelope: { attack: 0.01, decay: 0.2, sustain: 0.1, release: 0.3 }
}).toDestination();
const loop = new Tone.Loop((time) => {
  bass.triggerAttackRelease('C2', '16n', time);
  bass.triggerAttackRelease('F#2', '16n', time + 0.1); // tritone
}, '4n');
Tone.Transport.bpm.value = 160;
```

### Calm / Peaceful
**Russell quadrant:** Q4 (+Valence, −Arousal) | **Hevner group:** 4 (Serene, Quiet, Lyrical)
- BPM: 60–90
- Scale: F Major, C Lydian, or Pentatonic Major
- Chords: I → V → vi → IV with slow chord changes
- Rhythm: Long notes, gentle arpeggios, breathing-like pacing
- Timbre: Sine waves, soft pads, PluckSynth for harp-like quality
- Texture: Very sparse — silence is as important as sound
- Effects: Long reverb (wet: 0.7), long delay (dotted quarter), gentle chorus

```javascript
const pad = new Tone.PolySynth(Tone.Synth, {
  oscillator: { type: 'sine' },
  envelope: { attack: 1.5, decay: 0, sustain: 1.0, release: 3.0 }
});
const reverb = new Tone.Reverb({ decay: 8, wet: 0.7 }).toDestination();
pad.connect(reverb);
Tone.Transport.bpm.value = 72;
// Pentatonic — C D E G A — guarantees no dissonance
const pentatonic = ['C4', 'D4', 'E4', 'G4', 'A4', 'C5'];
```

### Epic / Triumphant
**Russell quadrant:** Q1 (+Valence, +Arousal, high magnitude) | **Hevner group:** 8 (Exhilarated, Majestic)
- BPM: 120–140
- Scale: D Major, Bb Major (orchestral keys)
- Harmony: I → V → vi → IV, strong perfect cadences, suspension before resolution
- Rhythm: Strong downbeats, dotted rhythms (long-short), driving 4/4
- Timbre: Full texture — bass + mid + high synths layered, add FMSynth for brass quality
- Effects: Heavy reverb, mild distortion on bass for weight, compressor for punch

### Playful / Whimsical
**Russell quadrant:** Q1 (+Valence, moderate +Arousal) | **Hevner group:** 6 (Playful, Humorous)
- BPM: 120–150 (but light, dancing)
- Scale: C Lydian (#4 = magical/floating) or G Major
- Harmony: Unexpected chord changes, chromatic passing chords for surprise
- Rhythm: Staccato 8ths, rests on strong beats (creates bouncing feel), triplet figures
- Timbre: High register MetalSynth for bells/xylophone, PluckSynth for plucks
- Texture: Sparse and pointillistic — short notes with gaps

### Mysterious / Eerie
**Russell quadrant:** Between Q2 and Q3 — negative valence, moderate arousal
- BPM: 70–100 (slow enough to feel suspended)
- Scale: Dorian, Harmonic Minor, or Whole Tone
- Harmony: Unresolved sus chords, modal vamps (no traditional resolution)
- Rhythm: Irregular spacing, long pauses, sparse ostinato
- Timbre: AMSynth with tremolo, long reverb tail, very dark register
- Effects: Long delay (creates ghost echoes), high reverb wet mix

### Nostalgic / Bittersweet
**Russell quadrant:** Moderate on both axes, slightly negative valence
- BPM: 80–100
- Scale: D Dorian or F# Minor (melancholic but warm)
- Harmony: Major chord in minor key (Picardy third or VI chord) = bittersweet signature
- Rhythm: Gentle waltz (3/4) or slow 4/4 with rubato feel
- Timbre: PluckSynth (harp/guitar-like), warm PolySynth pad underneath
- Effects: Moderate reverb, slight tape-saturation (Tone.BitCrusher at low setting) for vintage warmth

---

## Common Music Theory Quick Reference

### Chord Progressions by Mood

| Mood | Progression (Roman numerals, key of C) | Example Notes |
|---|---|---|
| Happy/Pop | I–V–vi–IV | C–G–Am–F |
| Sad | i–VI–III–VII | Am–F–C–G |
| Tense | i–bII (Neapolitan) | Am–Bb |
| Epic | I–V–vi–IV (slow, full) | C–G–Am–F |
| Mysterious | i–v–i (no resolution) | Am–Em–Am |
| Dreamy | I–II (Lydian) | C–D (over C Lydian) |
| Nostalgic | I–vi–IV–V | C–Am–F–G |

### Note Frequencies for Tone.js

Tone uses scientific pitch notation: `C4` = middle C (261.6 Hz). Octave numbers go up with pitch: `C5` is an octave above `C4`. Sharps use `#` (e.g., `C#4`), flats use `b` (e.g., `Bb4`).

### Rhythm Values

| Tone.js String | Duration | Common Use |
|---|---|---|
| `'1n'` | Whole note | Pads, drones |
| `'2n'` | Half note | Slow melodies |
| `'4n'` | Quarter note | Beat, walking bass |
| `'8n'` | Eighth note | Melodies, arpeggios |
| `'16n'` | Sixteenth note | Fast runs, percussion |
| `'4t'` | Triplet quarter | Shuffle, swing |
| `'8t'` | Triplet eighth | Triplet feel |

---

## What to Check With the Developer

Before generating music code, clarify:

1. **Self-contained or file-based?** → Determines Tone.js vs Howler.js
2. **Should music loop indefinitely?** → Affects structure of sequences
3. **Should music respond to animation state?** → Need a mood transition API
4. **Volume controls visible to user?** → Accessibility best practice
5. **Mobile required?** → Must test autoplay unlock on iOS
6. **Duration?** → Short animations may not need looping; generative music works better for long/indefinite animations

## What to Flag to the Developer

1. **"Audio requires a user interaction to start"** — Always tell the developer that a start button or click-to-begin UX is mandatory. They may need to design this into the animation's entry point.
2. **CORS on audio files** — If they host files on S3, CDN, or another origin, the bucket/server needs `Access-Control-Allow-Origin: *`.
3. **iframe embed** — If embedding elsewhere, the iframe tag must include `allow="autoplay"`.
4. **Mobile memory** — Avoid loading many large audio buffers simultaneously on mobile. Use `html5: true` for tracks.
5. **Performance** — `Tone.Convolver` (realistic reverb) and `Tone.Panner3D` with HRTF are expensive. On low-end devices, use `Tone.Reverb` instead.
6. **Safari quirks** — Always provide both webm and mp3 formats with Howler. Safari has limited codec support.

---

## References

- Russell, J.A. (1980). A circumplex model of affect. *Journal of Personality and Social Psychology*, 39(6), 1161–1178.
- Gabrielsson, A. & Lindström, E. (2001). The influence of musical structure on emotional expression. In Juslin & Sloboda (Eds.), *Music and Emotion: Theory and Research*. Oxford University Press.
- Gabrielsson, A. & Lindström, E. (2010). The role of structure in the musical expression of emotions. In Juslin & Sloboda (Eds.), *Handbook of Music and Emotion*. Oxford University Press.
- Husain, G., Thompson, W.F., & Schellenberg, E.G. (2002). Effects of musical tempo and mode on arousal, mood, and spatial abilities. *Music Perception*, 20(2), 151–171.
- Juslin, P.N. & Sloboda, J.A. (Eds.) (2010). *Handbook of Music and Emotion: Theory, Research, and Applications*. Oxford University Press.
- Hevner, K. (1936). Experimental studies of the elements of expression in music. *American Journal of Psychology*, 48(2), 246–268.
- Posner, J., Russell, J.A., & Peterson, B.S. (2005). The circumplex model of affect. *Development and Psychopathology*, 17(3), 715–734.
- Tone.js Performance Guide: https://github.com/Tonejs/Tone.js/wiki/Performance
- Chrome Autoplay Policy: https://developer.chrome.com/blog/autoplay
- MDN Web Audio Best Practices: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices
