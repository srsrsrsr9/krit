"use client";

export type SoundEvent =
  | "correct" | "wrong" | "achievement" | "transition" | "click"
  | "tick" | "crack" | "thud" | "whoosh" | "boom";

// Module-level singletons — shared across all block instances in a lesson.
let sharedCtx: AudioContext | null = null;
let globalMuted = false;

export function setGlobalMute(muted: boolean) {
  globalMuted = muted;
}

function getCtx(): AudioContext | null {
  if (typeof AudioContext === "undefined") return null;
  if (!sharedCtx || sharedCtx.state === "closed") {
    sharedCtx = new AudioContext();
  }
  return sharedCtx;
}

function playTone(
  ctx: AudioContext,
  freq: number,
  duration: number,
  type: OscillatorType,
  gain: number,
  startOffset = 0,
  glideTo: number | null = null,
) {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.connect(g);
  g.connect(ctx.destination);
  osc.type = type;
  const t0 = ctx.currentTime + startOffset;
  osc.frequency.setValueAtTime(freq, t0);
  if (glideTo !== null) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(glideTo, 1), t0 + duration);
  }
  g.gain.setValueAtTime(gain, t0);
  g.gain.exponentialRampToValueAtTime(0.001, t0 + duration);
  osc.start(t0);
  osc.stop(t0 + duration + 0.01);
}

// Quick noise burst — used for impact/whoosh SFX. Synthesised, no files.
function playNoise(
  ctx: AudioContext,
  duration: number,
  gain: number,
  hp = 0,
  startOffset = 0,
) {
  const t0 = ctx.currentTime + startOffset;
  const buf = ctx.createBuffer(1, Math.max(1, Math.floor(ctx.sampleRate * duration)), ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  let last: AudioNode = src;
  if (hp > 0) {
    const filt = ctx.createBiquadFilter();
    filt.type = "highpass";
    filt.frequency.value = hp;
    last.connect(filt);
    last = filt;
  }
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  last.connect(g);
  g.connect(ctx.destination);
  src.start(t0);
  src.stop(t0 + duration + 0.05);
}

function synthesise(ctx: AudioContext, event: SoundEvent) {
  switch (event) {
    case "correct":
      playTone(ctx, 220, 0.06, "sine", 0.4);
      playTone(ctx, 440, 0.12, "sine", 0.4, 0.07);
      break;
    case "wrong":
      playTone(ctx, 300, 0.07, "sawtooth", 0.25);
      playTone(ctx, 180, 0.12, "sawtooth", 0.2, 0.08);
      break;
    case "achievement":
      playTone(ctx, 261, 0.08, "triangle", 0.35);
      playTone(ctx, 329, 0.08, "triangle", 0.35, 0.09);
      playTone(ctx, 392, 0.14, "triangle", 0.35, 0.18);
      break;
    case "transition":
      playTone(ctx, 800, 0.04, "sine", 0.15);
      break;
    case "click":
      playTone(ctx, 600, 0.03, "sine", 0.1);
      break;
    // ── Comic-strip SFX ─────────────────────────────────────────────────
    case "tick":
      // dry, mechanical clock tick — two crisp pings
      playTone(ctx, 1400, 0.025, "sine", 0.30);
      playTone(ctx, 1800, 0.030, "sine", 0.22, 0.06);
      break;
    case "crack":
      // sharp impact — high-band noise burst plus pitch-down sawtooth
      playNoise(ctx, 0.06, 0.28, 2200);
      playTone(ctx, 1400, 0.10, "sawtooth", 0.22, 0, 380);
      break;
    case "thud":
      // heavy low impact — low sine plus tight low-end thump
      playTone(ctx, 80, 0.22, "sine", 0.50);
      playNoise(ctx, 0.05, 0.10, 80);
      break;
    case "whoosh":
      // air sweep — band-limited noise plus low sawtooth glide upward
      playNoise(ctx, 0.32, 0.14, 700);
      playTone(ctx, 220, 0.32, "sawtooth", 0.10, 0, 1100);
      break;
    case "boom":
      // deep cinematic boom — sub sine + harmonic + attack thump
      playTone(ctx, 55, 0.50, "sine", 0.55);
      playTone(ctx, 88, 0.32, "triangle", 0.22, 0.04);
      playNoise(ctx, 0.05, 0.12, 100);
      break;
  }
}

export function useGameSound(): (event: SoundEvent) => void {
  return function playSound(event: SoundEvent) {
    if (globalMuted) return;
    const ctx = getCtx();
    if (!ctx) return;
    // iOS Safari suspends AudioContext until a user gesture; resume before playing.
    if (ctx.state === "suspended") {
      void ctx.resume().then(() => synthesise(ctx, event));
    } else {
      synthesise(ctx, event);
    }
  };
}
