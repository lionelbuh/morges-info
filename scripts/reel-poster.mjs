/**
 * Wednesday's Instagram video, "Le saviez-vous ?", as a bold Swiss poster (1080×1920): flat colour blocks,
 * giant type, a falling question mark, the place's name with a map pin, the first count of the fact counting
 * up, the fact's words popping in one by one, diagonal wipes, and Gaston in his round glasses in a badge.
 * It ends on "Plus de Morges sur Morges.info" and the link to the place.
 * Music: an original electro-funk groove, synthesised here (no samples or recordings), ending on the
 * Morges.info sound logo played on a bell.
 *
 * Called by scripts/reel.mjs from Tuesday to Thursday: node scripts/reel.mjs [YYYY-MM-DD]
 * Output in reels/out/<date>/: morges-info-<date>.mp4, legende.txt and slide-<n>.png (one still per scene).
 * With REEL_STILLS=1, only the stills are made (to check the layout quickly).
 */
import sharp from 'sharp';
import { spawn, execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PLACES } from '../src/data/places.js';
import { todayInMorges } from '../src/data/events.js';
import { emblemShapes } from '../src/site/emblem.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const W = 1080, H = 1920, FPS = 25;
const BLUE = '#15406e', YELLOW = '#ffd23f', RED = '#e0362c', WHITE = '#fffaf0', INK = '#141414';
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const easeOut = (x) => 1 - (1 - clamp01(x)) ** 3;
const backOut = (x) => { const v = clamp01(x) - 1; return 1 + 2.7 * v ** 3 + 1.7 * v ** 2; };
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
function wrapWords(words, max) {
  const lines = []; let line = [];
  for (const w of words) { if ([...line, w].join(' ').length > max && line.length) { lines.push(line); line = [w]; } else line.push(w); }
  if (line.length) lines.push(line); return lines;
}
/** Font size so that the longest line fits in `width` (Inter Display Black is about 0.62 em per character). */
const fit = (lines, size, width = 920) => Math.min(size, Math.floor(width / (Math.max(...lines.map((l) => l.length)) * 0.62)));
function short(text, max = 230) {
  const ss = text.match(/[^.!?]+[.!?]+/g) || [text]; let out = '';
  for (const s of ss) { if ((out + s).length > max && out) break; out += s; } return out.trim();
}
function chunks(text, max = 70) {
  const parts = text.match(/[^,;:.!?]+[,;:.!?]*\s*/g) || [text]; const out = []; let cur = '';
  for (const p of parts) { if ((cur + p).trim().length > max && cur) { out.push(cur.trim()); cur = ''; } cur += p; }
  if (cur.trim()) out.push(cur.trim()); return out;
}

const day = process.argv[2] || todayInMorges();
const DIR = path.join(ROOT, 'reels', 'out', day);
const STILLS_ONLY = process.env.REEL_STILLS === '1';
rmSync(DIR, { recursive: true, force: true });
mkdirSync(DIR, { recursive: true });
const HASHTAGS = '#Morges #MorgesInfo #Vaud #LacLéman #Suisse #GastonLeCygne';
const dayNumber = Math.floor(Date.parse(`${day}T00:00:00Z`) / 86400000);
const week = Math.floor((dayNumber + 3) / 7);
const place = PLACES[((week % PLACES.length) + PLACES.length) % PLACES.length];
const fact = short(place.description.fr);
// the first count in the fact (not a year) becomes a number that counts up
const m = fact.match(/(?<![\d'’])(\d{1,3}(?:[ '’\u202f]\d{3})*|\d+)\s+([a-zà-ÿ]+)/i);
// (years such as 1286 or 1986, and numbers followed by a little word such as "par", are left out)
const STOPWORDS = new Set(['par', 'en', 'et', 'à', 'au', 'de', 'du', 'des', 'le', 'la', 'les', 'sur', 'pour', 'avec', 'dans']);
const bigN = m ? Number(m[1].replace(/\D/g, '')) : 0;
const big = m && !(bigN >= 1000 && bigN <= 2100) && !STOPWORDS.has(m[2].toLowerCase()) ? { n: bigN, label: m[2] } : null;

