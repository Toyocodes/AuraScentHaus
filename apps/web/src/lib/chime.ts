/**
 * A soft two-note chime for new notifications, made with the Web Audio API (no sound file).
 *
 * Browsers only allow sound after the person has interacted with the page, so the audio is
 * switched on at the first click or key press. Before that, `playChime()` stays silent.
 */
let ctx: AudioContext | null = null;

function unlock() {
  if (typeof window === "undefined") return;
  try {
    ctx ??= new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();
  } catch {
    ctx = null; // no Web Audio support: notifications still show, just without sound
  }
}

if (typeof window !== "undefined") {
  const opts = { capture: true, passive: true } as const;
  window.addEventListener("pointerdown", unlock, opts);
  window.addEventListener("keydown", unlock, opts);
}

function note(audio: AudioContext, frequency: number, start: number, duration: number) {
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = "sine";
  osc.frequency.value = frequency;
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(0.25, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain).connect(audio.destination);
  osc.start(start);
  osc.stop(start + duration + 0.05);
}

export function playChime() {
  if (!ctx || ctx.state !== "running") return;
  const now = ctx.currentTime;
  note(ctx, 880, now, 0.6); // A5
  note(ctx, 1318.5, now + 0.15, 0.9); // E6
}
