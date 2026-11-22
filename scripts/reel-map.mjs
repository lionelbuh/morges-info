/**
 * Sunday's Instagram video, "Découvrir Morges", as an illustrated walking map (1080×1920): the theme of the
 * week (src/data/discover.js), its places pinned on a paper map at their real relative positions
 * (coordinates from the site's data), a dotted route that Gaston follows from stop to stop, and a card for
 * each stop. It ends on "Bonne balade !" with the harbour emblem, the flag of Morges and Morges.info.
 * The map is a simple drawing (places, the lake below them), not a survey map.
 * Music: an original folk tune (plucked guitar, a whistled melody, a shaker), synthesised here (no samples
 * or recordings), ending on the Morges.info sound logo.
 *
 * Called by scripts/reel.mjs on Sundays (and Saturdays): node scripts/reel.mjs [YYYY-MM-DD]
 * Output in reels/out/<date>/: morges-info-<date>.mp4, legende.txt and slide-<n>.png (one still per scene).
 * With REEL_STILLS=1, only the stills are made (to check the layout quickly).
 */
import sharp from 'sharp';
import { spawn, execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DISCOVER_THEMES } from '../src/data/discover.js';
import { PLACES } from '../src/data/places.js';
import { publishedViewpoints } from '../src/data/viewpoints.js';
import { todayInMorges } from '../src/data/events.js';
import { emblemShapes } from '../src/site/emblem.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const W = 1080;
const H = 1920;
const FPS = 25;
const INK = '#2b2520';
const PAPER = '#f4ecd8';
const PAPER_DARK = '#e6d9b8';
const GREEN = '#2f6b4f';
const RED = '#d52b1e';
const LAKE = '#7fb3d5';
const HASHTAGS = '#Morges #MorgesInfo #Vaud #LacLéman #Suisse #GastonLeCygne';
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const easeOut = (x) => 1 - (1 - clamp01(x)) ** 3;
const ease = (x) => {
  x = clamp01(x);
  return x < 0.5 ? 4 * x ** 3 : 1 - (-2 * x + 2) ** 3 / 2;
};
const backOut = (x) => {
  const v = clamp01(x) - 1;
  return 1 + 2.7 * v ** 3 + 1.7 * v ** 2;
};
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
function wrap(text, max) {
  const lines = [];
  let line = '';
  for (const w of text.replace(/ ([:;!?])/g, ' $1').split(/[ \t\n]+/)) {
    if (`${line} ${w}`.trim().length > max && line) {
      lines.push(line);
      line = w;
    } else line = `${line} ${w}`.trim();
  }
  if (line) lines.push(line);
  return lines;
}
/** The first sentence of a text, cut at about `max` characters. */
function firstSentence(text, max = 105) {
  const s = (text.match(/[^.!?]+[.!?]+/) || [text])[0].trim();
  if (s.length <= max) return s;
  return `${s.slice(0, s.lastIndexOf(' ', max - 1))}…`;
}

// ---- the week's theme (same rotation as scripts/reel.mjs) and its stops
const day = process.argv[2] || todayInMorges();
const DIR = path.join(ROOT, 'reels', 'out', day);
const STILLS_ONLY = process.env.REEL_STILLS === '1';
rmSync(DIR, { recursive: true, force: true });
mkdirSync(DIR, { recursive: true });
const dayNumber = Math.floor(Date.parse(`${day}T00:00:00Z`) / 86400000);
const week = Math.floor((dayNumber + 3) / 7);
const theme = DISCOVER_THEMES[((week % DISCOVER_THEMES.length) + DISCOVER_THEMES.length) % DISCOVER_THEMES.length];
const VIEWPOINTS = publishedViewpoints();
const stops = theme.links
  .map((link) => {
    const [kind, id] = link.page.split(':');
    if (kind === 'place') {
      const place = PLACES.find((p) => p.id === id);
      return place && place.coordinates && { label: link.label.fr, text: firstSentence(place.description.fr), ...place.coordinates };
    }
    if (kind === 'photo') {
      const vp = VIEWPOINTS.find((v) => v.id === id);
      return vp && vp.coordinates && { label: link.label.fr, text: `${vp.title.fr} : avant et aujourd’hui, sur la carte photo.`, ...vp.coordinates };
    }
    return null;
  })
  .filter(Boolean);
