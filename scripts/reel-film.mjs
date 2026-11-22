/**
 * Monday's Instagram video, "Morges hier", as a silent film (1080×1920): a countdown leader, an iris
 * opening on Gaston in his top hat, an Art nouveau title card, the old photograph shown whole with a slow
 * push-in, the story typed in on intertitles, then the film turns into colour for "Et aujourd'hui ?" and
 * the Morges.info end card (harbour emblem and flag of Morges).
 * Music: an original piano waltz in A minor with a projector's clatter, synthesised here (no samples or
 * recordings), ending on the Morges.info sound logo played on the piano.
 * Only public-domain photographs are used, always whole, never cropped.
 *
 * Called by scripts/reel.mjs on Mondays: node scripts/reel.mjs [YYYY-MM-DD]
 * Output in reels/out/<date>/: morges-info-<date>.mp4, legende.txt and slide-<n>.png (one still per scene).
 */
import sharp from 'sharp';
import { spawn, execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { publishedViewpoints, shownPhotos } from '../src/data/viewpoints.js';
import { todayInMorges } from '../src/data/events.js';
import { emblemShapes } from '../src/site/emblem.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const W = 1080, H = 1920, FPS = 25;
const CREAM = '#efe3c8', SEPIA = '#2a2118', DARK = '#120e0a', GOLD = '#c9a86a';
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const ease = (x) => { x = clamp01(x); return x < 0.5 ? 4 * x ** 3 : 1 - (-2 * x + 2) ** 3 / 2; };
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
function wrap(text, max) {
  const lines = []; let line = '';
  for (const w of text.split(/[ \t\n]+/)) { if (`${line} ${w}`.trim().length > max && line) { lines.push(line); line = w; } else line = `${line} ${w}`.trim(); }
  if (line) lines.push(line); return lines;
}

// ---- the day's content (same choice as scripts/reel.mjs on a Monday)
const day = process.argv[2] || todayInMorges();
const DIR = path.join(ROOT, 'reels', 'out', day);
rmSync(DIR, { recursive: true, force: true });
mkdirSync(DIR, { recursive: true });
const dayNumber = Math.floor(Date.parse(`${day}T00:00:00Z`) / 86400000);
const week = Math.floor((dayNumber + 3) / 7);
const free = publishedViewpoints().map((vp) => ({ vp, photo: shownPhotos(vp).then })).filter(({ photo }) => photo && photo.rights.status === 'public-domain');
const { vp, photo } = free[((week % free.length) + free.length) % free.length];
const year = photo.date.value.slice(0, 4);
const when = photo.date.precision === 'circa' ? `vers ${year}` : `en ${year}`;
const credit = `Photo : ${photo.rights.credit}, domaine public`;
const story = (photo.caption || vp.title).fr;
const HASHTAGS = '#Morges #MorgesInfo #Vaud #LacLéman #Suisse #GastonLeCygne';
const sentences = story.match(/[^.!?]+[.!?]+/g) || [story];

const SCENES = [
  { id: 'leader', d: 2.2 },
  { id: 'iris', d: 2.8 },
  { id: 'title', d: 3.2 },
  { id: 'photo', d: 4.6 },
  ...sentences.map((s) => ({ id: 'card', text: s.trim(), d: Math.max(3.4, 1.6 + s.length * 0.055) })),
  { id: 'today', d: 3.6 },
  { id: 'end', d: 3.2 },
];
let acc = 0; for (const s of SCENES) { s.start = acc; acc += s.d; }
const TOTAL = acc;

// ---- assets
const PH = await sharp(path.join(ROOT, 'public', photo.image.src)).grayscale().tint({ r: 150, g: 110, b: 70 }).png().toBuffer();
const pm = await sharp(PH).metadata();
const grains = [];
for (let k = 0; k < 6; k++) {
  const n = await sharp({ create: { width: 360, height: 640, channels: 3, noise: { type: 'gaussian', mean: 128, sigma: 60 } } }).png().toBuffer();
  grains.push(await sharp(n).resize(W, H, { kernel: 'nearest' }).ensureAlpha(0.09).png().toBuffer());
}
let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

// ---- drawing pieces
const FLAG = `<path d="M0 0h100v50H0z" fill="#fff"/><path d="M0 50h100v50H0z" fill="#d52b1e"/>
  <path d="M0 18Q12.5 12.5 25 18T50 18T75 18T100 18V32Q87.5 37.5 75 32T50 32T25 32T0 32Z" fill="#d52b1e"/>
  <path d="M0 68Q12.5 62.5 25 68T50 68T75 68T100 68V82Q87.5 87.5 75 82T50 82T25 82T0 82Z" fill="#fff"/>`;

/** Art-nouveau frame of an intertitle. */
function frameBox(x, y, w, h, c = GOLD) {
  const curl = (cx, cy, sx, sy) => `<path transform="translate(${cx} ${cy}) scale(${sx} ${sy})" d="M0 60 C0 20 20 0 60 0 M14 60 C14 30 30 14 60 14 M0 60 C-10 80 20 95 30 75 C38 60 20 52 14 60" fill="none" stroke="${c}" stroke-width="4"/>`;
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="${c}" stroke-width="5"/>
    <rect x="${x + 18}" y="${y + 18}" width="${w - 36}" height="${h - 36}" fill="none" stroke="${c}" stroke-width="2"/>
    ${curl(x + 30, y + 30, 1, 1)}${curl(x + w - 30, y + 30, -1, 1)}${curl(x + 30, y + h - 30, 1, -1)}${curl(x + w - 30, y + h - 30, -1, -1)}
    <path d="M${x + w / 2 - 70} ${y + h - 70} h50 l20 -12 l20 12 l20 -12 l20 12 h50" fill="none" stroke="${c}" stroke-width="3"/>`;
}

/** Gaston in a top hat, drawn like an old engraving (cream and brown). */
function gastonOld(cx, cy, s, t) {
  const bob = Math.sin(t * 2.2) * 6;
  const blink = t % 2.7 < 0.12 ? 0.1 : 1;
  return `<g transform="translate(${cx} ${cy + bob}) scale(${s})">
    <path d="M20 200 L30 60 C90 10 10 -70 45 -140 C65 -185 125 -188 138 -150" fill="none" stroke="${SEPIA}" stroke-width="50" stroke-linecap="round"/>
    <path d="M20 200 L30 60 C90 10 10 -70 45 -140 C65 -185 125 -188 138 -150" fill="none" stroke="${CREAM}" stroke-width="40" stroke-linecap="round"/>
    <circle cx="132" cy="-155" r="36" fill="${CREAM}" stroke="${SEPIA}" stroke-width="5"/>
    <path d="M160 -172 L214 -156 L163 -148 Z" fill="#b98a55" stroke="${SEPIA}" stroke-width="3"/>
    <ellipse cx="142" cy="-166" rx="7" ry="${8 * blink}" fill="${SEPIA}"/>
    <circle cx="148" cy="-152" r="13" fill="none" stroke="${SEPIA}" stroke-width="3"/>
    <path d="M148 -139 C150 -120 140 -110 132 -100" fill="none" stroke="${SEPIA}" stroke-width="2"/>
    <ellipse cx="128" cy="-188" rx="52" ry="9" fill="${SEPIA}"/>
    <rect x="98" y="-250" width="60" height="62" rx="4" fill="${SEPIA}"/>
    <rect x="98" y="-206" width="60" height="10" fill="#6b4a2a"/>
  </g>`;
}

/** Typewriter: the first `n` characters of the lines. */
function typed(lines, n) {
  const out = []; let left = n;
  for (const l of lines) { out.push(l.slice(0, Math.max(0, left))); left -= l.length + 1; }
  return out;
}

function leader(st) {
  const k = Math.min(2, Math.floor(st / (2.2 / 3)));
  const n = 3 - k;
  const a = ((st % (2.2 / 3)) / (2.2 / 3)) * 360;
  const r = 330;
  const x = 540 + r * Math.sin((a * Math.PI) / 180), y = 960 - r * Math.cos((a * Math.PI) / 180);
  return `<rect width="${W}" height="${H}" fill="#8a7b66"/>
    <path d="M540 960 L540 ${960 - r} A${r} ${r} 0 ${a > 180 ? 1 : 0} 1 ${x.toFixed(1)} ${y.toFixed(1)} Z" fill="#5e5242"/>
    <circle cx="540" cy="960" r="${r}" fill="none" stroke="${CREAM}" stroke-width="6"/>
    <circle cx="540" cy="960" r="${r - 50}" fill="none" stroke="${CREAM}" stroke-width="3"/>
    <path d="M60 960 H1020 M540 300 V1620" stroke="${CREAM}" stroke-width="3" opacity=".7"/>
    <text x="540" y="1060" text-anchor="middle" font-family="DejaVu Serif" font-size="300" font-weight="bold" fill="${CREAM}">${n}</text>`;
}

function sprockets(t) {
  const off = (t * 220) % 120;
  let s = '';
  for (let y = -120 + off; y < H; y += 120) s += `<rect x="14" y="${y}" width="34" height="56" rx="8" fill="#000" opacity=".55"/><rect x="${W - 48}" y="${y}" width="34" height="56" rx="8" fill="#000" opacity=".55"/>`;
  return s;
}

/** Film damage: flicker, scratches, dust, vignette. Less of it when `amount` goes down. */
function damage(t, amount) {
  if (amount <= 0) return '';
  const f = Math.floor(t * FPS);
  seed = 1000 + f * 31;
  const flick = (0.04 + rnd() * 0.08) * amount;
  let s = `<rect width="${W}" height="${H}" fill="#000" opacity="${flick.toFixed(3)}"/>`;
  if (rnd() < 0.6) { const x = 80 + rnd() * 920; s += `<path d="M${x.toFixed(0)} 0 L${(x + rnd() * 20 - 10).toFixed(0)} ${H}" stroke="${CREAM}" stroke-width="${(1 + rnd() * 2).toFixed(1)}" opacity="${(0.25 * amount).toFixed(2)}"/>`; }
  for (let k = 0; k < 4; k++) if (rnd() < 0.5) s += `<circle cx="${(rnd() * W).toFixed(0)}" cy="${(rnd() * H).toFixed(0)}" r="${(1 + rnd() * 4).toFixed(1)}" fill="${rnd() < 0.5 ? '#000' : CREAM}" opacity="${(0.6 * amount).toFixed(2)}"/>`;
  s += `<rect width="${W}" height="${H}" fill="url(#vig)" opacity="${amount.toFixed(2)}"/>${sprockets(t)}`;
  return s;
}

const DEFS = `<defs><radialGradient id="vig" cx=".5" cy=".5" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".85"/></radialGradient>
  <radialGradient id="spot" cx=".5" cy=".45" r=".6"><stop offset="0" stop-color="#4a3b2a"/><stop offset="1" stop-color="${DARK}"/></radialGradient>
  <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0f3550"/><stop offset=".6" stop-color="#2f6f8f"/><stop offset="1" stop-color="#7fb3d5"/></linearGradient></defs>`;

function card(lines, st, { size = 82, lh = 106, font = 'Caladea', style = 'italic', speed = 34 } = {}) {
  const shown = typed(lines, Math.floor(st * speed));
  const top = 960 - (lines.length * lh) / 2 + size * 0.35;
  return shown.map((l, i) => `<text x="540" y="${(top + i * lh).toFixed(0)}" text-anchor="middle" font-family="${font}" font-style="${style}" font-size="${size}" fill="${CREAM}">${esc(l)}</text>`).join('');
}

async function frame(t) {
  const sc = SCENES.findLast((s) => t >= s.start);
  const st = t - sc.start;
  const layers = [];
  let svg = '', over = '', dmg = 1, grain = true;
  const jitter = (rnd() - 0.5) * 3;
  switch (sc.id) {
    case 'leader':
      svg = leader(st);
      break;
    case 'iris': {
      const r = ease(st / 1.0) * 620 * (st > sc.d - 0.5 ? 1 - ease((st - (sc.d - 0.5)) / 0.5) : 1);
      svg = `<rect width="${W}" height="${H}" fill="url(#spot)"/>
        <circle cx="540" cy="900" r="430" fill="#3a2e20"/>
        ${gastonOld(470, 1000, 1.9, t)}
        <text x="540" y="1520" text-anchor="middle" font-family="Caladea" font-style="italic" font-size="72" fill="${CREAM}" opacity="${clamp01((st - 0.8) / 0.5)}">Gaston présente…</text>`;
      over = `<path d="M0 0H${W}V${H}H0Z M540 ${960 - r} a${r} ${r} 0 1 0 0.1 0Z" fill="#000" fill-rule="evenodd"/>`;
      break;
    }
    case 'title': {
      const lines = wrap(vp.title.fr, 18);
      svg = `<rect width="${W}" height="${H}" fill="url(#spot)"/>${frameBox(90, 460, 900, 1000)}
        <text x="540" y="620" text-anchor="middle" font-family="DejaVu Serif" font-size="46" font-weight="bold" letter-spacing="14" fill="${GOLD}">MORGES HIER</text>
        <path d="M380 660 H700" stroke="${GOLD}" stroke-width="3"/>
        ${lines.map((l, i) => `<text x="540" y="${880 + i * 96 - (lines.length - 1) * 48}" text-anchor="middle" font-family="DejaVu Serif" font-size="78" font-weight="bold" fill="${CREAM}" opacity="${clamp01((st - 0.3 - i * 0.25) / 0.5)}">${esc(l)}</text>`).join('')}
        <text x="540" y="1300" text-anchor="middle" font-family="Caladea" font-style="italic" font-size="64" fill="${GOLD}" opacity="${clamp01((st - 1.1) / 0.5)}">~ ${esc(when)} ~</text>`;
      break;
    }
    case 'photo': {
      const fitW = 960, fitH = Math.round((pm.height / pm.width) * fitW);
      const k = 0.9 + 0.1 * ease(st / sc.d);
      const w = Math.round(fitW * k), h = Math.round(fitH * k);
      const img = await sharp(PH).resize(w, h).png().toBuffer();
      svg = `<rect width="${W}" height="${H}" fill="${DARK}"/>
        <text x="540" y="${960 + fitH / 2 + 90}" text-anchor="middle" font-family="Caladea" font-style="italic" font-size="40" fill="${CREAM}" opacity=".9">${esc(credit)}</text>`;
      layers.push({ input: img, left: Math.round((W - w) / 2 + jitter), top: Math.round(940 - h / 2) });
      break;
    }
    case 'card':
      svg = `<rect width="${W}" height="${H}" fill="url(#spot)"/>${frameBox(90, 460, 900, 1000)}${card(wrap(sc.text, 19), st)}`;
      break;
    case 'today': {
      // the film turns into colour: today
      const c = ease((st - 0.6) / 1.2);
      dmg = 1 - c; grain = c < 0.9;
      svg = `<rect width="${W}" height="${H}" fill="url(#spot)"/>
        <rect width="${W}" height="${H}" fill="url(#sky)" opacity="${c.toFixed(3)}"/>
        <circle cx="860" cy="300" r="120" fill="#f6d27a" opacity="${(0.9 * c).toFixed(3)}"/>
        <text x="540" y="860" text-anchor="middle" font-family="DejaVu Serif" font-size="92" font-weight="bold" fill="${c > 0.5 ? '#fff' : CREAM}">Et aujourd’hui ?</text>
        <text x="540" y="1000" text-anchor="middle" font-family="Inter" font-size="50" font-weight="600" fill="#fff" opacity="${clamp01((st - 1.4) / 0.5)}">Comparez sur la carte photo</text>
        <text x="540" y="1080" text-anchor="middle" font-family="Inter" font-size="54" font-weight="800" fill="#f6d27a" opacity="${clamp01((st - 1.7) / 0.5)}">morges.info/photos</text>`;
      break;
    }
    case 'end': {
      dmg = 0; grain = false;
      const p = ease(st / 0.8);
      svg = `<rect width="${W}" height="${H}" fill="url(#sky)"/><circle cx="860" cy="300" r="120" fill="#f6d27a" opacity=".9"/>
        <g transform="translate(540 760) scale(${(0.6 + 0.4 * p).toFixed(3)})"><svg x="-180" y="-180" width="360" height="360" viewBox="0 0 200 200">${emblemShapes('end-emblem')}</svg></g>
        <g transform="translate(470 1000) scale(1.4)" opacity="${p}">${FLAG}<path d="M1 1h98v98H1z" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="3"/></g>
        <text x="540" y="1300" text-anchor="middle" font-family="DejaVu Serif" font-size="96" font-weight="bold" fill="#fff" opacity="${p}">Morges<tspan fill="#f6d27a" font-style="italic">.info</tspan></text>
        <text x="540" y="1400" text-anchor="middle" font-family="Caladea" font-style="italic" font-size="56" fill="#fff" opacity="${clamp01((st - 0.8) / 0.5)}">À lundi prochain,</text>
        <text x="540" y="1470" text-anchor="middle" font-family="Caladea" font-style="italic" font-size="56" fill="#fff" opacity="${clamp01((st - 0.8) / 0.5)}">pour un autre voyage dans le temps</text>`;
      break;
    }
  }
  const base = sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${DEFS}${svg}</svg>`));
  const top = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${DEFS}${over}${damage(t, dmg)}</svg>`);
  const comps = [...layers, { input: top, left: 0, top: 0 }];
  if (grain) comps.push({ input: grains[Math.floor(t * FPS) % grains.length], left: 0, top: 0 });
  return base.composite(comps);
}

// ---- video
const silent = path.join(DIR, 'image.mp4');
const ff = spawn('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20', '-movflags', '+faststart', silent], { stdio: ['pipe', 'inherit', 'inherit'] });
const done = new Promise((r) => ff.on('close', r));
const stills = new Set(SCENES.map((s) => Math.round((s.start + s.d * 0.8) * FPS)));
for (let n = 0; n < Math.round(TOTAL * FPS); n++) {
  const img = await frame(n / FPS);
  const buf = await img.removeAlpha().raw().toBuffer();
  if (stills.has(n)) await sharp(buf, { raw: { width: W, height: H, channels: 3 } }).png().toFile(path.join(DIR, `slide-${[...stills].indexOf(n) + 1}.png`));
  if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
}
ff.stdin.end();
await done;