const COLOURS = [[BLUE, WHITE, YELLOW], [RED, WHITE, YELLOW], [WHITE, INK, RED], [YELLOW, INK, BLUE]];
const SCENES = [
  { id: 'intro', d: 2.8, c: [YELLOW, INK, BLUE] },
  { id: 'name', d: 2.8, c: [BLUE, WHITE, YELLOW] },
  ...(big ? [{ id: 'count', d: 2.8, c: [RED, WHITE, YELLOW] }] : []),
  ...chunks(fact).map((t, i) => ({ id: 'words', text: t, d: Math.max(2.8, 1.2 + t.split(' ').length * 0.26), c: COLOURS[(i + 2) % 4] })),
  { id: 'outro', d: 3.6, c: [BLUE, WHITE, YELLOW] },
];
let acc = 0; for (const s of SCENES) { s.start = acc; acc += s.d; }
const TOTAL = acc;

/** Gaston in round glasses, in a white badge. */
function gastonBadge(cx, cy, s, t, talk = false) {
  const blink = t % 2.9 < 0.12 ? 0.1 : 1;
  const beak = talk ? Math.abs(Math.sin(t * 14)) * 12 : 0;
  return `<g transform="translate(${cx} ${cy}) rotate(${Math.sin(t * 3) * 5}) scale(${s})">
    <circle r="150" fill="#bfe3f5" stroke="${INK}" stroke-width="10"/>
    <clipPath id="badge"><circle r="145"/></clipPath>
    <g clip-path="url(#badge)"><g transform="translate(-175 110)">
      <path d="M70 200 L80 40 C130 0 60 -60 90 -110 C110 -150 165 -152 178 -120" fill="none" stroke="#c9c4ba" stroke-width="48" stroke-linecap="round"/>
      <path d="M70 200 L80 40 C130 0 60 -60 90 -110 C110 -150 165 -152 178 -120" fill="none" stroke="#fff" stroke-width="40" stroke-linecap="round"/>
      <g transform="rotate(-28 95 10)"><rect x="66" y="-6" width="60" height="28" rx="10" fill="#d52b1e"/><rect x="66" y="3" width="60" height="9" fill="#fff"/></g>
      <circle cx="172" cy="-125" r="36" fill="#fff" stroke="#c9c4ba" stroke-width="4"/>
      <circle cx="168" cy="-110" r="9" fill="#f6b6b0" opacity=".8"/>
      <path d="M200 -142 L258 -126 L203 -118 Z" fill="#f08a24"/>
      <g transform="rotate(${beak} 203 -120)"><path d="M203 -120 L250 -119 L203 -110 Z" fill="#d9701a"/></g>
      <ellipse cx="182" cy="-136" rx="8" ry="${9 * blink}" fill="${INK}"/>
      <circle cx="183" cy="-136" r="15" fill="#fff" fill-opacity=".2" stroke="${INK}" stroke-width="4"/>
      <path d="M168 -138 L140 -142" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
    </g></g>
  </g>`;
}

const FLAG = `<path d="M0 0h100v50H0z" fill="#fff"/><path d="M0 50h100v50H0z" fill="#d52b1e"/>
  <path d="M0 18Q12.5 12.5 25 18T50 18T75 18T100 18V32Q87.5 37.5 75 32T50 32T25 32T0 32Z" fill="#d52b1e"/>
  <path d="M0 68Q12.5 62.5 25 68T50 68T75 68T100 68V82Q87.5 87.5 75 82T50 82T25 82T0 82Z" fill="#fff"/>`;

/** Small brand strip at the top: emblem, flag, Morges.info. */
function brand(fg) {
  return `<svg x="70" y="90" width="84" height="84" viewBox="0 0 200 200">${emblemShapes('pop-emblem')}</svg>
    <g transform="translate(168 104) scale(.56)">${FLAG}<path d="M1 1h98v98H1z" fill="none" stroke="${fg}" stroke-opacity=".5" stroke-width="4"/></g>
    <text x="240" y="148" font-family="Inter" font-size="40" font-weight="800" fill="${fg}">Morges.info</text>`;
}
/** Progress dots on the right of the brand strip. */
function dots(i, fg) {
  return SCENES.map((_, k) => `<circle cx="${1010 - (SCENES.length - 1 - k) * 30}" cy="134" r="${k === i ? 10 : 6}" fill="${fg}" opacity="${k <= i ? 1 : 0.35}"/>`).join('');
}

