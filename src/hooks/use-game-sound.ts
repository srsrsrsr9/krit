"use client";

export type SoundEvent = "correct" | "wrong" | "achievement" | "transition" | "click";

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
) {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.connect(g);
  g.connect(ctx.destination);
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(gain, ctx.currentTime + startOffset);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startOffset + duration);
  osc.start(ctx.currentTime + startOffset);
  osc.stop(ctx.currentTime + startOffset + duration + 0.01);
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