if (!stops.length) throw new Error(`No stop with coordinates for the theme ${theme.id}`);

// ---- map projection: the stops' real relative positions, fitted in the map frame
const MAP = { x: 70, y: 470, w: 940, h: 960 };
const LAKE_TOP = MAP.y + MAP.h - 190;
{
  const kx = Math.cos((46.51 * Math.PI) / 180);
  const xs = stops.map((s) => s.lng * kx);
  const ys = stops.map((s) => -s.lat);
  const span = Math.max(0.004, Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys));
  const box = { x: MAP.x + 170, y: MAP.y + 190, w: MAP.w - 340, h: LAKE_TOP - MAP.y - 290 };
  const k = Math.min(box.w, box.h) / span;
  const cx = (Math.max(...xs) + Math.min(...xs)) / 2;
  const cy = (Math.max(...ys) + Math.min(...ys)) / 2;
  stops.forEach((s, i) => {
    s.x = box.x + box.w / 2 + (xs[i] - cx) * k;
    s.y = box.y + box.h / 2 + (ys[i] - cy) * k;
  });
  // pins closer than 110 px are pushed apart a little, so that each stays readable
  for (let n = 0; n < 60; n++)
    for (const a of stops)
      for (const b of stops) {
        if (a === b) continue;
        const dx = b.x - a.x || 1;
        const dy = b.y - a.y;
        const d = Math.hypot(dx, dy);
        if (d < 110) {
          const push = (110 - d) / 4;
          b.x += (dx / d) * push;
          b.y += (dy / d) * push;
        }
      }
  // a label goes under its pin, or above it when it would cover an earlier label
  const boxes = [];
  for (const s of stops) {
    const w = s.label.length * 17 + 20;
    const below = { x: s.x - w / 2, y: s.y + 14, w, h: 44 };
    const hits = (r) => boxes.some((o) => r.x < o.x + o.w && o.x < r.x + r.w && r.y < o.y + o.h && o.y < r.y + r.h)
      || stops.some((o) => o !== s && Math.abs(o.x - s.x) < w / 2 + 30 && o.y - 110 < r.y + r.h && o.y > r.y);
    s.labelY = hits(below) ? s.y - 124 : s.y + 46;
    boxes.push({ ...below, y: s.labelY - 32 });
  }
}

// ---- timeline
const INTRO = 3.0;
const STOP = 3.8;
const OUTRO = 3.6;
stops.forEach((s, i) => {
  s.at = INTRO + i * STOP;
  s.lines = wrap(s.text, 36).slice(0, 3);
});
const END_AT = INTRO + stops.length * STOP;
const TOTAL = END_AT + OUTRO;

// ---- drawing pieces
const FLAG = `<path d="M0 0h100v50H0z" fill="#fff"/><path d="M0 50h100v50H0z" fill="${RED}"/>
  <path d="M0 18Q12.5 12.5 25 18T50 18T75 18T100 18V32Q87.5 37.5 75 32T50 32T25 32T0 32Z" fill="${RED}"/>
  <path d="M0 68Q12.5 62.5 25 68T50 68T75 68T100 68V82Q87.5 87.5 75 82T50 82T25 82T0 82Z" fill="#fff"/>`;