function words(text, st, fg, hi) {
  // a lone punctuation mark (" :", " ;") stays with the word before it
  const tokens = text.split(/\s+/).reduce((out, w) => (/^[:;!?»]+$/.test(w) && out.length ? [...out.slice(0, -1), `${out.at(-1)}\u00a0${w}`] : [...out, w]), []);
  const lines = wrapWords(tokens, 15);
  const size = fit(lines.map((l) => l.join(' ')), lines.length > 5 ? 82 : 96);
  const lh = size * 1.12;
  const top = 960 - (lines.length * lh) / 2 + size * 0.8;
  let k = 0;
  // one <text> per line, a <tspan> per word so that the spacing is the font's own; each word pops up in turn
  return lines.map((line, li) => {
    let prev = 0;
    const spans = line.map((w, wi) => {
      const p = backOut((st - 0.25 - k * 0.2) / 0.35);
      const off = (1 - p) * 40;
      const strong = /\d/.test(w) || (/^[A-ZÀ-Ý]/.test(w) && k > 0);
      k++;
      const dy = off - prev;
      prev = off;
      return `<tspan dy="${dy.toFixed(1)}" fill="${strong ? hi : fg}" fill-opacity="${clamp01(p * 1.5).toFixed(2)}">${wi ? ' ' : ''}${esc(w)}</tspan>`;
    }).join('');
    return `<text x="80" y="${(top + li * lh).toFixed(1)}" font-family="Inter Display" font-weight="900" font-size="${size}" xml:space="preserve">${spans}</text>`;
  }).join('');
}

