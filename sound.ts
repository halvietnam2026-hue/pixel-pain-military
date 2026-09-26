import { getSfxGain, getSfxVolume } from "./music";

let enabled = true;
let vibrateOn = true;
let ctx: AudioContext | null = null;

export function setSoundEnabled(v: boolean) { enabled = v; }
export function setVibrateEnabled(v: boolean) { vibrateOn = v; }

function ensureCtx() {
  if (ctx) return ctx;
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  ctx = new AC();
  return ctx;
}

function tone(freq: number, dur: number, type: OscillatorType = "square", vol = 0.12, delay = 0) {
  if (!enabled) return;
  try {
    const c = ensureCtx();
    if (c.state === "suspended") c.resume();
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.value = freq;
    o.connect(g);
    const out = getSfxGain();
    if (out) g.connect(out); else g.connect(c.destination);
    const t = c.currentTime + delay;
    const scale = vol * getSfxVolume();
    g.gain.setValueAtTime(scale, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.start(t); o.stop(t + dur + 0.02);
  } catch { /* ignore */ }
}

let lastPop = 0;
export const sfx = {
  click: () => tone(520, 0.06, "square", 0.08),
  pop: () => {
    const now = performance.now();
    if (now - lastPop < 45) return;
    lastPop = now;
    tone(740 + Math.random() * 120, 0.07, "triangle", 0.1);
  },
  error: () => {
    tone(140, 0.22, "sawtooth", 0.12);
    if (vibrateOn && navigator.vibrate) navigator.vibrate(120);
  },
  colorDone: () => { tone(660, 0.08, "square", 0.08); tone(880, 0.12, "square", 0.08, 0.08); },
  win: () => {
    [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.18, "square", 0.09, i * 0.12));
    if (vibrateOn && navigator.vibrate) navigator.vibrate([60, 40, 60]);
  },
  coin: () => { tone(988, 0.06, "square", 0.08); tone(1319, 0.14, "square", 0.08, 0.06); },
  page: () => tone(380, 0.05, "square", 0.06),
};