/** Gaston's head with his red beret, in a round marker. */
function gastonHead(cx, cy, r, t) {
  const s = r / 150;
  return `<g transform="translate(${cx} ${cy}) scale(${s})">
    <circle r="150" fill="#fff" stroke="${INK}" stroke-width="12"/>
    <clipPath id="gh"><circle r="144"/></clipPath>
    <g clip-path="url(#gh)"><g transform="translate(-175 ${125 + Math.sin(t * 6) * 5})">
      <path d="M70 200 L80 40 C130 0 60 -60 90 -110 C110 -150 165 -152 178 -120" fill="none" stroke="#c9c4ba" stroke-width="48" stroke-linecap="round"/>
      <path d="M70 200 L80 40 C130 0 60 -60 90 -110 C110 -150 165 -152 178 -120" fill="none" stroke="#fff" stroke-width="40" stroke-linecap="round"/>
      <circle cx="172" cy="-125" r="36" fill="#fff" stroke="#c9c4ba" stroke-width="4"/>
      <circle cx="168" cy="-110" r="9" fill="#f6b6b0" opacity=".8"/>
      <path d="M200 -142 L258 -126 L203 -118 Z" fill="#f08a24"/>
      <ellipse cx="182" cy="-136" rx="8" ry="${t % 3.1 < 0.12 ? 1 : 9}" fill="${INK}"/>
      <ellipse cx="164" cy="-160" rx="44" ry="15" transform="rotate(-12 164 -160)" fill="${RED}"/>
      <circle cx="168" cy="-176" r="5" fill="${RED}"/>
    </g></g>
  </g>`;
}

function pin(x, y, n, p, active) {
  const drop = (1 - backOut(p)) * -160;
  return `<g transform="translate(${x} ${(y + drop).toFixed(1)})" opacity="${clamp01(p * 4).toFixed(2)}">
    <ellipse cx="0" cy="4" rx="22" ry="8" fill="#000" opacity=".15"/>
    <path d="M0 0 C-44 -50 -44 -104 0 -104 C44 -104 44 -50 0 0 Z" fill="${active ? RED : GREEN}" stroke="#fff" stroke-width="5"/>
    <text x="0" y="-56" text-anchor="middle" font-family="Inter" font-size="40" font-weight="900" fill="#fff">${n}</text>
  </g>`;
}

/** The curved route from one stop to the next (a quadratic curve bending to the side). */
function leg(a, b) {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return { a, b, c: { x: mx - dy * 0.25, y: my + dx * 0.25 } };
}
const at = (l, u) => ({
  x: (1 - u) ** 2 * l.a.x + 2 * (1 - u) * u * l.c.x + u ** 2 * l.b.x,
  y: (1 - u) ** 2 * l.a.y + 2 * (1 - u) * u * l.c.y + u ** 2 * l.b.y,
});
const LEGS = stops.slice(1).map((s, i) => leg(stops[i], s));