function frame(t) {
  const i = SCENES.findLastIndex((s) => t >= s.start);
  const sc = SCENES[i], st = t - sc.start;
  const [bg, fg, hi] = sc.c;
  let svg = `<rect width="${W}" height="${H}" fill="${bg}"/>`;
  // big background shapes, slowly turning
  svg += `<g opacity=".12"><circle cx="${900 + Math.sin(t) * 30}" cy="${1500}" r="360" fill="${fg}"/><rect x="-160" y="300" width="420" height="420" fill="${fg}" transform="rotate(${t * 12} 50 510)"/></g>`;
  switch (sc.id) {
    case 'intro': {
      const q = backOut(st / 0.6);
      svg += `<text x="540" y="${(1180 - (1 - q) * 500).toFixed(0)}" text-anchor="middle" font-family="Inter Display" font-weight="900" font-size="900" fill="${BLUE}" opacity=".95" transform="rotate(${(1 - q) * -30 + Math.sin(t * 2) * 3} 540 900)">?</text>`;
      ['LE', 'SAVIEZ-', 'VOUS ?'].forEach((w, k) => {
        const p = easeOut((st - 0.5 - k * 0.18) / 0.4);
        const dir = k % 2 ? 1 : -1;
        svg += `<text x="${(80 + dir * (1 - p) * 1100).toFixed(0)}" y="${1330 + k * 170}" font-family="Inter Display" font-weight="900" font-size="190" fill="${INK}">${w}</text>`;
      });
      svg += gastonBadge(820, 460, backOut((st - 1.2) / 0.5), t, true);
      break;
    }
    case 'name': {
      const lines = wrapWords(place.name.fr.split(' '), 11);
      const size = fit(lines.map((l) => l.join(' ')), lines.length > 2 ? 130 : 160);
      lines.forEach((l, k) => {
        const p = easeOut((st - 0.15 - k * 0.15) / 0.45);
        svg += `<text x="80" y="${820 + k * size * 1.05 + (1 - p) * 120}" font-family="Inter Display" font-weight="900" font-size="${size}" fill="${fg}" opacity="${p}">${esc(l.join(' '))}</text>`;
      });
      // a pin dropping
      const d = backOut((st - 0.6) / 0.5);
      svg += `<g transform="translate(860 ${(560 - (1 - d) * 500).toFixed(0)})"><path d="M0 0 C-70 -80 -70 -170 0 -170 C70 -170 70 -80 0 0 Z" fill="${hi}"/><circle cx="0" cy="-110" r="26" fill="${bg}"/></g>`;
      svg += `<rect x="80" y="${820 + lines.length * size * 1.05}" width="${clamp01((st - 0.7) / 0.4) * 520}" height="14" fill="${hi}"/>
        <text x="80" y="${900 + lines.length * size * 1.05}" font-family="Inter" font-weight="700" font-size="52" fill="${fg}" opacity="${clamp01((st - 0.9) / 0.4)}">à Morges</text>`;
      break;
    }
    case 'count': {
      const v = Math.round(big.n * easeOut((st - 0.2) / 1.4));
      svg += `<text x="540" y="1060" text-anchor="middle" font-family="Inter Display" font-weight="900" font-size="${fit([big.n.toLocaleString('fr-CH')], 420)}" fill="${fg}">${v.toLocaleString('fr-CH')}</text>
        <text x="540" y="1220" text-anchor="middle" font-family="Inter Display" font-weight="900" font-size="130" fill="${hi}" opacity="${clamp01((st - 1.3) / 0.4)}">${esc(big.label)}</text>`;
      break;
    }
    case 'words':
      svg += words(sc.text, st, fg, hi);
      break;
    case 'outro': {
      const p = backOut(st / 0.5);
      svg += `<g transform="translate(540 620) scale(${p.toFixed(3)})"><text text-anchor="middle" font-family="Inter Display" font-weight="900" font-size="118" fill="${fg}">Plus de Morges</text><text y="140" text-anchor="middle" font-family="Inter Display" font-weight="900" font-size="118" fill="${hi}">sur Morges.info</text></g>`;
      svg += gastonBadge(540, 1130, backOut((st - 0.4) / 0.5) * 0.9, t, true);
      svg += `<rect x="90" y="1400" width="900" height="200" rx="100" fill="${hi}" opacity="${clamp01((st - 0.9) / 0.3)}"/>
        <text x="540" y="1478" text-anchor="middle" font-family="Inter" font-weight="700" font-size="44" fill="${INK}" opacity="${clamp01((st - 0.9) / 0.3)}">La suite sur</text>
        <text x="540" y="1548" text-anchor="middle" font-family="Inter" font-weight="900" font-size="${Math.min(50, Math.floor(820 / (`morges.info/lieux/${place.id}`.length * 0.6)))}" fill="${INK}" opacity="${clamp01((st - 0.9) / 0.3)}">morges.info/lieux/${place.id}</text>`;
      break;
    }
  }
  svg += brand(fg) + dots(i, fg);
  // diagonal wipe into the next scene's colour
  const next = SCENES[i + 1];
  if (next && st > sc.d - 0.35) {
    const p = easeOut((st - (sc.d - 0.35)) / 0.35);
    const x = -800 + p * 2700;
    svg += `<path d="M${x} 0 L${x - 1900} 0 L${x - 1900 - 700} ${H} L${x - 700} ${H} Z" fill="${next.c[0]}"/>`;
  }
  return sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${svg}</svg>`));
}

const silent = path.join(DIR, 'image.mp4');
if (STILLS_ONLY) {
  for (const sc of SCENES) await frame(sc.start + sc.d * 0.75).png().toFile(path.join(DIR, `slide-${SCENES.indexOf(sc) + 1}.png`));
  console.log(DIR);
  process.exit(0);
}
const ff = spawn('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20', '-movflags', '+faststart', silent], { stdio: ['pipe', 'inherit', 'inherit'] });
const done = new Promise((r) => ff.on('close', r));
const stills = new Set(SCENES.map((s) => Math.round((s.start + s.d * 0.75) * FPS)));
for (let n = 0; n < Math.round(TOTAL * FPS); n++) {
  const buf = await frame(n / FPS).removeAlpha().raw().toBuffer();
  if (stills.has(n)) await sharp(buf, { raw: { width: W, height: H, channels: 3 } }).png().toFile(path.join(DIR, `slide-${[...stills].indexOf(n) + 1}.png`));
  if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
}
ff.stdin.end();
await done;

// ---- music: electro-funk groove, 116 bpm, E minor; the Morges.info logo on a bright synth bell at the end
const SR = 44100;
const L = new Float32Array(Math.round(TOTAL * SR));
const midi = (n) => 440 * 2 ** ((n - 69) / 12);
let rs = 3; const rnd = () => ((rs = (rs * 16807) % 2147483647) / 2147483647) * 2 - 1;
function add(t0, dur, fn) { const s0 = Math.round(t0 * SR); for (let i = 0; i < dur * SR && s0 + i < L.length; i++) L[s0 + i] += fn(i / SR); }
const kick = (t0) => add(t0, 0.25, (t) => Math.sin(2 * Math.PI * (50 * t + 30 * (1 - Math.exp(-t * 35)))) * Math.exp(-t * 12) * 0.9);
const clap = (t0) => { let p = 0; add(t0, 0.18, (t) => { const w = rnd(); const h = w - p; p = w; return h * Math.exp(-t * 25) * (t < 0.01 || (t > 0.012 && t < 0.02) || t > 0.024 ? 0.35 : 0.1); }); };
const hat = (t0, v = 0.08) => { let p = 0; add(t0, 0.05, (t) => { const w = rnd(); const h = w - p; p = w; return h * Math.exp(-t * 90) * v; }); };
function bass(t0, note, dur) {
  const f = midi(note); let y = 0;
  add(t0, dur, (t) => { const saw = 2 * ((f * t) % 1) - 1; const cut = 0.05 + 0.25 * Math.exp(-t * 10); y += cut * (saw - y); return y * 0.5 * Math.min(1, (dur - t) * 40); });
}
function pluck(t0, note, v = 0.12) { const f = midi(note); add(t0, 0.4, (t) => (Math.sin(2 * Math.PI * f * t) + 0.5 * Math.sin(4 * Math.PI * f * t) * Math.exp(-t * 20)) * Math.exp(-t * 9) * v); }
function bell(t0, note, v = 0.4) { const f = midi(note); add(t0, 1.8, (t) => (Math.sin(2 * Math.PI * f * t + 1.2 * Math.sin(2 * Math.PI * f * 3.5 * t) * Math.exp(-t * 3))) * Math.exp(-t * 2.5) * v * Math.min(1, t * 500)); }
const beat = 60 / 116, s16 = beat / 4;
const grooveEnd = SCENES.at(-1).start + 0.5;
// riser on the intro, then the groove from the first wipe
add(0, SCENES[1].start, (t) => rnd() * 0.06 * (t / SCENES[1].start) ** 2);
const BASS = [[0, 40, 2], [3, 40, 1], [6, 43, 1], [8, 45, 2], [11, 43, 1], [14, 47, 2]]; // per bar, in 16ths
const ARP = [64, 67, 71, 74, 71, 67];
let bar = 0;
for (let t = SCENES[1].start; t < grooveEnd; t += 16 * s16, bar++) {
  for (let b = 0; b < 4; b++) { kick(t + b * beat); if (b % 2) clap(t + b * beat); }
  for (let k = 0; k < 16; k++) hat(t + k * s16, k % 2 ? 0.05 : 0.09);
  for (const [k, n, len] of BASS) bass(t + k * s16, n + (bar % 4 === 3 ? 2 : 0), len * s16 * 0.9);
  for (let k = 2; k < 16; k += 3) pluck(t + k * s16, ARP[(k + bar) % ARP.length] + (bar % 4 === 3 ? 2 : 0));
}
// the sound logo on a bell, in G major over the last card
const lt = SCENES.at(-1).start + 0.7;
for (const [dt, n, v] of [[0, 67, 0.45], [0.16, 72, 0.45], [0.32, 76, 0.5], [0.62, 74, 0.4], [0.8, 79, 0.6]]) bell(lt + dt, n, v);
let peak = 0;
for (let i = 0; i < L.length; i++) { const t = i / SR; if (t > TOTAL - 0.6) L[i] *= Math.max(0, (TOTAL - t) / 0.6); peak = Math.max(peak, Math.abs(L[i])); }
const g = 0.75 / peak, data = Buffer.alloc(L.length * 4);
for (let i = 0; i < L.length; i++) { const s = Math.round(Math.tanh(L[i] * g * 1.2) * 32767 * 0.9); data.writeInt16LE(s, i * 4); data.writeInt16LE(s, i * 4 + 2); }
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
  `Le saviez-vous ? ${place.name.fr}, avec Gaston 🦢💡\n\n${fact}\n\nÀ lire sur morges.info/lieux/${place.id}\n\n${HASHTAGS} #LeSaviezVous\n`,
);
console.log(video);
console.log(path.join(DIR, 'legende.txt'));
