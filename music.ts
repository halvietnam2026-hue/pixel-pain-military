/**
 * Procedural chill lo-fi music generator.
 * - Simple low-pass filtered square/triangle leads over a i–vi–IV–v jazz chord loop (Eb minor-ish)
 * - Soft noise "hat" + kick 4-on-the-floor for groove
 * - Mute / setVolume controls
 * - Tones kept low so it sits in the background.
 */

type Ctx = AudioContext;
let ctx: Ctx | null = null;
let master: GainNode | null = null;
let musicGain: GainNode | null = null;
let sfxGain: GainNode | null = null;
let timer: number | null = null;
let started = false;
let musicOn = true;
let musicVol = 0.35;
let sfxVol = 0.6;
let currentStep = 0;

const BPM = 72;

function ensureCtx() {
  if (ctx) return ctx;
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = 1;
  master.connect(ctx.destination);
  musicGain = ctx.createGain();
  musicGain.gain.value = musicOn ? musicVol : 0;
  musicGain.connect(master);
  sfxGain = ctx.createGain();
  sfxGain.gain.value = sfxVol;
  sfxGain.connect(master);
  return ctx;
}

function midiToFreq(m: number) { return 440 * Math.pow(2, (m - 69) / 12); }

function playNote(freq: number, when: number, dur: number, type: OscillatorType, gain: number, lp?: number) {
  if (!ctx || !musicGain) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.value = freq;
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = lp ?? 1800;
  filter.Q.value = 0.8;
  g.gain.setValueAtTime(0, when);
  g.gain.linearRampToValueAtTime(gain, when + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
  o.connect(filter); filter.connect(g); g.connect(musicGain);
  o.start(when); o.stop(when + dur + 0.05);
}

function playKick(when: number) {
  if (!ctx || !musicGain) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = "sine";
  o.frequency.setValueAtTime(120, when);
  o.frequency.exponentialRampToValueAtTime(40, when + 0.18);
  g.gain.setValueAtTime(0.5, when);
  g.gain.exponentialRampToValueAtTime(0.001, when + 0.25);
  o.connect(g); g.connect(musicGain);
  o.start(when); o.stop(when + 0.3);
}

function playHat(when: number) {
  if (!ctx || !musicGain) return;
  const bufSize = 0.05 * ctx.sampleRate;
  const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / bufSize);
  const s = ctx.createBufferSource(); s.buffer = buf;
  const hp = ctx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 6000;
  const g = ctx.createGain(); g.gain.value = 0.03;
  s.connect(hp); hp.connect(g); g.connect(musicGain);
  s.start(when);
}

/* Chord progression (midi roots) – 2 bar each, 8 bar loop. */
const CHORDS: number[][] = [
  [51, 54, 58, 63], // Ebm7
  [54, 57, 61, 66], // Gbmaj7-ish minor 6
  [53, 56, 60, 65], // Abmaj7
  [56, 59, 62, 67], // Bb7 altered (v)
  [51, 54, 58, 63],
  [54, 57, 61, 66],
  [53, 56, 60, 65],
  [56, 59, 62, 65],
];

/* Simple melody pentatonic on Eb min, with randomness */
const SCALE = [51, 53, 55, 56, 58, 60, 63, 65, 67, 70];

function pickNote(r: number) { return SCALE[Math.floor(r * SCALE.length)]; }

function schedule() {
  if (!ctx) return;
  const stepDur = 60 / BPM / 2; // 8th notes
  const lookahead = 0.2;
  const now = ctx.currentTime;

  const bar = Math.floor(currentStep / 16);
  const chord = CHORDS[bar % CHORDS.length];
  const t = now;

  // pad chord (very quiet triangle)
  chord.forEach((m) => playNote(midiToFreq(m), t, stepDur * 16 + 0.2, "triangle", 0.02, 800));

  // bass root note on downbeats
  [0, 4, 8, 12].forEach((s) => {
    if (s % 16 === currentStep % 16) {
      playNote(midiToFreq(chord[0] - 12), t + s * stepDur, 0.35, "sine", 0.13, 500);
    }
  });

  // drums: kick 1,5,9,13 of 16; hats every 2 steps
  for (let s = 0; s < 16; s++) {
    const when = t + s * stepDur;
    if (s % 4 === 0) playKick(when);
    if (s % 2 === 0) playHat(when);
  }

  // lead melody, random sparse notes
  let cursor = 0;
  while (cursor < 16) {
    const noteStep = cursor;
    if (Math.random() < 0.45) {
      const n = pickNote(Math.random());
      const d = Math.random() < 0.3 ? 4 : 2;
      playNote(midiToFreq(n), t + noteStep * stepDur, d * stepDur * 0.9, "square", 0.035, 2200);
      cursor += d;
    } else {
      cursor += 1;
    }
  }

  currentStep = (currentStep + 16) % 128;

  timer = window.setTimeout(schedule, (stepDur * 16 - lookahead) * 1000);
}

export function startMusic() {
  const c = ensureCtx();
  if (c.state === "suspended") c.resume();
  if (started) return;
  started = true;
  currentStep = 0;
  schedule();
}

export function stopMusic() {
  if (timer) { window.clearTimeout(timer); timer = null; }
  started = false;
}

export function setMusicEnabled(on: boolean) {
  musicOn = on;
  ensureCtx();
  if (musicGain) musicGain.gain.value = on ? musicVol : 0;
  if (on && !started) startMusic();
}

export function setMusicVolume(v: number) {
  musicVol = Math.max(0, Math.min(1, v));
  if (musicGain && musicOn) musicGain.gain.value = musicVol;
}
export function setSfxVolume(v: number) {
  sfxVol = Math.max(0, Math.min(1, v));
  if (sfxGain) sfxGain.gain.value = sfxVol;
}

export function getSfxVolume() { return sfxVol; }
export function getMusicVolume() { return musicVol; }
export function getMusicEnabled() { return musicOn; }

/* expose sfx output gain for sfx.ts (optional) */
export function getSfxGain(): GainNode | null {
  ensureCtx();
  return sfxGain;
}

export function dispose() {
  stopMusic();
  if (ctx) { ctx.close(); ctx = null; master = null; musicGain = null; sfxGain = null; }
}
