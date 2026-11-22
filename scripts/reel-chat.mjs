/**
 * Friday's Instagram video, "Ce week-end à Morges", as a chat with Gaston (1080×1920): a friend asks him what
 * to do this weekend; he types, answers (the Saturday market, the lake, the calendar), shares the link to the
 * calendar, the friend sends a heart and says thanks, and the video ends on "Bon week-end !" with the harbour
 * emblem, the flag of Morges and Morges.info. A plain, generic chat look, not any real app's.
 * Music: an original lo-fi beat (soft electric piano, dusty drums, vinyl crackle) with a little "pop" for
 * each message, synthesised here (no samples or recordings), ending on the Morges.info sound logo.
 *
 * Called by scripts/reel.mjs on Fridays: node scripts/reel.mjs [YYYY-MM-DD]
 * Output in reels/out/<date>/: morges-info-<date>.mp4, legende.txt and slide-<n>.png (one still per message).
 * With REEL_STILLS=1, only the stills are made (to check the layout quickly).
 */
import sharp from 'sharp';
import { spawn, execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { todayInMorges } from '../src/data/events.js';
import { emblemShapes } from '../src/site/emblem.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const W = 1080;
const H = 1920;
const FPS = 25;
const INK = '#1c1b19';
const LAKE = '#15406e';
const PAPER = '#fff8ef';
const HASHTAGS = '#Morges #MorgesInfo #Vaud #LacLéman #Suisse #GastonLeCygne';
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const easeOut = (x) => 1 - (1 - clamp01(x)) ** 3;
const backOut = (x) => {
  const v = clamp01(x) - 1;
  return 1 + 2.7 * v ** 3 + 1.7 * v ** 2;
};
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
function wrap(text, max) {
  const lines = [];
  let line = '';
  for (const w of text.split(/[ \t\n]+/)) {
    if (`${line} ${w}`.trim().length > max && line) {
      lines.push(line);
      line = w;
    } else line = `${line} ${w}`.trim();
  }
  if (line) lines.push(line);
  return lines;
}

const day = process.argv[2] || todayInMorges();
const DIR = path.join(ROOT, 'reels', 'out', day);
const STILLS_ONLY = process.env.REEL_STILLS === '1';
rmSync(DIR, { recursive: true, force: true });
mkdirSync(DIR, { recursive: true });
const dateLabel = new Intl.DateTimeFormat('fr-CH', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' }).format(new Date(`${day}T12:00:00Z`));

// ---- the conversation: who speaks, when (s), and what
const MESSAGES = [
  { who: 'friend', text: 'Gaston ! Tu fais quoi ce week-end ?' },
  { who: 'gaston', icon: 'basket', text: 'Samedi matin, c’est marché sur la Grand-Rue !', small: 'Jusqu’à 14 h, dans la rue piétonne.' },
  { who: 'friend', text: 'Et après ?' },
  { who: 'gaston', icon: 'wave', text: 'On file au bord du lac : les quais, le port, le château.' },
  { who: 'friend', text: 'Et pour le reste du week-end ?' },
  { who: 'gaston', icon: 'calendar', text: 'Concerts, ateliers, expos, fêtes… tout est dans le calendrier !' },
  { who: 'gaston', card: true },
  { who: 'friend', text: 'Génial, merci ! Bon week-end Gaston !', typed: true },
];
let t0 = 0.8;
for (const m of MESSAGES) {
  if (m.who === 'gaston') t0 += m.card ? 0.4 : 1.0; // Gaston types first
  if (m.typed) t0 += 1.6; // the friend types in the field
  m.at = t0;
  const words = `${m.text || ''} ${m.small || ''}`.split(' ').length;
  t0 += m.card ? 2.4 : Math.max(1.3, 0.5 + words * 0.17);
}
const HEART_AT = MESSAGES.at(-1).at - 0.6;
const END_AT = t0 + 0.4;
const TOTAL = END_AT + 3.4;

// ---- bubble sizes
const TEXT = 46;
const LH = 58;
const SMALL = 36;
for (const m of MESSAGES) {
  if (m.card) {
    m.w = 700;
    m.h = 470;
    continue;
  }
  // a no-break space before « : ; ! ? », so that they never start a line
  m.text = m.text.replace(/ ([:;!?])/g, '\u00a0$1');
  m.lines = wrap(m.text, m.icon ? 22 : 26);
  m.smallLines = m.small ? wrap(m.small, 32) : [];
  const longest = Math.max(...m.lines.map((l) => l.length * TEXT * 0.53), ...m.smallLines.map((l) => l.length * SMALL * 0.53));
  m.w = Math.min(800, Math.round(longest + 80 + (m.icon ? 96 : 0)));
  m.h = 44 + m.lines.length * LH + (m.smallLines.length ? 12 + m.smallLines.length * 46 : 0) + 20;
  if (m.icon) m.h = Math.max(m.h, 150);
}

// ---- drawing pieces
const FLAG = `<path d="M0 0h100v50H0z" fill="#fff"/><path d="M0 50h100v50H0z" fill="#d52b1e"/>
  <path d="M0 18Q12.5 12.5 25 18T50 18T75 18T100 18V32Q87.5 37.5 75 32T50 32T25 32T0 32Z" fill="#d52b1e"/>
  <path d="M0 68Q12.5 62.5 25 68T50 68T75 68T100 68V82Q87.5 87.5 75 82T50 82T25 82T0 82Z" fill="#fff"/>`;

/** Gaston's head in a round avatar, with his weekend sunglasses. */
function avatar(cx, cy, r, t) {
  const s = r / 150;
  return `<g transform="translate(${cx} ${cy}) scale(${s})">
    <circle r="150" fill="#ffd9a8"/>
    <clipPath id="av"><circle r="150"/></clipPath>
    <g clip-path="url(#av)"><g transform="translate(-175 ${110 + Math.sin(t * 2.4) * 6})">
      <path d="M70 200 L80 40 C130 0 60 -60 90 -110 C110 -150 165 -152 178 -120" fill="none" stroke="#c9c4ba" stroke-width="48" stroke-linecap="round"/>
      <path d="M70 200 L80 40 C130 0 60 -60 90 -110 C110 -150 165 -152 178 -120" fill="none" stroke="#fff" stroke-width="40" stroke-linecap="round"/>
      <g transform="rotate(-28 95 10)"><rect x="66" y="-6" width="60" height="28" rx="10" fill="#d52b1e"/><rect x="66" y="3" width="60" height="9" fill="#fff"/></g>
      <circle cx="172" cy="-125" r="36" fill="#fff" stroke="#c9c4ba" stroke-width="4"/>
      <circle cx="168" cy="-110" r="9" fill="#f6b6b0" opacity=".8"/>
      <path d="M200 -142 L258 -126 L203 -118 Z" fill="#f08a24"/>
      <path d="M203 -120 L250 -119 L203 -110 Z" fill="#d9701a"/>
      <path d="M166 -148 L204 -148 L201 -130 C196 -122 172 -122 168 -130 Z" fill="${INK}"/>
      <path d="M176 -144 L184 -144" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".7"/>
      <path d="M166 -144 L140 -146" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
    </g></g>
  </g>`;
}

/** Little drawn icons (no emoji font needed). */
const ICONS = {
  basket: `<path d="M-30 -6 C-30 -40 30 -40 30 -6" fill="none" stroke="#8a5a2b" stroke-width="7"/>
    <path d="M-40 -8 H40 L32 34 H-32 Z" fill="#d9a066" stroke="#8a5a2b" stroke-width="5"/>
    <path d="M-36 8 H36 M-34 22 H34 M-16 -8 L-12 34 M16 -8 L12 34" stroke="#8a5a2b" stroke-width="3"/>
    <circle cx="-12" cy="-16" r="11" fill="#e0362c"/><circle cx="10" cy="-18" r="10" fill="#7cb342"/>`,
  wave: `<circle cx="20" cy="-22" r="14" fill="#f6c343"/>
    <path d="M-42 6 Q-28 -8 -14 6 T14 6 T42 6" fill="none" stroke="#2f7fbf" stroke-width="8" stroke-linecap="round"/>
    <path d="M-42 26 Q-28 12 -14 26 T14 26 T42 26" fill="none" stroke="#2f7fbf" stroke-width="8" stroke-linecap="round" opacity=".6"/>`,
  calendar: `<rect x="-38" y="-32" width="76" height="70" rx="10" fill="#fff" stroke="${INK}" stroke-width="5"/>
    <path d="M-38 -12 H38" stroke="${INK}" stroke-width="5"/><rect x="-38" y="-32" width="76" height="20" rx="8" fill="#e0362c"/>
    <path d="M-20 -40 V-24 M20 -40 V-24" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>
    <circle cx="-16" cy="6" r="5" fill="${INK}"/><circle cx="0" cy="6" r="5" fill="${INK}"/><circle cx="16" cy="6" r="5" fill="${INK}"/>
    <circle cx="-16" cy="22" r="5" fill="${INK}"/><circle cx="0" cy="22" r="5" fill="#e0362c"/>`,
};

function heart(x, y, s) {
  return `<g transform="translate(${x} ${y}) scale(${s})"><circle r="34" fill="#fff" stroke="#f1d6cf" stroke-width="3"/>
    <path d="M0 14 C-26 -2 -22 -22 -9 -22 C-3 -22 0 -17 0 -14 C0 -17 3 -22 9 -22 C22 -22 26 -2 0 14 Z" fill="#e0362c"/></g>`;
}

/** One bubble, its bottom at `bottom`; `p` from 0 to 1 while it pops in. */
function bubble(m, bottom, p) {
  const mine = m.who === 'friend';
  const x = mine ? W - 60 - m.w : 150;
  const y = bottom - m.h;
  const s = 0.6 + 0.4 * backOut(p);
  const ox = mine ? x + m.w : x;
  let inner;
  if (m.card) {
    inner = `<rect x="${x}" y="${y}" width="${m.w}" height="${m.h}" rx="36" fill="#fff"/>
      <clipPath id="card"><rect x="${x + 16}" y="${y + 16}" width="${m.w - 32}" height="250" rx="24"/></clipPath>
      <g clip-path="url(#card)"><rect x="${x + 16}" y="${y + 16}" width="${m.w - 32}" height="250" fill="url(#lake)"/>
        <circle cx="${x + m.w - 110}" cy="${y + 80}" r="46" fill="#f6d27a"/>
        <svg x="${x + 60}" y="${y + 46}" width="190" height="190" viewBox="0 0 200 200">${emblemShapes('card-emblem')}</svg>
        <g transform="translate(${x + 290} ${y + 66}) scale(.55)">${FLAG}</g>
        <text x="${x + 290}" y="${y + 190}" font-family="DejaVu Serif" font-size="58" font-weight="bold" fill="#fff">Morges<tspan fill="#f6d27a" font-style="italic">.info</tspan></text></g>
      <text x="${x + 40}" y="${y + 330}" font-family="Inter" font-size="44" font-weight="800" fill="${INK}">L’agenda de Morges</text>
      <text x="${x + 40}" y="${y + 384}" font-family="Inter" font-size="36" font-weight="500" fill="#57524a">Concerts, marchés, expos, jour par jour</text>
      <text x="${x + 40}" y="${y + 436}" font-family="Inter" font-size="36" font-weight="700" fill="${LAKE}">morges.info/vie-locale</text>`;
  } else {
    const tx = x + 40 + (m.icon ? 96 : 0);
    inner = `<rect x="${x}" y="${y}" width="${m.w}" height="${m.h}" rx="40" fill="${mine ? LAKE : '#fff'}"/>
      <path d="${mine ? `M${x + m.w - 40} ${bottom - 30} L${x + m.w + 16} ${bottom + 4} L${x + m.w - 70} ${bottom}` : `M${x + 40} ${bottom - 30} L${x - 16} ${bottom + 4} L${x + 70} ${bottom}`} Z" fill="${mine ? LAKE : '#fff'}"/>
      ${m.icon ? `<g transform="translate(${x + 78} ${y + 78})">${ICONS[m.icon]}</g>` : ''}
      ${m.lines.map((l, i) => `<text x="${tx}" y="${y + 60 + i * LH}" font-family="Inter" font-size="${TEXT}" font-weight="600" fill="${mine ? '#fff' : INK}">${esc(l)}</text>`).join('')}
      ${m.smallLines.map((l, i) => `<text x="${tx}" y="${y + 60 + m.lines.length * LH + 6 + i * 46}" font-family="Inter" font-size="${SMALL}" font-weight="500" fill="#57524a">${esc(l)}</text>`).join('')}`;
  }
  return `<g transform="translate(${ox} ${bottom}) scale(${s.toFixed(3)}) translate(${-ox} ${-bottom})" opacity="${clamp01(p * 3).toFixed(2)}">${inner}</g>`;
}

function typingBubble(bottom, t, p) {
  const dots = [0, 1, 2].map((k) => `<circle cx="${150 + 56 + k * 40}" cy="${bottom - 50 - Math.max(0, Math.sin(t * 9 - k * 0.8)) * 12}" r="11" fill="#9c958a"/>`).join('');
  return `<g opacity="${p.toFixed(2)}"><rect x="150" y="${bottom - 100}" width="200" height="100" rx="40" fill="#fff"/>${dots}</g>`;
}

const DEFS = `<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffb36b"/><stop offset=".55" stop-color="#ff8f6b"/><stop offset="1" stop-color="#f2677a"/></linearGradient>
  <linearGradient id="lake" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0f3550"/><stop offset="1" stop-color="#4f9bc7"/></linearGradient>
</defs>`;

/** Wallpaper: little waves and swans' necks, very light. */
const WALL = (() => {
  let s = '';
  for (let r = 0; r < 12; r++)
    for (let c = 0; c < 5; c++) {
      const x = c * 230 + (r % 2) * 115 + 30;
      const y = 300 + r * 140;
      s += (r + c) % 3
        ? `<path d="M${x} ${y} q20 -16 40 0 t40 0" fill="none" stroke="#fff" stroke-width="5" opacity=".18" stroke-linecap="round"/>`
        : `<path d="M${x + 20} ${y + 20} C${x + 34} ${y} ${x + 10} ${y - 20} ${x + 22} ${y - 36} c8 -10 22 -8 24 2" fill="none" stroke="#fff" stroke-width="6" opacity=".2" stroke-linecap="round"/>`;
    }
  return s;
})();

const CHAT_BOTTOM = 1640;
const TOP = 330;

function frame(t) {
  let svg = `${DEFS}<rect width="${W}" height="${H}" fill="url(#bg)"/>${WALL}`;
  // date chip
  svg += `<rect x="${540 - 190}" y="${TOP + 20}" width="380" height="60" rx="30" fill="#fff" opacity=".5"/>
    <text x="540" y="${TOP + 61}" text-anchor="middle" font-family="Inter" font-size="30" font-weight="700" fill="${INK}" opacity=".75">${esc(dateLabel)}</text>`;
  // messages, from the newest (bottom) up
  let bottom = CHAT_BOTTOM;
  const items = [];
  const next = MESSAGES.find((m) => m.at > t);
  if (next && next.who === 'gaston' && t > next.at - (next.card ? 0.4 : 1.0) + 0.1) items.push({ typing: true, p: easeOut((t - (next.at - (next.card ? 0.4 : 1.0))) / 0.2), h: 100 });
  for (const m of MESSAGES.filter((x) => x.at <= t).reverse()) items.push({ m, p: easeOut((t - m.at) / 0.3), h: m.h });
  for (const it of items) {
    if (bottom < TOP + 120) break;
    if (it.typing) svg += typingBubble(bottom, t, it.p);
    else {
      svg += bubble(it.m, bottom, it.p);
      if (it.m.card && t > HEART_AT) svg += heart(150 + it.m.w - 30, bottom + 6, backOut((t - HEART_AT) / 0.35));
      if (it.m.who === 'gaston' && it === items.find((x) => x.m && x.m.who === 'gaston')) svg += avatar(85, bottom - 40, 44, t);
    }
    bottom -= (it.h + (it.m && it.m.card && t > HEART_AT ? 60 : 34)) * it.p;
  }
  // header bar (drawn over the messages that scroll up under it)
  svg += `<rect width="${W}" height="${TOP}" fill="${PAPER}"/>
    <rect y="${TOP - 2}" width="${W}" height="2" fill="#000" opacity=".08"/>
    ${avatar(140, 220, 70, t)}
    <text x="240" y="208" font-family="Inter" font-size="50" font-weight="800" fill="${INK}">Gaston</text>
    <circle cx="252" cy="250" r="9" fill="#34a853"/>
    <text x="272" y="262" font-family="Inter" font-size="32" font-weight="500" fill="#57524a">${next && next.who === 'gaston' && t > next.at - 1 ? 'écrit…' : 'en ligne, au bord du lac'}</text>
    <svg x="930" y="150" width="110" height="110" viewBox="0 0 200 200">${emblemShapes('head-emblem')}</svg>
    <text x="540" y="96" text-anchor="middle" font-family="Inter" font-size="30" font-weight="800" letter-spacing="4" fill="${LAKE}">CE WEEK-END À MORGES</text>`;
  // the field at the bottom, where the friend's last message is typed
  const last = MESSAGES.at(-1);
  const typing = t > last.at - 1.6 && t < last.at;
  const shown = typing ? last.text.slice(0, Math.floor(((t - (last.at - 1.6)) / 1.4) * last.text.length)) : '';
  svg += `<rect y="${CHAT_BOTTOM + 30}" width="${W}" height="${H - CHAT_BOTTOM - 30}" fill="${PAPER}"/>
    <rect x="50" y="${CHAT_BOTTOM + 70}" width="840" height="100" rx="50" fill="#fff" stroke="#e6dccb" stroke-width="3"/>
    <text x="100" y="${CHAT_BOTTOM + 134}" font-family="Inter" font-size="38" font-weight="500" fill="${shown ? INK : '#a39b8f'}">${esc(shown ? wrap(shown, 34).at(-1) : 'Message…')}${typing && t % 0.6 < 0.3 ? '|' : ''}</text>
    <circle cx="970" cy="${CHAT_BOTTOM + 120}" r="54" fill="${typing ? LAKE : '#cfc6b8'}"/>
    <path d="M948 ${CHAT_BOTTOM + 100} L998 ${CHAT_BOTTOM + 120} L948 ${CHAT_BOTTOM + 140} L956 ${CHAT_BOTTOM + 120} Z" fill="#fff"/>`;
  // the end: "Bon week-end !" over everything
  if (t > END_AT) {
    const st = t - END_AT;
    const p = backOut(st / 0.5);
    const conf = Array.from({ length: 36 }, (_, k) => {
      const x = (k * 197) % W;
      const y = ((st * (260 + (k % 5) * 60) + k * 83) % (H + 200)) - 100;
      return `<rect x="${x}" y="${y.toFixed(0)}" width="22" height="12" rx="3" fill="${['#ffd23f', '#e0362c', '#fff', '#4f9bc7'][k % 4]}" transform="rotate(${(k * 40 + st * 200) % 360} ${x + 11} ${y.toFixed(0)})"/>`;
    }).join('');
    svg += `<rect width="${W}" height="${H}" fill="${LAKE}" opacity="${clamp01(st / 0.3).toFixed(2)}"/>${conf}
      <g transform="translate(540 600) scale(${p.toFixed(3)})">${avatar(0, 0, 190, t)}</g>
      <g transform="translate(540 1000) scale(${p.toFixed(3)}) rotate(-4)"><rect x="-430" y="-120" width="860" height="200" rx="40" fill="#ffd23f"/>
        <text y="18" text-anchor="middle" font-family="Inter Display" font-size="108" font-weight="900" fill="${INK}">Bon week-end !</text></g>
      <g opacity="${clamp01((st - 0.6) / 0.4).toFixed(2)}">
        <svg x="${540 - 190}" y="1260" width="150" height="150" viewBox="0 0 200 200">${emblemShapes('end-emblem')}</svg>
        <g transform="translate(${540 + 40} 1285) scale(1)">${FLAG}<path d="M1 1h98v98H1z" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="3"/></g>
        <text x="540" y="1530" text-anchor="middle" font-family="DejaVu Serif" font-size="84" font-weight="bold" fill="#fff">Morges<tspan fill="#ffd23f" font-style="italic">.info</tspan></text>
        <text x="540" y="1610" text-anchor="middle" font-family="Inter" font-size="42" font-weight="600" fill="#fff">Tout le week-end sur morges.info/vie-locale</text>
      </g>`;
  }
  return sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${svg}</svg>`));
}

// one still per message (just before the next one), and one of the end
const STILL_TIMES = [...MESSAGES.map((m, i) => (MESSAGES[i + 1] ? MESSAGES[i + 1].at - 0.05 : END_AT - 0.05)), TOTAL - 0.5];
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

// ---- music: lo-fi beat, 84 bpm, Fmaj7 Em7 Dm7 Cmaj7, a "pop" for each message; the sound logo at the end
const SR = 44100;
const L = new Float32Array(Math.round(TOTAL * SR));
const midi = (n) => 440 * 2 ** ((n - 69) / 12);
let rs = 11;
const rnd = () => ((rs = (rs * 16807) % 2147483647) / 2147483647) * 2 - 1;
function add(at, dur, fn) {
  const s0 = Math.round(at * SR);
  for (let i = 0; i < dur * SR && s0 + i < L.length; i++) L[s0 + i] += fn(i / SR);
}
function keys(at, note, v = 0.12, dur = 2.6) {
  const f = midi(note);
  add(at, dur, (t) => (Math.sin(2 * Math.PI * f * t) + 0.25 * Math.sin(2 * Math.PI * f * 2 * t) * Math.exp(-t * 3) + 0.15 * Math.sin(2 * Math.PI * f * 7 * t) * Math.exp(-t * 18))
    * Math.exp(-t * 1.1) * (1 + 0.15 * Math.sin(2 * Math.PI * 4.5 * t)) * v * Math.min(1, t * 200) * Math.min(1, (dur - t) * 8));
}
const kick = (at) => add(at, 0.3, (t) => Math.sin(2 * Math.PI * (48 * t + 25 * (1 - Math.exp(-t * 30)))) * Math.exp(-t * 9) * 0.55);
function snare(at) {
  let lp = 0;
  add(at, 0.25, (t) => {
    lp += 0.35 * (rnd() - lp);
    return (lp * 0.6 + Math.sin(2 * Math.PI * 190 * t) * 0.25) * Math.exp(-t * 16) * 0.5;
  });
}
function hat(at, v) {
  let p = 0;
  add(at, 0.04, (t) => {
    const w = rnd();
    const h = w - p;
    p = w;
    return h * Math.exp(-t * 110) * v;
  });
}
function pop(at, up) {
  add(at, 0.12, (t) => Math.sin(2 * Math.PI * (up ? 600 + 900 * t * 8 : 900 - 300 * t * 8) * t) * Math.exp(-t * 40) * 0.35);
}
const beat = 60 / 84;
const CH = [[53, 57, 60, 64], [52, 55, 59, 62], [50, 53, 57, 60], [48, 52, 55, 59]];
let bar = 0;
for (let at = 0.3; at < END_AT + 0.2; at += 4 * beat, bar++) {
  const ch = CH[bar % 4];
  ch.forEach((n, k) => keys(at + k * 0.02, n, 0.1));
  keys(at, ch[0] - 12, 0.16, 3);
  for (let b = 0; b < 4; b++) {
    const tb = at + b * beat;
    if (b === 0 || b === 2) kick(tb);
    if (b === 2 && bar % 2) kick(tb + beat * 0.6);
    if (b % 2) snare(tb);
    hat(tb, 0.06);
    hat(tb + beat * 0.6, 0.035); // swung
  }
}
for (const m of MESSAGES) pop(m.at, m.who === 'friend');
pop(HEART_AT, true);
for (const [dt, n, v] of [[0, 67, 0.5], [0.16, 72, 0.5], [0.32, 76, 0.55], [0.62, 74, 0.45], [0.8, 79, 0.7]]) keys(END_AT + 0.3 + dt, n, v * 0.5, 2.4);
[48, 55, 64].forEach((n) => keys(END_AT + 1.1, n, 0.1, 2.2));
// vinyl crackle
for (let i = 0; i < L.length; i++) L[i] += (Math.random() < 0.0006 ? rnd() * 0.25 : 0) + rnd() * 0.004;
let peak = 0;
for (let i = 0; i < L.length; i++) {
  const t = i / SR;
  if (t > TOTAL - 0.8) L[i] *= Math.max(0, (TOTAL - t) / 0.8);
  peak = Math.max(peak, Math.abs(L[i]));
}
const g = 0.72 / peak;
const data = Buffer.alloc(L.length * 4);
for (let i = 0; i < L.length; i++) {
  const s = Math.round(Math.tanh(L[i] * g * 1.1) * 32767 * 0.92);
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
  `Ce week-end à Morges avec Gaston 🦢📅\n\nSamedi matin, c’est jour de marché sur la Grand-Rue piétonne, jusqu’à 14 h. Puis une balade au bord du lac, entre les quais, le port et le château.\n\nEt pour le reste du week-end, concerts, ateliers, expositions ou fêtes : tout est dans le calendrier de Morges.info, jour par jour.\n\n👉 morges.info/vie-locale\n\n${HASHTAGS} #AgendaMorges #WeekendMorges\n`,
);
console.log(video);
console.log(path.join(DIR, 'legende.txt'));