/** Paper texture dots, a compass rose, the lake below the town. */
const PAPER_DOTS = (() => {
  let s = '';
  let seed = 5;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let k = 0; k < 220; k++) s += `<circle cx="${(MAP.x + rnd() * MAP.w).toFixed(0)}" cy="${(MAP.y + rnd() * (LAKE_TOP - MAP.y)).toFixed(0)}" r="${(1 + rnd() * 2).toFixed(1)}" fill="#b9a77e" opacity=".35"/>`;
  return s;
})();
function compass(x, y, t) {
  return `<g transform="translate(${x} ${y}) rotate(${Math.sin(t * 0.8) * 4})">
    <circle r="62" fill="none" stroke="${INK}" stroke-width="3" opacity=".6"/>
    <path d="M0 -70 L14 0 L0 70 L-14 0 Z" fill="${INK}" opacity=".7"/><path d="M0 -70 L14 0 L-14 0 Z" fill="${RED}"/>
    <path d="M-70 0 L0 10 L70 0 L0 -10 Z" fill="${INK}" opacity=".4"/>
    <text y="-80" text-anchor="middle" font-family="DejaVu Serif" font-size="30" font-weight="bold" fill="${INK}">N</text>
  </g>`;
}
function lake(t) {
  const waves = [0, 1, 2]
    .map((k) => {
      const y = LAKE_TOP + 50 + k * 45;
      let d = `M${MAP.x + 30} ${y}`;
      for (let x = MAP.x + 30; x <= MAP.x + MAP.w - 30; x += 20) d += ` L${x} ${(y + Math.sin(x / 40 + t * 2 + k) * 5).toFixed(1)}`;
      return `<path d="${d}" fill="none" stroke="#fff" stroke-width="3" opacity=".7"/>`;
    })
    .join('');
  let shore = `M${MAP.x} ${LAKE_TOP + 20}`;
  for (let x = MAP.x; x <= MAP.x + MAP.w; x += 40) shore += ` L${x} ${(LAKE_TOP + 20 + Math.sin(x / 70) * 14).toFixed(1)}`;
  return `<path d="${shore} L${MAP.x + MAP.w} ${MAP.y + MAP.h} L${MAP.x} ${MAP.y + MAP.h} Z" fill="${LAKE}"/>${waves}
    <text x="${MAP.x + MAP.w - 40}" y="${MAP.y + MAP.h - 40}" text-anchor="end" font-family="DejaVu Serif" font-style="italic" font-size="40" fill="#fff">Lac Léman</text>
    <path d="M${MAP.x + 120} ${LAKE_TOP + 110} l-30 22 h60 Z M${MAP.x + 90} ${LAKE_TOP + 132} h70" fill="#fff" stroke="#fff" stroke-width="3" opacity=".9"/>`;
}

const titleLines = wrap(theme.title.fr, 18);

