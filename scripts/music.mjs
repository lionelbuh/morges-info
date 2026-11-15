/**
 * The Morges.info music, composed for the site: a 5-note "sound logo" (marimba-like, "Mor-ges . in-fo")
 * that opens and closes every video, and a light plucked backing loop in between.
 * Pure synthesis, no samples or third-party recordings: writes a 16-bit stereo WAV.
 *
 * Usage: node scripts/music.mjs <file.wav> [seconds]
 */
import { writeFileSync } from 'node:fs';

const SR = 44100;
const midi = (n) => 440 * 2 ** ((n - 69) / 12);

function addMarimba(buf, t0, note, vel = 0.5, dur = 1.2) {
  const f = midi(note);
  const start = Math.round(t0 * SR);
  const n = Math.round(dur * SR);
  for (let i = 0; i < n && start + i < buf.length; i++) {
    const t = i / SR;
    const env = Math.exp(-t * 5.5) * Math.min(1, t * 400);
    const v = Math.sin(2 * Math.PI * f * t) + 0.35 * Math.sin(2 * Math.PI * f * 4 * t) * Math.exp(-t * 14) + 0.12 * Math.sin(2 * Math.PI * f * 10 * t) * Math.exp(-t * 30);
    buf[start + i] += v * env * vel;
  }
}

// Karplus-Strong plucked string (ukulele-like)
function addPluck(buf, t0, note, vel = 0.25, dur = 1.4) {
  const f = midi(note);
  const p = Math.round(SR / f);
  const line = Float32Array.from({ length: p }, () => Math.random() * 2 - 1);
  const start = Math.round(t0 * SR);
  const n = Math.round(dur * SR);
  let idx = 0;
  for (let i = 0; i < n && start + i < buf.length; i++) {
    const next = (idx + 1) % p;
    const out = line[idx];
    line[idx] = 0.996 * 0.5 * (line[idx] + line[next]);
    idx = next;
    const fade = Math.min(1, (n - i) / (0.05 * SR));
    buf[start + i] += out * vel * fade;
  }
}

function addKick(buf, t0, vel = 0.35) {
  const start = Math.round(t0 * SR);
  for (let i = 0; i < 0.18 * SR && start + i < buf.length; i++) {
    const t = i / SR;
    buf[start + i] += Math.sin(2 * Math.PI * (55 + 90 * Math.exp(-t * 30)) * t) * Math.exp(-t * 18) * vel;
  }
}
function addShaker(buf, t0, vel = 0.04) {
  const start = Math.round(t0 * SR);
  let prev = 0;
  for (let i = 0; i < 0.06 * SR && start + i < buf.length; i++) {
    const w = Math.random() * 2 - 1;
    const hp = w - prev; // crude high-pass
    prev = w;
    buf[start + i] += hp * Math.exp(-(i / SR) * 60) * vel;
  }
}

// The sound logo: "Mor-ges . in-fo" — G4 C5 E5 . D5 G5, in C major, bright and friendly
const LOGO = [
  [0.0, 67, 0.55], [0.16, 72, 0.55], [0.32, 76, 0.6], [0.62, 74, 0.5], [0.8, 79, 0.75],
];
function logo(buf, t0, vel = 1) {
  for (const [dt, n, v] of LOGO) {
    addMarimba(buf, t0 + dt, n, v * vel, 1.6);
    addMarimba(buf, t0 + dt, n - 12, v * vel * 0.35, 1.2);
  }
}

// Backing loop: C - Am - F - G, 104 bpm, one chord per bar, gentle plucks and a soft beat
const BPM = 104;
const beat = 60 / BPM;
const CHORDS = [[60, 64, 67], [57, 60, 64], [53, 57, 60], [55, 59, 62]];
function backing(buf, t0, t1) {
  let bar = 0;
  for (let t = t0; t < t1 - 0.01; t += 4 * beat, bar++) {
    const ch = CHORDS[bar % 4];
    for (let b = 0; b < 4; b++) {
      const tb = t + b * beat;
      if (tb >= t1) break;
      addKick(buf, tb, b % 2 === 0 ? 0.3 : 0.12);
      addShaker(buf, tb + beat / 2, 0.05);
      // strum: a short down-strum on 1 and 3, up-strum on the off-beats
      ch.forEach((n, k) => addPluck(buf, tb + k * 0.012, n + (b % 2 ? 12 : 0), b % 2 ? 0.1 : 0.16, 1.2));
    }
    addPluck(buf, t, ch[0] - 12, 0.22, 2.2); // bass
  }
}

export function music(seconds, file) {
  const L = new Float32Array(Math.round(seconds * SR));
  logo(L, 0.15, 1);
  const end = seconds - 2.2;
  backing(L, 1.4, end);
  logo(L, end, 0.9);
  // gentle fade out and normalise to about -3 dBFS
  let peak = 0;
  for (let i = 0; i < L.length; i++) {
    const t = i / SR;
    if (t > seconds - 0.6) L[i] *= Math.max(0, (seconds - t) / 0.6);
    peak = Math.max(peak, Math.abs(L[i]));
  }
  const g = 0.7 / (peak || 1);
  const data = Buffer.alloc(L.length * 4);
  for (let i = 0; i < L.length; i++) {
    const s = Math.max(-1, Math.min(1, L[i] * g));
    data.writeInt16LE(Math.round(s * 32767), i * 4);
    data.writeInt16LE(Math.round(s * 32767), i * 4 + 2);
  }
  const header = Buffer.alloc(44);
  header.write('RIFF', 0); header.writeUInt32LE(36 + data.length, 4); header.write('WAVE', 8);
  header.write('fmt ', 12); header.writeUInt32LE(16, 16); header.writeUInt16LE(1, 20); header.writeUInt16LE(2, 22);
  header.writeUInt32LE(SR, 24); header.writeUInt32LE(SR * 4, 28); header.writeUInt16LE(4, 32); header.writeUInt16LE(16, 34);
  header.write('data', 36); header.writeUInt32LE(data.length, 40);
  writeFileSync(file, Buffer.concat([header, data]));
}

if (process.argv[1] && process.argv[1].endsWith('music.mjs') && process.argv[2]) music(Number(process.argv[3] || 3), process.argv[2]);