// ---- music: an original piano waltz in A minor (3/4), projector clatter, then the Morges.info logo on the piano in C major
const SR = 44100;
const L = new Float32Array(Math.round(TOTAL * SR));
const midi = (n) => 440 * 2 ** ((n - 69) / 12);
function piano(t0, note, vel = 0.3, dur = 1.6) {
  const f = midi(note), s0 = Math.round(t0 * SR), n = Math.round(dur * SR);
  for (let i = 0; i < n && s0 + i < L.length; i++) {
    const t = i / SR;
    const env = Math.min(1, t * 300) * (Math.exp(-t * 2.2) * 0.7 + Math.exp(-t * 9) * 0.3) * Math.min(1, (n - i) / (0.08 * SR));
    let v = 0;
    for (let h = 1; h <= 6; h++) v += Math.sin(2 * Math.PI * f * h * Math.sqrt(1 + 0.0004 * h * h) * t) * Math.exp(-t * h * 0.9) / (h * 1.3);
    L[s0 + i] += v * env * vel;
  }
}
const start = SCENES[1].start - 0.2; // the music starts with the iris
const endT = SCENES.find((s) => s.id === 'today').start + 0.6;
const BAR = 1.25, b3 = BAR / 3;
// chords (bass, chord notes) and melody per bar (beat offsets in thirds of a bar)
const PROG = [
  [45, [57, 60, 64]], [50, [57, 62, 65]], [40, [56, 59, 62]], [45, [57, 60, 64]],
  [41, [57, 60, 65]], [48, [55, 60, 64]], [40, [56, 59, 62]], [45, [57, 60, 64]],
];
const MEL = [
  [[0, 76, 2], [2, 72, 1]], [[0, 74, 2], [2, 77, 1]], [[0, 76, 1], [1, 74, 1], [2, 71, 1]], [[0, 72, 3]],
  [[0, 77, 2], [2, 76, 1]], [[0, 76, 1], [1, 72, 1], [2, 79, 1]], [[0, 74, 1], [1, 71, 1], [2, 68, 1]], [[0, 69, 3]],
];
for (let bar = 0, t = start; t < endT - 0.05; bar++, t += BAR) {
  const [bass, ch] = PROG[bar % 8];
  piano(t, bass, 0.38, 1.2);
  for (const k of [1, 2]) ch.forEach((n) => piano(t + k * b3, n, 0.12, 0.5));
  for (const [beat, n, len] of MEL[bar % 8]) piano(t + beat * b3, n, 0.3, len * b3 + 0.4);
}
// the sound logo, on the piano, as the film turns to colour ("Mor-ges . in-fo")
const logoT = SCENES.find((s) => s.id === 'end').start + 0.1;
for (const [dt, n, v] of [[0, 67, 0.5], [0.18, 72, 0.5], [0.36, 76, 0.55], [0.7, 74, 0.45], [0.9, 79, 0.7]]) { piano(logoT + dt, n, v, 2.4); piano(logoT + dt, n - 12, v * 0.35, 2); }
[48, 55, 64].forEach((n) => piano(logoT + 0.9, n, 0.18, 2.2));
// projector clatter (only while the film is black and white)
for (let i = 0; i < L.length; i++) {
  const t = i / SR;
  if (t > endT + 0.8) break;
  const ph = (t * 18) % 1;
  const amt = t < endT ? 1 : 1 - (t - endT) / 0.8;
  L[i] += (Math.random() * 2 - 1) * (ph < 0.06 ? 0.05 : 0.006) * amt;
}
let peak = 0;
for (let i = 0; i < L.length; i++) { const t = i / SR; if (t > TOTAL - 0.8) L[i] *= Math.max(0, (TOTAL - t) / 0.8); peak = Math.max(peak, Math.abs(L[i])); }
const g = 0.7 / peak, data = Buffer.alloc(L.length * 4);
for (let i = 0; i < L.length; i++) { const s = Math.round(Math.max(-1, Math.min(1, L[i] * g)) * 32767); data.writeInt16LE(s, i * 4); data.writeInt16LE(s, i * 4 + 2); }
const hd = Buffer.alloc(44);
hd.write('RIFF', 0); hd.writeUInt32LE(36 + data.length, 4); hd.write('WAVE', 8); hd.write('fmt ', 12); hd.writeUInt32LE(16, 16); hd.writeUInt16LE(1, 20); hd.writeUInt16LE(2, 22);
hd.writeUInt32LE(SR, 24); hd.writeUInt32LE(SR * 4, 28); hd.writeUInt16LE(4, 32); hd.writeUInt16LE(16, 34); hd.write('data', 36); hd.writeUInt32LE(data.length, 40);
const wav = path.join(DIR, 'musique.wav');
writeFileSync(wav, Buffer.concat([hd, data]));
const video = path.join(DIR, `morges-info-${day}.mp4`);
execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', silent, '-i', wav, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k', '-shortest', '-movflags', '+faststart', video]);
rmSync(silent);
rmSync(wav);
writeFileSync(
  path.join(DIR, 'legende.txt'),
  `Morges hier : ${vp.title.fr}, ${when}, avec Gaston 🦢🎞️\n\n${story}\n\nD’autres photos anciennes, sur la carte : morges.info/photos/${vp.id}\n\n${credit}\n\n${HASHTAGS} #MorgesHier #PhotoAncienne\n`,
);
console.log(video);
console.log(path.join(DIR, 'legende.txt'));
