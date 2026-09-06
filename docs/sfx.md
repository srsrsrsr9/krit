---
name: sfx
description: Use this guide whenever adding sound effects (SFX) to a Claude animation or interactive artifact. Covers library selection, procedural synthesis, event-driven design patterns, gotchas, and asset sources. Always read this before writing any SFX code.
---

# Sound Effects for Animations

Sound effects give animations tactile feedback, emotional punctuation, and interaction signals. This guide covers how to generate or play SFX correctly in browser-based animations — from zero-dependency synthesis to file-based playback.

---

## Library Decision Tree

```
Does the animation live entirely in a Claude artifact (no file hosting)?
├── YES → Use ZzFX (inline, ~1KB, synthesize from parameters — no files)
│         OR Tone.js (already available, more musical SFX control)
└── NO  → Developer will host audio files
         ├── Many short SFX → Howler.js with audio sprites
         ├── Single sounds → Howler.js (simple API)
         └── Need precise control / visualizer access → Web Audio API directly
```

---

## ZzFX — Primary Choice for Self-Contained SFX

**Source:** https://github.com/KilledByAPixel/ZzFX | **CDN:** https://cdnjs.cloudflare.com/ajax/libs/ZzFX/2.29/ZzFX.micro.js
**License:** MIT | **Size:** ~1KB minified

ZzFX synthesizes sound effects entirely in code using 20 numerical parameters. No audio files. No dependencies. One function call produces anything from bleeps to explosions to UI feedback. The definitive choice when the animation must be self-contained.

### Inline Setup (paste directly into any HTML artifact)

```javascript
// ZzFX Micro — paste this once, then call zzfx() anywhere
let zzfxV=.3,zzfxX=new AudioContext,zzfx=(p=1,k=.05,b=220,e=0,r=0,t=.1,q=0,D=1,u=0,y=0,v=0,z=0,l=0,E=0,A=0,F=0,c=0,w=1,m=0,B=0,N=0)=>{let M=Math,d=2*M.PI,R=44100,G=u*=500*d/R/R,C=b*=(1-k+2*k*M.random(k=[]))*d/R,g=0,H=0,a=0,n=1,I=0,J=0,f=0,h=N<0?-1:1,x=d*h*N*2/R,L=M.cos(x),Z=M.sin,K=Z(x)/4,O=1+K,X=-2*L/O,Y=(1-K)/O,P=(1+h*L)/2/O,Q=-(h+L)/O,S=P,T=0,U=0,V=0,W=0;e=R*e+9;m*=R;r*=R;t*=R;c*=R;y*=500*d/R**3;A*=d/R;v*=d/R;z*=R;l=R*l|0;p*=zzfxV;for(h=e+m+r+t+c|0;a<h;k[a++]=f*p)++J%(100*F|0)||(f=q?1<q?2<q?3<q?4<q?(g/d%1<D/2)*2-1:Z(g**3):M.max(M.min(M.tan(g),1),-1):1-(2*g/d%2+2)%2:1-4*M.abs(M.round(g/d)-g/d):Z(g),f=(l?1-B+B*Z(d*a/l):1)*(4<q?s:(f<0?-1:1)*M.abs(f)**D)*(a<e?a/e:a<e+m?1-(a-e)/m*(1-w):a<e+m+r?w:a<h-c?(h-a-c)/t*w:0),f=c?f/2+(c>a?0:(a<h-c?1:(h-a)/c)*k[a-c|0]/2/p):f,N?f=W=S*T+Q*(T=U)+P*(U=f)-Y*V-X*(V=W):0),x=(b+=u+=y)*M.cos(A*H++),g+=x+x*E*Z(a**5),n&&++n>z&&(b+=v,C+=v,n=0),!l||++I%l||(b=C,u=G,n=n||1));p=zzfxX.createBuffer(1,h,R);p.getChannelData(0).set(k);b=zzfxX.createBufferSource();b.buffer=p;b.connect(zzfxX.destination);b.start();return b};
```

### ZzFX Parameter Reference

```
zzfx(volume, randomness, frequency, attack, sustain, release, 
     shape, shapeCurve, slide, deltaSlide, pitchJump, pitchJumpTime,
     repeatTime, noise, modulation, bitCrush, delay, sustainVolume, 
     decay, tremolo, filter)
```