function frame(t) {
  let svg = `<rect width="${W}" height="${H}" fill="${GREEN}"/>`;
  // header
  svg += `<text x="70" y="170" font-family="Inter" font-size="34" font-weight="800" letter-spacing="6" fill="#f6d27a">DÉCOUVRIR MORGES</text>
    ${titleLines.map((l, i) => `<text x="70" y="${262 + i * 84}" font-family="DejaVu Serif" font-size="${titleLines.length > 1 ? 72 : 84}" font-weight="bold" fill="#fff" opacity="${clamp01((t - 0.3 - i * 0.2) / 0.5).toFixed(2)}">${esc(l)}</text>`).join('')}`;
  // the map, unfolding
  const unfold = ease((t - 0.6) / 1.0);
  svg += `<g transform="translate(540 ${MAP.y + MAP.h / 2}) scale(1 ${Math.max(0.01, unfold).toFixed(3)}) translate(-540 ${-(MAP.y + MAP.h / 2)})">
    <rect x="${MAP.x}" y="${MAP.y}" width="${MAP.w}" height="${MAP.h}" rx="18" fill="${PAPER}"/>
    ${PAPER_DOTS}
    <path d="M${MAP.x + MAP.w / 3} ${MAP.y} V${MAP.y + MAP.h} M${MAP.x + (2 * MAP.w) / 3} ${MAP.y} V${MAP.y + MAP.h} M${MAP.x} ${MAP.y + MAP.h / 2} H${MAP.x + MAP.w}" stroke="${PAPER_DARK}" stroke-width="4"/>
    ${lake(t)}
    ${compass(MAP.x + MAP.w - 100, MAP.y + 110, t)}
    <text x="${MAP.x + 40}" y="${MAP.y + 70}" font-family="DejaVu Serif" font-style="italic" font-size="40" fill="${INK}" opacity=".75">Morges</text>
    <rect x="${MAP.x + 10}" y="${MAP.y + 10}" width="${MAP.w - 20}" height="${MAP.h - 20}" rx="12" fill="none" stroke="${INK}" stroke-width="3" opacity=".35"/>
  </g>`;
  if (unfold > 0.98) {
    // the route drawn so far, then the pins, then Gaston
    let walker = stops[0];
    LEGS.forEach((l, i) => {
      const start = stops[i + 1].at - 1.4;
      const u = ease((t - start) / 1.3);
      if (u <= 0) return;
      let d = `M${l.a.x.toFixed(1)} ${l.a.y.toFixed(1)}`;
      for (let k = 1; k <= 30; k++) {
        const q = at(l, (k / 30) * u);
        d += ` L${q.x.toFixed(1)} ${q.y.toFixed(1)}`;
      }
      svg += `<path d="${d}" fill="none" stroke="${RED}" stroke-width="8" stroke-dasharray="4 18" stroke-linecap="round"/>`;
      if (u < 1) walker = at(l, u);
      else walker = l.b;
    });
    const cur = stops.findLastIndex((s) => t >= s.at - 0.3);
    stops.forEach((s, i) => {
      svg += pin(s.x, s.y, i + 1, (t - (s.at - (i ? 0.3 : 0.1))) / 0.45, i === cur);
      if (t > s.at) svg += `<text x="${s.x}" y="${s.labelY}" text-anchor="middle" font-family="Inter" font-size="30" font-weight="800" fill="${INK}" stroke="${PAPER}" stroke-width="8" paint-order="stroke" opacity="${clamp01((t - s.at) / 0.4).toFixed(2)}">${esc(s.label)}</text>`;
    });
    if (t > stops[0].at - 0.2 && t < END_AT + 0.4) svg += gastonHead(walker.x + 50, walker.y - 120, 52, t);
  }
  // stop card at the bottom
  const cur = stops.findLastIndex((s) => t >= s.at);
  if (cur >= 0 && t < END_AT) {
    const s = stops[cur];
    const p = easeOut((t - s.at) / 0.4);
    const out = t > s.at + STOP - 0.3 && cur < stops.length - 1 ? easeOut((t - (s.at + STOP - 0.3)) / 0.3) : 0;
    const y = 1460 + (1 - p) * 260 + out * 260;
    svg += `<g opacity="${(p * (1 - out)).toFixed(2)}"><rect x="70" y="${y}" width="940" height="${120 + s.lines.length * 52}" rx="28" fill="#fff"/>
      <circle cx="132" cy="${y + 66}" r="36" fill="${RED}"/><text x="132" y="${y + 80}" text-anchor="middle" font-family="Inter" font-size="40" font-weight="900" fill="#fff">${cur + 1}</text>
      <text x="190" y="${y + 80}" font-family="Inter" font-size="46" font-weight="800" fill="${INK}">${esc(s.label)}</text>
      ${s.lines.map((l, i) => `<text x="110" y="${y + 150 + i * 52}" font-family="Inter" font-size="38" font-weight="500" fill="#57524a">${esc(l)}</text>`).join('')}</g>`;
  }
  // brand strip
  svg += `<svg x="70" y="1790" width="80" height="80" viewBox="0 0 200 200">${emblemShapes('map-emblem')}</svg>
    <g transform="translate(166 1802) scale(.56)">${FLAG}<path d="M1 1h98v98H1z" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="4"/></g>
    <text x="236" y="1846" font-family="DejaVu Serif" font-size="44" font-weight="bold" fill="#fff">Morges<tspan fill="#f6d27a" font-style="italic">.info</tspan></text>`;
  // intro: Gaston in the header
  if (t < stops[0].at) svg += gastonHead(540, 1600, 130 * backOut((t - 0.4) / 0.5), t);
  // the end
  if (t > END_AT) {
    const st = t - END_AT;
    const p = backOut(st / 0.5);
    svg += `<rect width="${W}" height="${H}" fill="${GREEN}" opacity="${clamp01(st / 0.35).toFixed(2)}"/>
      <g transform="translate(540 620) scale(${p.toFixed(3)})">${gastonHead(0, 0, 200, t)}</g>
      <g transform="translate(540 1020) scale(${p.toFixed(3)})"><text text-anchor="middle" font-family="DejaVu Serif" font-size="120" font-weight="bold" fill="#fff">Bonne balade !</text></g>
      <g opacity="${clamp01((st - 0.6) / 0.4).toFixed(2)}">
        <text x="540" y="1150" text-anchor="middle" font-family="Inter" font-size="44" font-weight="600" fill="#fff">Toutes les idées de sortie :</text>
        <text x="540" y="1220" text-anchor="middle" font-family="Inter" font-size="50" font-weight="800" fill="#f6d27a">morges.info/decouvrir-morges</text>
        <svg x="${540 - 170}" y="1330" width="150" height="150" viewBox="0 0 200 200">${emblemShapes('end-emblem')}</svg>
        <g transform="translate(${540 + 30} 1355) scale(1)">${FLAG}<path d="M1 1h98v98H1z" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="3"/></g>
        <text x="540" y="1600" text-anchor="middle" font-family="DejaVu Serif" font-size="84" font-weight="bold" fill="#fff">Morges<tspan fill="#f6d27a" font-style="italic">.info</tspan></text>
      </g>`;
  }
  return sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${svg}</svg>`));
}

const STILL_TIMES = [2.6, ...stops.map((s) => s.at + STOP - 0.5), TOTAL - 0.5];
if (STILLS_ONLY) {
  for (const [i, t] of STILL_TIMES.entries()) await frame(t).png().toFile(path.join(DIR, `slide-${i + 1}.png`));
  console.log(DIR);
  process.exit(0);
}

const silent = path.join(DIR, 'image.mp4');
const ff = spawn(
  'ffmpeg',
  ['-loglevel', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-',
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20', '-movflags', '+faststart', silent],
  { stdio: ['pipe', 'inherit', 'inherit'] },
);
const done = new Promise((resolve, reject) => ff.on('close', (code) => (code ? reject(new Error(`ffmpeg exited with ${code}`)) : resolve())));
const stills = new Map(STILL_TIMES.map((t, i) => [Math.round(t * FPS), i + 1]));
for (let n = 0; n < Math.round(TOTAL * FPS); n++) {
  const buf = await frame(n / FPS).removeAlpha().raw().toBuffer();
  if (stills.has(n)) await sharp(buf, { raw: { width: W, height: H, channels: 3 } }).png().toFile(path.join(DIR, `slide-${stills.get(n)}.png`));
  if (!ff.stdin.write(buf)) await new Promise((resolve) => ff.stdin.once('drain', resolve));
}
ff.stdin.end();
await done;

// ---- music: a folk tune in G major, 100 bpm: plucked guitar, a whistled melody, a shaker
const SR = 44100;
const L = new Float32Array(Math.round(TOTAL * SR));
const midi = (n) => 440 * 2 ** ((n - 69) / 12);
let rs = 17;
const rnd = () => ((rs = (rs * 16807) % 2147483647) / 2147483647) * 2 - 1;
function add(at0, dur, fn) {
  const s0 = Math.round(at0 * SR);
  for (let i = 0; i < dur * SR && s0 + i < L.length; i++) L[s0 + i] += fn(i / SR);
}
function pluck(at0, note, v = 0.2, dur = 1.6) {
  const f = midi(note);
  const p = Math.round(SR / f);
  const line = Float32Array.from({ length: p }, () => rnd());
  let idx = 0;
  add(at0, dur, (t) => {
    const next = (idx + 1) % p;
    const out = line[idx];
    line[idx] = 0.995 * 0.5 * (line[idx] + line[next]);
    idx = next;
    return out * v * Math.min(1, (dur - t) * 10);
  });
}
function whistle(at0, note, dur, v = 0.13) {
  const f = midi(note);
  let ph = 0;
  add(at0, dur, (t) => {
    ph += (2 * Math.PI * f * (1 + 0.006 * Math.sin(2 * Math.PI * 5.5 * t) * Math.min(1, t * 3))) / SR;
    const env = Math.min(1, t * 25) * Math.min(1, (dur - t) * 12);
    return (Math.sin(ph) + rnd() * 0.04) * env * v;
  });
}
function shaker(at0, v) {
  let p = 0;
  add(at0, 0.07, (t) => {
    const w = rnd();
    const h = w - p;
    p = w;
    return h * Math.exp(-t * 50) * v;
  });
}
const beat = 60 / 100;
const CHORDS = [[43, 55, 59, 62, 67], [36, 52, 55, 60, 64], [38, 54, 57, 62, 66], [43, 55, 59, 62, 67]]; // G C D G
const TUNE = [
  [[0, 71, 1], [1, 74, 1], [2, 79, 1.5], [3.5, 78, 0.5]],
  [[0, 76, 1.5], [1.5, 74, 0.5], [2, 72, 2]],
  [[0, 74, 1], [1, 76, 1], [2, 78, 1], [3, 81, 1]],
  [[0, 79, 3]],
];
let bar = 0;
for (let t0 = 0.4; t0 < END_AT + 0.4; t0 += 4 * beat, bar++) {
  const ch = CHORDS[bar % 4];
  // fingerpicking: bass on 1 and 3, the other strings in between
  const order = [0, 3, 2, 4, 1, 3, 2, 4];
  order.forEach((k, i) => pluck(t0 + i * (beat / 2), ch[k], k === 0 ? 0.26 : 0.15, 1.4));
  for (let i = 0; i < 8; i++) shaker(t0 + i * (beat / 2), i % 2 ? 0.05 : 0.09);
  if (bar % 8 >= 4) for (const [b, n, len] of TUNE[bar % 4]) whistle(t0 + b * beat, n, len * beat * 0.95);
}
for (const [dt, n, v] of [[0, 67, 0.5], [0.16, 72, 0.5], [0.32, 76, 0.55], [0.62, 74, 0.45], [0.8, 79, 0.7]]) pluck(END_AT + 0.5 + dt, n, v * 0.45, 2.2);
pluck(END_AT + 1.3, 43, 0.25, 2.4);
let peak = 0;
for (let i = 0; i < L.length; i++) {
  const t = i / SR;
  if (t > TOTAL - 0.8) L[i] *= Math.max(0, (TOTAL - t) / 0.8);
  peak = Math.max(peak, Math.abs(L[i]));
}
const g = 0.75 / peak;
const data = Buffer.alloc(L.length * 4);
for (let i = 0; i < L.length; i++) {
  const s = Math.round(Math.max(-1, Math.min(1, L[i] * g)) * 32767);
  data.writeInt16LE(s, i * 4);
  data.writeInt16LE(s, i * 4 + 2);
}
const hd = Buffer.alloc(44);
hd.write('RIFF', 0); hd.writeUInt32LE(36 + data.length, 4); hd.write('WAVE', 8); hd.write('fmt ', 12); hd.writeUInt32LE(16, 16);
hd.writeUInt16LE(1, 20); hd.writeUInt16LE(2, 22); hd.writeUInt32LE(SR, 24); hd.writeUInt32LE(SR * 4, 28); hd.writeUInt16LE(4, 32);
hd.writeUInt16LE(16, 34); hd.write('data', 36); hd.writeUInt32LE(data.length, 40);
const wav = path.join(DIR, 'musique.wav');
writeFileSync(wav, Buffer.concat([hd, data]));
const video = path.join(DIR, `morges-info-${day}.mp4`);
execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', silent, '-i', wav, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k', '-shortest', '-movflags', '+faststart', video]);
rmSync(silent);
rmSync(wav);
writeFileSync(
  path.join(DIR, 'legende.txt'),
  `${theme.title.fr}, avec Gaston 🦢🗺️\n\n${theme.text.fr}\n\nToutes les idées : morges.info/decouvrir-morges\n\n${HASHTAGS} #DécouvrirMorges\n`,
);
console.log(video);
console.log(path.join(DIR, 'legende.txt'));
