// Story video: a quiet music bed made from sine waves and seeded noise, so it carries no license.
// The same tempo throughout, an onset within 3 s, the feel changing between scenes and a whoosh into every camera move.
// Exports makeMusic(); assemble.mjs mixes it under the voice with sidechain ducking.

export const BPM = 100;
export const BEAT = 60 / BPM;

const CHORDS = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]; // Am, F, C, G (MIDI), two bars each
const hz = (note) => 440 * 2 ** ((note - 69) / 12);

// Per-scene energy: kick (0 off, 1 half-time, 2 four on the floor), hats, pad and bass levels.
const FEEL = {
  world: { kick: 2, hats: 0.5, pad: 0.6, bass: 0.7 },
  grade: { kick: 1, hats: 0.25, pad: 0.8, bass: 0.6 },
  scan: { kick: 1, hats: 0.6, pad: 0.6, bass: 0.8 },
  proof: { kick: 2, hats: 0.6, pad: 0.7, bass: 0.8 },
  loop: { kick: 1, hats: 0.35, pad: 0.9, bass: 0.6 },
  fit: { kick: 2, hats: 0.6, pad: 0.7, bass: 0.8 },
  result: { kick: 0, hats: 0, pad: 1, bass: 0.5 }
};

export function makeMusic({ total, rate, scenes }) {
  const out = new Float32Array(Math.ceil(total * rate));
  let seed = 20261028;
  const noise = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 31) - 1;
  const add = (start, length, fn) => {
    const from = Math.max(0, Math.round(start * rate)), to = Math.min(out.length, Math.round((start + length) * rate));
    for (let i = from; i < to; i++) out[i] += fn((i - from) / rate);
  };
  const sceneAt = (t) => Object.entries(scenes).find(([, s]) => t >= s.start && t < s.end)?.[0] || "result";

  const beats = Math.floor(total / BEAT);
  for (let b = 0; b < beats; b++) {
    const t = b * BEAT, feel = FEEL[sceneAt(t)], inBar = b % 4;
    const fadeOut = Math.min(1, Math.max(0, (total - 2.5 - t) / 3));
    // Kick: a falling sine with a fast decay.
    if (feel.kick === 2 || (feel.kick === 1 && (inBar === 0 || inBar === 2))) {
      add(t, 0.35, (x) => 0.55 * fadeOut * Math.sin(2 * Math.PI * (45 * x + 60 * (1 - Math.exp(-x * 30)) / 30)) * Math.exp(-x * 9));
    }
    // Hats on the off-beat: differenced noise, 40 ms.
    if (feel.hats) {
      let last = 0;
      add(t + BEAT / 2, 0.05, (x) => { const n = noise(), v = n - last; last = n; return 0.05 * feel.hats * fadeOut * v * Math.exp(-x * 90); });
    }
    // Bass on beat one: the chord root an octave down.
    if (inBar === 0) {
      const root = hz(CHORDS[Math.floor(b / 8) % 4][0] - 12);
      add(t, BEAT * 3.6, (x) => 0.16 * feel.bass * fadeOut * Math.sin(2 * Math.PI * root * x) * Math.min(1, x * 40) * Math.exp(-x * 0.9));
    }
  }
  // Pad: one chord per two bars, slow attack and release, sines an octave apart for warmth.
  const bar = BEAT * 4;
  for (let c = 0; c * bar * 2 < total; c++) {
    const t = c * bar * 2, notes = CHORDS[c % 4], level = FEEL[sceneAt(t)].pad;
    add(t, bar * 2 + 1.5, (x) => {
      const env = Math.min(1, x / 1.2) * Math.min(1, Math.max(0, (bar * 2 + 1.5 - x) / 1.5));
      let v = 0;
      for (const note of notes) v += Math.sin(2 * Math.PI * hz(note) * x) + 0.35 * Math.sin(2 * Math.PI * hz(note + 12) * x + 0.7);
      return 0.045 * level * env * v;
    });
  }
  // A whoosh into each scene: noise through a rising one-pole filter, 0.6 s, peaking at the cut.
  for (const [name, scene] of Object.entries(scenes)) {
    if (name === "world") continue;
    let low = 0;
    add(scene.start - 0.6, 0.75, (x) => {
      const k = 0.02 + 0.5 * Math.min(1, x / 0.6);
      low += k * (noise() - low);
      return 0.22 * low * Math.sin(Math.PI * Math.min(1, x / 0.75));
    });
  }
  const peak = out.reduce((m, v) => Math.max(m, Math.abs(v)), 0) || 1;
  const pcm = new Int16Array(out.length);
  for (let i = 0; i < out.length; i++) pcm[i] = Math.round((out[i] / peak) * 0.8 * 32767);
  return pcm;
}