All parameters are optional and default to 0 (except volume=1, randomness=0.05, frequency=220, release=0.1, shapeCurve=1, sustainVolume=1). Use the [ZzFX designer](https://killedbyapixel.github.io/ZzFX/) to tweak sounds interactively and copy out the parameter array.

**Waveform shapes (parameter 7, `shape`):**
- `0` = Sine (smooth, pure)
- `1` = Triangle (softer than square)
- `2` = Sawtooth (bright, buzzy)
- `3` = Square (retro, hollow)
- `4` = Tan (harsh, distorted)
- `5` = Bit noise (crunchy, 8-bit)

### Ready-to-Use SFX Recipes

```javascript
// UI & Interaction
const sfx = {
  click:     () => zzfx(...[1,.1,1000,0,.01,.05,0,1.5,0,0,0,0,0,0,0,0,0,.5]),
  confirm:   () => zzfx(...[1,.05,400,.01,.1,.15,0,2,0,0,200,.05,0,0,0,0,0,.8]),
  cancel:    () => zzfx(...[1,.1,300,0,.05,.1,0,1,-3,0,0,0,0,0,0,0,0,.7]),
  hover:     () => zzfx(...[.5,.05,800,0,.005,.03,0,1.5,0,0,0,0,0,0,0,0,0,.4]),
  
  // Notifications
  success:   () => zzfx(...[1,.05,537,.02,.02,.22,1,1.59,-6.98,4.97]),
  error:     () => zzfx(...[1,.1,160,0,.1,.1,4,1,-1,0,0,0,0,0,0,0,0,.8]),
  warning:   () => zzfx(...[1,.1,440,0,.05,.2,0,2,0,0,0,0,0,0,0,0,.05,.6]),
  notification: () => zzfx(...[.8,.05,900,0,.01,.1,0,2,0,0,100,.05,0,0,0,0,0,.7]),
  
  // Game / Progression
  score:     () => zzfx(...[1,.05,400,.01,.1,.2,0,2,0,0,300,.1,0,0,0,0,.05,.8]),
  levelUp:   () => zzfx(...[1,.05,200,.01,.2,.4,0,2,5,0,0,0,0,0,0,0,.1,.8]),
  gameOver:  () => zzfx(...[1,.1,925,.04,.3,.6,1,.3,,6.27,-184,.09,.17]),
  pickup:    () => zzfx(...[1,.05,600,0,.01,.1,0,3,10,0,0,0,0,0,0,0,0,.7]),
  damage:    () => zzfx(...[1,.3,200,.01,.1,.3,4,.5,-5,0,0,0,0,3,0,0,0,.8]),
  
  // Motion & Physics
  whoosh:    () => zzfx(...[1,.3,300,0,.05,.3,4,.5,-5,0,0,0,0,3,0,0,0,.8]),
  pop:       () => zzfx(...[1,.1,700,0,.01,.05,0,2,0,0,0,0,0,0,0,0,0,.5]),
  thud:      () => zzfx(...[1,.5,60,0,.01,.2,4,.5,-2,0,0,0,0,5,0,0,0,.8]),
  bounce:    () => zzfx(...[1,.1,500,0,.01,.08,0,3,-10,0,0,0,0,0,0,0,0,.6]),
  explosion: () => zzfx(...[2,.5,50,0,.1,.5,4,.5,0,0,0,0,0,10,.2,0,0,.7]),
  
  // Typing / Text
  keystroke: () => zzfx(...[.3,.1,1200,0,.005,.025,0,1.5,0,0,0,0,0,0,0,0,0,.4]),
  typing:    () => zzfx(...[.2,.2,Math.random()*200+800,0,.003,.02,0,1.2]),

  // Ambience triggers
  chime:     () => zzfx(...[.5,.05,1400,.01,.3,.5,0,2,0,0,0,0,0,0,0,0,.1,.8]),
  ping:      () => zzfx(...[1,.02,1800,0,.01,.1,0,3,0,0,0,0,0,0,0,0,0,.9]),
};
```

### Pre-rendering SFX for Performance

ZzFX generates the buffer on every call. For SFX fired frequently (e.g., every frame), pre-render:

```javascript
// Pre-render once into a reusable buffer
function prerender(params) {
  // Temporarily capture the buffer source node
  const node = zzfx(...params);
  return node.buffer; // AudioBuffer — reusable
}

// Play a pre-rendered buffer
function play(buffer, volume = 1) {
  const src = zzfxX.createBufferSource();
  const gain = zzfxX.createGain();
  gain.gain.value = volume;
  src.buffer = buffer;
  src.connect(gain).connect(zzfxX.destination);
  src.start();
  return src;
}

const clickBuffer = prerender([1,.1,1000,0,.01,.05,0,1.5]);
// Later, play instantly with no synthesis cost:
play(clickBuffer);
```

---

## Tone.js for Musical SFX

Already available in Claude React artifacts. Better than ZzFX when SFX need musical pitch accuracy, chord-based feedback sounds, or integration with a Tone.js music system.

### UI Feedback Sounds

```javascript
import * as Tone from 'tone';

const synth = new Tone.Synth({
  oscillator: { type: 'sine' },
  envelope: { attack: 0.01, decay: 0.1, sustain: 0, release: 0.2 }
}).toDestination();

const sfx = {
  // Major third up = positive, resolved
  success: () => {
    synth.triggerAttackRelease('E5', '16n');
    setTimeout(() => synth.triggerAttackRelease('G#5', '16n'), 100);
  },
  // Descending minor = negative
  error: () => {
    synth.triggerAttackRelease('G4', '16n');
    setTimeout(() => synth.triggerAttackRelease('Eb4', '8n'), 80);
  },
  // Single soft click
  click: () => synth.triggerAttackRelease('C6', '32n', Tone.now(), 0.3),
};
```

---

## Howler.js for File-Based SFX

**CDN:** `<script src="https://cdnjs.cloudflare.com/ajax/libs/howler/2.2.4/howler.min.js"></script>`

### Single Sound

```javascript
const pop = new Howl({
  src: ['pop.webm', 'pop.mp3'],
  volume: 0.8
});
pop.play();
```

### Audio Sprite — The Right Way for Multiple SFX

Loading one file per sound effect creates many HTTP requests and many audio decoders in memory. The correct pattern is an **audio sprite**: a single audio file containing all SFX concatenated, with a JSON map defining the start/end time of each sound.

```javascript
const sfx = new Howl({
  src: ['sfx.webm', 'sfx.mp3'],
  sprite: {
    click:   [0,    200],    // ms: [start, duration]
    success: [500,  800],
    error:   [1500, 600],
    whoosh:  [2500, 400],
    pickup:  [3200, 300],
  }
});

// Play by name
sfx.play('click');
sfx.play('success');
```

**Generating sprites:** Use the `audiosprite` npm tool:
```bash
npx audiosprite -f howler2 -o sfx click.mp3 success.mp3 error.mp3
# Outputs sfx.mp3, sfx.webm, sfx.json (ready to paste as sprite map)
```

### Polyphonic Playback (Same Sound Overlapping)

```javascript
// Howler automatically handles overlapping plays — each play() call is independent
const sfx = new Howl({ src: ['fire.mp3'] });

// These 3 will all play simultaneously, each as a separate voice
sfx.play();
setTimeout(() => sfx.play(), 50);
setTimeout(() => sfx.play(), 100);
```

### Volume Pooling for Rapid-Fire SFX

```javascript
// If firing SFX rapidly (e.g., particle effects), pool instances
const sfxPool = Array.from({length: 5}, () => new Howl({ src: ['hit.mp3'], volume: 0.6 }));
let poolIndex = 0;

function playPooled() {
  sfxPool[poolIndex].stop();
  sfxPool[poolIndex].play();
  poolIndex = (poolIndex + 1) % sfxPool.length;
}
```

---

## Web Audio API — When You Need Full Control

Use for: audio visualizers, frequency analysis, custom effects chains, real-time audio processing.

```javascript
const ctx = new (window.AudioContext || window.webkitAudioContext)();

// Resume after user gesture
document.addEventListener('click', () => ctx.resume(), { once: true });

// Short beep synthesized from scratch
function beep(freq = 440, duration = 0.1, type = 'sine', vol = 0.5) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.value = freq;
  osc.type = type;
  gain.gain.setValueAtTime(vol, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration + 0.05);
}
```

---

## SFX Design Principles

### 1. Match Frequency to Meaning

The perceptual association between pitch and emotion is consistent (Ohala 1994; Morton 1977 — the "frequency code"):
- **High frequency (800Hz+)** → friendly, positive, submissive, light, small
- **Low frequency (under 200Hz)** → threatening, powerful, large, heavy, dominant
- **Rising pitch** → question, anticipation, positive change, arrival
- **Falling pitch** → finality, negative, departure, resolution
- **Mid frequency (200–800Hz)** → neutral, informational

Apply this: a success sound should be **high + rising**; a failure sound **low + falling**; a UI click **high + short**.

### 2. Envelope Shape = Perceived Physicality

The attack-decay-sustain-release (ADSR) envelope determines the physical character of a sound:

| Feel | Attack | Decay | Sustain | Release |
|---|---|---|---|---|
| Percussive (drum, tap) | Very fast (0–5ms) | Medium | Low/0 | Short |
| Plucked (guitar, harp) | Fast (5–20ms) | Long | 0 | Short-medium |
| Bowed (strings, pad) | Slow (100ms–1s) | — | High | Long |
| Explosive (whoosh, boom) | Fast | — | Medium | Medium-long |
| Gentle (breath, chime) | Medium | Short | Low | Long |

```
// Tap sound profile:
attack: 0.001, decay: 0.05, sustain: 0, release: 0.05

// String pad profile:
attack: 0.5, decay: 0, sustain: 1.0, release: 1.0
```

### 3. Layering for Richness

Real-world sounds are composites. Stack 2–3 components:
- **Body** (low, punchy): impact or sub-bass burst
- **Click** (mid, transient): the attack character
- **Sparkle** (high, tail): harmonic shimmer or noise

```javascript
// Layered "success" chord — body + sparkle
function successSound() {
  const body = new Tone.Synth({
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.01, decay: 0.2, sustain: 0.1, release: 0.5 }
  }).toDestination();
  const sparkle = new Tone.MetalSynth({
    envelope: { attack: 0.001, decay: 0.1, release: 0.3 }
  }).toDestination();
  body.triggerAttackRelease('E4', '8n');
  sparkle.triggerAttackRelease('32n', Tone.now() + 0.05); // slight delay for sparkle
}
```

### 4. The Earcon Library Pattern

Name SFX by function, not by sound. Build a central registry:

```javascript
const SOUNDS = {
  // Interaction feedback
  'ui:click':        [1,.1,1000,0,.01,.05,0,1.5],
  'ui:hover':        [.5,.05,800,0,.005,.03,0,1.5],
  'ui:confirm':      [1,.05,400,.01,.1,.15,0,2,,, 200,.05],
  'ui:cancel':       [1,.1,300,0,.05,.1,0,1,-3],
  
  // State changes
  'state:success':   [1,.05,537,.02,.02,.22,1,1.59,-6.98,4.97],
  'state:error':     [1,.1,160,0,.1,.1,4,1,-1],
  'state:loading':   [.3,.02,600,0,.2,.2,0,1,0,0,0,0,0,0,0,0,0,.5],
  
  // Animation events
  'anim:appear':     [.5,.05,900,0,.01,.1,0,2,,, 100,.05],
  'anim:disappear':  [.5,.05,700,0,.01,.1,0,2,,, -100,.05],
  'anim:impact':     [1,.3,150,0,.01,.15,4,.5,-2,,,,, 5],
  'anim:whoosh':     [.8,.3,400,0,.05,.3,4,.5,-5,,,,, 3],
  'anim:sparkle':    [.6,.05,1600,0,.01,.15,0,3, 20],
};

function play(name, volume = 1) {
  const params = SOUNDS[name];
  if (!params) return;
  zzfxV = volume * 0.3; // scale global volume
  zzfx(...params);
}

// Usage
play('ui:click');
play('state:success', 0.8);
```

### 5. Variation to Avoid Fatigue

Identical SFX played repeatedly (e.g., footsteps, gunshots, typing) become irritating. Introduce micro-variation:

```javascript
// ZzFX parameter 2 (randomness) adds automatic pitch randomness
// Increase from default 0.05 to 0.2 for organic variation
function playVariant(baseParams, pitchVariance = 0.15) {
  const params = [...baseParams];
  params[2] *= 1 + (Math.random() - 0.5) * pitchVariance; // ±pitch variance
  zzfx(...params);
}

// Or maintain a short pool of 3–4 variants
const clickVariants = [
  [1,.1,900,0,.01,.05,0,1.5],
  [1,.1,1000,0,.01,.05,0,1.5],
  [1,.1,1100,0,.01,.04,0,1.5],
  [1,.1,950,0,.01,.06,0,1.5],
];
let clickIdx = 0;
function playClick() {
  zzfx(...clickVariants[clickIdx++ % clickVariants.length]);
}
```

### 6. Cooldown / Debounce Rapid SFX

Firing SFX on every mouse move or render frame creates noise and CPU spikes:

```javascript
let lastPlay = 0;
function playThrottled(params, minInterval = 50) {
  const now = Date.now();
  if (now - lastPlay < minInterval) return;
  lastPlay = now;
  zzfx(...params);
}
```

---

## Critical Gotchas

**Autoplay wall** — Identical to music: the `AudioContext` used by ZzFX (`zzfxX`), Tone.js, and Web Audio API all require a user gesture before audio plays. ZzFX creates its `AudioContext` at definition time — it starts suspended. Any call to `zzfx()` before the first user interaction will silently fail.

```javascript
// ZzFX fix: resume context on first interaction
document.addEventListener('click', () => zzfxX?.resume(), { once: true });
// Or gate first sound behind a click — the act of playing resumes the context
```

**ZzFX creates a new AudioContext on load** — If `zzfxX = new AudioContext` runs before a gesture on iOS Safari, the context is created in suspended state and ZzFX calls will silently fail. The safest fix: create the `AudioContext` lazily inside the first user interaction, not at module load.

```javascript
// Lazy AudioContext for ZzFX
let zzfxX;
document.addEventListener('click', () => {
  if (!zzfxX) zzfxX = new AudioContext();
  zzfxX.resume();
}, { once: true });
```

**iOS: Only one AudioContext** — iOS Safari imposes strict limits on the number of AudioContexts. More than ~4 active contexts may cause earlier ones to go silent. Use a single shared context across all SFX and music systems.

**Memory: Do not create new Howl instances per click** — A `new Howl()` call starts a file load. Never put this in a click handler or animation loop. Create all Howl instances once at startup, then call `.play()` on the existing instance.

```javascript
// WRONG
button.onclick = () => new Howl({ src: ['click.mp3'] }).play(); // loads file every click!

// CORRECT
const clickSound = new Howl({ src: ['click.mp3'] }); // once at startup
button.onclick = () => clickSound.play(); // just plays it
```

**Howler sprite timing on mobile** — M4A sprites have poor timing accuracy on Android (can overshoot by 1 second). Prefer WebM/Opus for sprite files on mobile. Always provide `['sound.webm', 'sound.mp3']` in order.

**Overlapping ZzFX calls on mobile** — ZzFX creates a new `BufferSource` node per call. On mobile, many simultaneous calls can cause audio dropouts. Throttle high-frequency SFX, use the pre-rendering pattern above, or pool audio nodes.

**Silent failure is the default** — Web Audio API does not throw visible errors when autoplay is blocked; it just produces no sound. Always add visible UI state (e.g., a speaker icon) so users know whether audio is active.

**Web Audio node leak** — AudioNodes that are connected but never disconnected accumulate. For ZzFX this is managed internally. For manual Web Audio API use, always call `.disconnect()` and `.stop()` on nodes when done:
```javascript
const src = ctx.createBufferSource();
src.onended = () => { src.disconnect(); }; // auto-cleanup on completion
```

**Safari + `webkitAudioContext`** — Safari on iOS 14 and below requires `window.webkitAudioContext`. ZzFX handles this in newer versions. If writing raw Web Audio API: `const ctx = new (window.AudioContext || window.webkitAudioContext)()`.

**Firefox MP3** — Firefox does not support MP3 natively in some builds. Always provide WebM (Opus) as the first format and MP3 as fallback: `src: ['sound.webm', 'sound.mp3']`.

---

## Accessibility

- **Always provide a mute option.** SFX that cannot be disabled are a significant accessibility problem (vestibular disorders, sensory processing, cognitive load in screen reader users).
- **Never use audio as the sole signal** for an important state change. Visual feedback must accompany every SFX.
- **Volume should be controllable** independently from music.
- **Avoid sudden loud sounds** (startles). SFX should be perceptually louder than or equal to background music but never jarring.

```javascript
// Minimal accessible audio control
let sfxEnabled = true;
let sfxVolume = 0.8;

function play(params) {
  if (!sfxEnabled) return;
  zzfxV = sfxVolume * 0.3;
  zzfx(...params);
}
```

---

## Asset Sources (When Using File-Based SFX)

| Source | Type | License | Notes |
|---|---|---|---|
| [Freesound.org](https://freesound.org) | SFX (huge library) | CC (varies per file) | Check individual license; prefer CC0 |
| [OpenGameArt.org](https://opengameart.org) | SFX + music | CC0 / CC BY / GPL | Game-specific; very generous licenses |
| [Pixabay](https://pixabay.com/sound-effects/) | SFX + music | Royalty-free | No attribution required for most |
| [ZapSplat](https://www.zapsplat.com) | SFX (large) | Free with account | Attribution required on free tier |
| [Kenney.nl](https://www.kenney.nl/assets?q=audio) | SFX packs | CC0 (public domain) | Game UI packs, complete sets, excellent |
| [jsfxr / sfxr.me](https://sfxr.me) | 8-bit SFX generator | Free tool | Generate retro sounds, export WAV |
| [ZzFX Designer](https://killedbyapixel.github.io/ZzFX/) | Procedural generator | MIT tool | Design ZzFX parameters interactively |

**Kenney.nl** is the strongest recommendation for complete SFX packs — all CC0, professionally organized, and includes game UI, impact, retro, and ambient packs ready to use.

**Format guidance:** Always export/download in **both WebM (Opus) and MP3**. WebM is better quality at low bitrate; MP3 has universal compatibility. Provide both to Howler in `src: ['file.webm', 'file.mp3']`.

---

## Developer Flags

Flag these before writing code:

| Situation | What to Flag |
|---|---|
| File-based SFX needed | "I need audio file URLs. Please host them and provide URLs. Supply both .webm and .mp3 versions of each file." |
| CORS | "The server hosting audio files needs `Access-Control-Allow-Origin: *` headers." |
| Sprite generation | "For performance I'll use a single audio sprite. Can you run `npx audiosprite` on the individual files, or share them so I can specify the sprite map?" |
| iOS testing | "SFX behavior on iOS Safari differs significantly from desktop — test on a real device, not simulator." |
| High-frequency SFX | "If this SFX fires many times per second (e.g., per particle), I'll throttle it to prevent audio dropout." |
| Mute control needed | "I'll add a mute toggle. Let me know if there's a design pattern you'd prefer (icon in corner, settings panel, etc.)." |

---

## What to Check With the Developer

1. **Self-contained or file-based?** → Determines ZzFX vs Howler.js
2. **Which interactions need SFX?** → Map them to the earcon registry
3. **Should SFX be mutable/volume-adjustable?** → Affects UI
4. **Are there branded/specific sounds needed?** → Developer must supply files
5. **8-bit / retro aesthetic, or realistic?** → ZzFX excels at retro; Howler handles realistic files
6. **Mobile required?** → Extra testing + iOS-specific fixes required

---

## Integration With Music

When using both music.md and sfx.md patterns together, share a single `AudioContext`:

```javascript
// With Tone.js music + ZzFX SFX:
// Tone.js creates its own context: Tone.context
// ZzFX creates its own: zzfxX
// These are independent — both need resume() on first gesture

async function initAudio() {
  await Tone.start(); // resumes Tone's AudioContext
  zzfxX?.resume();    // resumes ZzFX's AudioContext
}
document.addEventListener('click', initAudio, { once: true });
```

For more complex integration where SFX need to go through the same audio graph as music (e.g., applying a global master bus compressor), use Web Audio API directly for both and pass the shared `AudioContext` to your SFX system.

**Volume balance guidance:**
- Background music: 0.3–0.5 relative to max
- UI SFX: 0.5–0.7 (perceptually above music)
- Impact / notification SFX: 0.6–0.9 (salient, attention-getting)
- Ambient SFX: 0.2–0.4 (below music level)

---

## References

- ZzFX: https://github.com/KilledByAPixel/ZzFX (Frank Force, MIT)
- ZzFXM: https://github.com/keithclark/ZzFXM (Keith Clark, MIT)
- Howler.js: https://github.com/goldfire/howler.js (MIT)
- Ohala, J.J. (1994). The frequency code underlies the sound symbolic use of voice pitch. In Hinton et al. (Eds.), *Sound Symbolism*. Cambridge University Press.
- Morton, E.S. (1977). On the occurrence and significance of motivation-structural rules in some bird and mammal sounds. *American Naturalist*, 111(981), 855–869.
- MDN Web Audio API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
- Chrome Autoplay Policy: https://developer.chrome.com/blog/autoplay
- Kenney Audio Assets: https://www.kenney.nl/assets?q=audio
