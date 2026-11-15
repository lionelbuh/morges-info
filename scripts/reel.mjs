/**
 * Instagram video (Reel, 1080×1920, with the Morges.info music) presented by Gaston, the little swan of Morges.info,
 * with its caption and the text for Instagram's text-to-speech voice, made from the site's data.
 *
 * Usage: node scripts/reel.mjs [YYYY-MM-DD]   (default: today in Morges)
 * Output in reels/out/<date>/ (git-ignored): morges-info-<date>.mp4, legende.txt, voix.txt and
 * slide-<n>.png (one still per scene, for checking). Needs ffmpeg.
 *
 * The theme follows the day of the week:
 *   Mon  Morges hier      an old photograph and its story
 *   Wed  Le saviez-vous ? a fact about a place of Morges
 *   Fri  Ce week-end à Morges (the Saturday market, the lake and an invitation to the calendar)
 *   Sun  Découvrir Morges (one theme of the page, in turn)
 * Videos are posted on those four days. Any other date falls back on a neighbour's theme
 * (Tue and Thu: Le saviez-vous ?, Sat: Découvrir Morges). Each theme moves on by one item every week.
 *
 * The video carries the Morges.info music (scripts/music.mjs); the voice is added in Instagram
 * ("Texte en voix") from voix.txt.
 * Photos: only public-domain photographs are used. The others were published on the site with their
 * authors' agreement, or under licences that forbid changes: they need a separate yes for Instagram.
 * Photos are always shown whole, never cropped.
 */
import { execFileSync, spawn } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { publishedViewpoints, shownPhotos } from '../src/data/viewpoints.js';
import { PLACES } from '../src/data/places.js';
import { todayInMorges } from '../src/data/events.js';
import { DISCOVER_THEMES } from '../src/data/discover.js';
import { music } from './music.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const W = 1080;
const H = 1920;
const FPS = 25;
const INK = '#1c1b19';
const RED = '#b3121a';
const SOFT = '#57524a';
const SWAN_LINE = '#c9c4ba';
const HASHTAGS = '#Morges #MorgesInfo #Vaud #LacLéman #Suisse #GastonLeCygne';
const BUBBLE_BOTTOM = 880;

const day = process.argv[2] || todayInMorges();
const dayNumber = Math.floor(Date.parse(`${day}T00:00:00Z`) / 86400000);
const weekday = new Date(`${day}T12:00:00Z`).getUTCDay(); // 0 = Sunday
const week = Math.floor((dayNumber + 3) / 7); // changes every Monday
const pick = (list) => list[((week % list.length) + list.length) % list.length];

/**
 * So that two videos never look alike: each theme has its own background colour and its own
 * accessory for Gaston, and he swims in from the left one week and from the right the next.
 */
const THEME = weekday === 5 ? 'weekend' : weekday === 0 || weekday === 6 ? 'discover' : weekday >= 2 && weekday <= 4 ? 'fact' : 'past';
const STYLE = {
  past: { bg: '#efe2c8', accessory: 'boater' },
  fact: { bg: '#e1ecf5', accessory: 'glasses' },
  weekend: { bg: '#fbe6c4', accessory: 'sunglasses' },
  discover: { bg: '#e2eedd', accessory: 'beret' },
}[THEME];
const HELLO = ['Coucou !', 'Salut tout le monde !', 'Hello Morges !', 'Bonjour, bonjour !', 'Hé, coucou !'][((week % 5) + 5) % 5];
const FACING = week % 2 ? -1 : 1; // 1: Gaston looks right, -1: he looks left
const GASTON_X = FACING === 1 ? 470 : 610;
const HEAD_X = GASTON_X + FACING * 232;

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** First sentences of a text, up to about `max` characters. */
function short(text, max = 230) {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  let out = '';
  for (const s of sentences) {
    if ((out + s).length > max && out) break;
    out += s;
  }
  return out.trim();
}

/** Lines of at most `max` characters. Only plain spaces break lines (a no-break space keeps « ? » with its word). */
function wrap(text, max) {
  const lines = [];
  let line = '';
  for (const word of text.split(/[ \t\n]+/)) {
    if (`${line} ${word}`.trim().length > max && line) {
      lines.push(line);
      line = word;
    } else line = `${line} ${word}`.trim();
  }
  if (line) lines.push(line);
  return lines;
}

/** A long text cut into pieces of about `max` characters, at sentence or clause boundaries. */
function chunks(text, max = 100) {
  const parts = text.match(/[^,;:.!?]+[,;:.!?]*\s*/g) || [text];
  const out = [];
  let cur = '';
  for (const p of parts) {
    if ((cur + p).trim().length > max && cur) {
      out.push(cur.trim());
      cur = '';
    }
    cur += p;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

/** Photographs that may be used outside the site without asking: public domain only. */
const freePhotos = publishedViewpoints()
  .map((vp) => ({ vp, photo: shownPhotos(vp).then }))
  .filter(({ photo }) => photo && photo.rights.status === 'public-domain');

/** The site's emblem (the arms of Morges, as in the header) above its name and motto, at the foot of every frame. */
const LOGO = `<g transform="translate(490 1580)">
    <path d="M0 0h100v50H0z" fill="#fff"/><path d="M0 50h100v50H0z" fill="#d52b1e"/>
    <path d="M0 18Q12.5 12.5 25 18T50 18T75 18T100 18V32Q87.5 37.5 75 32T50 32T25 32T0 32Z" fill="#d52b1e"/>
    <path d="M0 68Q12.5 62.5 25 68T50 68T75 68T100 68V82Q87.5 87.5 75 82T50 82T25 82T0 82Z" fill="#fff"/>
    <path d="M1 1h98v98H1z" fill="none" stroke="${INK}" stroke-opacity=".35" stroke-width="2"/>
  </g>
  <text x="540" y="1770" text-anchor="middle" font-family="DejaVu Serif" font-size="60" font-weight="bold" fill="${INK}">Morges<tspan fill="${RED}" font-style="italic">.info</tspan></text>
  <text x="540" y="1818" text-anchor="middle" font-family="Inter" font-size="24" font-weight="bold" letter-spacing="5" fill="${SOFT}">LA GAZETTE INDÉPENDANTE DE MORGES</text>`;

const clamp01 = (x) => Math.min(1, Math.max(0, x));
const easeOut = (x) => 1 - Math.pow(1 - clamp01(x), 3);
const backOut = (x) => {
  const c = 1.7;
  const v = clamp01(x) - 1;
  return 1 + (c + 1) * v ** 3 + c * v ** 2;
};

const ACCESSORIES = {
  // a straw boater, as on the quays around 1900
  boater: `<ellipse cx="170" cy="-236" rx="50" ry="9" fill="#e2bf73" stroke="#b8933f" stroke-width="3"/>
    <path d="M146 -238 L150 -266 L192 -266 L196 -238 Z" fill="#e8c77a" stroke="#b8933f" stroke-width="3"/>
    <rect x="148" y="-251" width="46" height="8" fill="#b3121a"/>`,
  // round reading glasses
  glasses: `<circle cx="183" cy="-216" r="15" fill="#fff" fill-opacity=".25" stroke="${INK}" stroke-width="4"/>
    <path d="M168 -218 L140 -222" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`,
  // sunglasses for the weekend
  sunglasses: `<path d="M166 -228 L204 -228 L201 -210 C196 -202 172 -202 168 -210 Z" fill="${INK}"/>
    <path d="M176 -224 L184 -224" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".7"/>
    <path d="M166 -224 L140 -226" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`,
  // a red beret, ready to explore
  beret: `<ellipse cx="164" cy="-240" rx="44" ry="15" transform="rotate(-12 164 -240)" fill="#d52b1e"/>
    <circle cx="168" cy="-256" r="5" fill="#d52b1e"/>`,
};

/** Gaston: a white swan with a red and white scarf (the colours of Morges), floating on the lake. */
function gaston(t, talking, sceneT) {
  const bob = Math.sin(t * 2.4) * 10;
  const hop = sceneT < 0.5 ? -Math.sin((sceneT / 0.5) * Math.PI) * 40 : 0;
  const tilt = Math.sin(t * 1.7) * 2.5;
  const blink = t % 3.1 < 0.12 ? 0.1 : 1;
  const beak = talking ? Math.abs(Math.sin(t * 14)) * 14 : 0;
  const flap = sceneT < 0.7 ? Math.sin((sceneT / 0.7) * Math.PI * 3) * 22 : Math.sin(t * 2) * 3;
  const brow = talking ? Math.abs(Math.sin(t * 5)) * 6 : 0;
  const tail = Math.sin(t * 6);
  const enter = (1 - easeOut(t / 1.1)) * -FACING * 720;
  return `<g transform="translate(${(GASTON_X + enter).toFixed(1)} ${1290 + bob + hop}) rotate(${tilt * FACING}) scale(${1.35 * FACING} 1.35)">
    <ellipse cx="0" cy="102" rx="190" ry="14" fill="#000" opacity=".08"/>
    <path d="M70 10 C130 -40 50 -120 85 -190 C105 -235 165 -238 178 -200" fill="none" stroke="${SWAN_LINE}" stroke-width="48" stroke-linecap="round"/>
    <path d="M70 10 C130 -40 50 -120 85 -190 C105 -235 165 -238 178 -200" fill="none" stroke="#fff" stroke-width="40" stroke-linecap="round"/>
    <path d="M-175 35 C-215 -30 -150 -70 -60 -55 C20 -42 90 -15 130 25 C160 55 125 98 40 98 L-115 98 C-170 98 -195 70 -175 35 Z" fill="#fff" stroke="${SWAN_LINE}" stroke-width="5"/>
    <g transform="rotate(${-flap} 50 10)">
      <path d="M-140 30 C-95 -35 20 -35 75 15 C25 40 -60 55 -140 30 Z" fill="#f4f1ea" stroke="${SWAN_LINE}" stroke-width="4"/>
      <path d="M-100 28 C-60 5 -10 5 30 22" fill="none" stroke="#d9d4ca" stroke-width="4" stroke-linecap="round"/>
    </g>
    <g transform="rotate(-28 92 -50)">
      <rect x="62" y="-66" width="64" height="30" rx="10" fill="#d52b1e"/>
      <rect x="62" y="-56" width="64" height="9" fill="#fff"/>
      <path d="M66 -50 C40 -46 22 -30 ${8 + tail * 6} -14 L${18 + tail * 6} -2 C34 -18 50 -30 70 -36 Z" fill="#d52b1e"/>
      <path d="M50 -40 C38 -32 30 -24 ${22 + tail * 4} -15 L${27 + tail * 4} -10 C36 -20 44 -28 54 -34 Z" fill="#fff"/>
    </g>
    <circle cx="172" cy="-205" r="36" fill="#fff" stroke="${SWAN_LINE}" stroke-width="4"/>
    <circle cx="168" cy="-190" r="9" fill="#f6b6b0" opacity=".8"/>
    <path d="M200 -222 L258 -206 L203 -198 Z" fill="#f08a24"/>
    <g transform="rotate(${beak} 203 -200)"><path d="M203 -200 L250 -199 L203 -190 Z" fill="#d9701a"/></g>
    <path d="M172 ${-234 - brow} q11 -7 22 0" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
    <ellipse cx="182" cy="-216" rx="8" ry="${9 * blink}" fill="${INK}"/>
    <circle cx="185" cy="-219.5" r="2.6" fill="#fff" opacity="${blink > 0.5 ? 1 : 0}"/>
    ${ACCESSORIES[STYLE.accessory]}
  </g>`;
}

function lake(t) {
  const wave = (y, amp, phase, colour) => {
    let d = `M0 ${y}`;
    for (let x = 0; x <= W; x += 30) d += ` L${x} ${(y + Math.sin(x / 70 + t * 2 + phase) * amp).toFixed(1)}`;
    return `<path d="${d} L${W} 1540 L0 1540 Z" fill="${colour}" opacity=".55"/>`;
  };
  return wave(1400, 10, 0, '#7fb3d5') + wave(1425, 8, 2, '#5b97c2');
}

function header(kicker, title) {
  const lines = wrap(title, 24).slice(0, 2);
  const svg = `<rect x="60" y="120" width="960" height="6" fill="${INK}"/>
    <text x="60" y="210" font-family="Inter" font-size="34" font-weight="bold" letter-spacing="4" fill="${RED}">${esc(kicker.toUpperCase())}</text>
    ${lines.map((l, i) => `<text x="60" y="${300 + i * 76}" font-family="DejaVu Serif" font-size="66" font-weight="bold" fill="${INK}">${esc(l)}</text>`).join('')}`;
  return { svg, bottom: 300 + (lines.length - 1) * 76 + 30 };
}

const BIG = { size: 70, lh: 84, max: 20 };
const SMALL = { size: 50, lh: 60, max: 30 };

/** The scene's speech bubble; the words appear one by one while Gaston speaks. */
function bubble(scene, sceneT, last) {
  const big = scene.big ? wrap(scene.big, BIG.max) : [];
  const small = scene.small ? wrap(scene.small, SMALL.max) : [];
  const h = big.length * BIG.lh + small.length * SMALL.lh + (big.length && small.length ? 24 : 0) + 90;
  const top = BUBBLE_BOTTOM - h;
  const lines = [...big.map((l) => ({ l, big: true })), ...small.map((l) => ({ l, big: false }))];
  const words = lines.reduce((n, x) => n + x.l.split(' ').length, 0);
  const speak = Math.max(0.8, scene.d - 1.2);
  const shown = Math.ceil(clamp01((sceneT - 0.3) / speak) * words);
  let left = shown;
  let y = top + 45;
  const texts = lines
    .map((x, i) => {
      if (i === big.length && i > 0) y += 24;
      y += x.big ? BIG.lh : SMALL.lh;
      const ws = x.l.split(' ');
      const visible = ws.slice(0, Math.max(0, left)).join(' ');
      left -= ws.length;
      const link = /morges\.info/.test(x.l);
      return x.big
        ? `<text x="540" y="${y - 18}" text-anchor="middle" font-family="DejaVu Serif" font-size="${BIG.size}" font-weight="bold" fill="${INK}">${esc(visible)}</text>`
        : `<text x="540" y="${y - 14}" text-anchor="middle" font-family="Inter" font-size="${SMALL.size}" font-weight="${link ? 'bold' : 'normal'}" fill="${link ? RED : SOFT}">${esc(visible)}</text>`;
    })
    .join('');
  const s = backOut(sceneT / 0.45);
  const fade = last ? 1 : 1 - easeOut((sceneT - (scene.d - 0.3)) / 0.3);
  const bottom = top + h;
  return {
    top,
    talking: sceneT > 0.3 && sceneT < 0.3 + speak,
    svg: `<g opacity="${fade.toFixed(3)}" transform="translate(540 ${bottom}) scale(${s.toFixed(4)}) translate(-540 ${-bottom})">
    <rect x="70" y="${top}" width="940" height="${h}" rx="56" fill="#fff" stroke="${INK}" stroke-width="6"/>
    <path d="M${HEAD_X - FACING * 62} ${bottom - 3} L${HEAD_X + FACING * 33} ${bottom + 80} L${HEAD_X + FACING * 18} ${bottom - 3} Z" fill="#fff" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
    <rect x="${Math.min(HEAD_X - FACING * 62, HEAD_X + FACING * 18) + 4}" y="${bottom - 12}" width="72" height="12" fill="#fff"/>
    ${texts}
  </g>`,
  };
}

/** The day's content: header, scenes (bubbles or a photo), caption and the voice text. */
function content() {
  // Friday: the weekend in Morges. No event names, an invitation to the calendar
  if (weekday === 5) {
    return {
      kicker: 'Ce week-end à Morges',
      title: 'Bon week-end !',
      scenes: [
        { big: HELLO, small: 'C’est Gaston. Le week-end arrive, on en profite ?' },
        { big: 'Samedi matin, c’est jour de marché !', small: 'Sur la Grand-Rue piétonne, jusqu’à 14 h.' },
        { big: 'Puis on file au bord du lac !', small: 'Les quais, le port et le château, à deux pas.' },
        { big: 'Que faire ce week-end ?', small: 'Tout est dans le calendrier : morges.info/vie-locale' },
      ],
      caption: `Ce week-end à Morges avec Gaston 🦢📅\n\nSamedi matin, c’est jour de marché sur la Grand-Rue piétonne, jusqu’à 14 h. Puis une balade au bord du lac, entre les quais, le port et le château.\n\nEt pour le reste du week-end, concerts, ateliers, expositions ou fêtes : tout est dans le calendrier de Morges.info, jour par jour.\n\n👉 morges.info/vie-locale\n\n${HASHTAGS} #AgendaMorges #WeekendMorges`,
    };
  }
  // Sunday (and Saturday): a theme of Découvrir Morges
  if (weekday === 0 || weekday === 6) {
    const theme = pick(DISCOVER_THEMES);
    const free = freePhotos.find(({ photo }) => photo.image.src === theme.photo.src);
    const pieces = chunks(theme.text.fr);
    return {
      kicker: 'Découvrir Morges',
      title: theme.title.fr,
      scenes: [
        { big: HELLO, small: 'C’est Gaston. Une idée de sortie pour cette semaine ?' },
        ...(free ? [{ photo: free.photo.image.src, credit: `Photo : ${free.photo.rights.credit}, domaine public` }] : []),
        ...pieces.map((p, i) => ({ big: i === 0 ? theme.title.fr : undefined, small: p })),
        { big: 'Allez, on se bouge les plumes !', small: 'Toutes mes idées sur morges.info' },
      ],
      caption: `${theme.title.fr}, avec Gaston 🦢✨\n\n${theme.text.fr}\n\nToutes les idées : morges.info/decouvrir-morges\n\n${free ? `Photo : ${free.photo.rights.credit}, domaine public\n\n` : ''}${HASHTAGS} #DécouvrirMorges`,
    };
  }
  // Wednesday (and Tuesday, Thursday): a fact about a place
  if (weekday >= 2 && weekday <= 4) {
    const place = pick(PLACES);
    const fact = short(place.description.fr);
    const free = freePhotos.find(({ vp }) => vp.placeId === place.id);
    return {
      kicker: 'Le saviez-vous ?',
      title: place.name.fr,
      scenes: [
        { big: HELLO, small: 'C’est Gaston. J’ai une petite anecdote pour vous !' },
        ...(free ? [{ photo: free.photo.image.src, credit: `Photo : ${free.photo.rights.credit}, domaine public` }] : []),
        ...chunks(fact).map((p) => ({ small: p })),
        { big: 'Épatant, non ?', small: `La suite sur morges.info/lieux/${place.id}` },
      ],
      caption: `Le saviez-vous ? ${place.name.fr}, avec Gaston 🦢💡\n\n${fact}\n\nÀ lire sur morges.info/lieux/${place.id}\n\n${free ? `Photo : ${free.photo.rights.credit}, domaine public\n\n` : ''}${HASHTAGS}`,
    };
  }
  // Monday: an old photograph
  const { vp, photo } = pick(freePhotos);
  const year = photo.date.value.slice(0, 4);
  const when = photo.date.precision === 'circa' ? `vers ${year}` : `en ${year}`;
  const credit = `Photo : ${photo.rights.credit}, domaine public`;
  const story = short((photo.caption || vp.title).fr, 200);
  return {
    kicker: 'Morges hier',
    title: vp.title.fr,
    scenes: [
      { big: HELLO, small: `C’est Gaston. On remonte le temps, ${when} ?` },
      { photo: photo.image.src, credit },
      ...chunks(story).map((p) => ({ small: p })),
      { big: 'Et aujourd’hui ?', small: 'Comparez sur la carte photo : morges.info/photos' },
    ],
    caption: `Morges hier : ${vp.title.fr}, ${when}, avec Gaston 🦢📸\n\n${(photo.caption || vp.title).fr}\n\nD’autres photos anciennes, sur la carte : morges.info/photos/${vp.id}\n\n${credit}\n\n${HASHTAGS} #MorgesHier #PhotoAncienne`,
  };
}

const outDir = path.join(root, 'reels', 'out', day);
rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
const { kicker, title, scenes, caption } = content();
const head = header(kicker, title);

// timing: a photo stays 3.5 s, a bubble long enough to be read (and spoken)
let acc = 0;
for (const sc of scenes) {
  const chars = `${sc.big || ''} ${sc.small || ''}`.length;
  sc.d = sc.photo ? 3.5 : Math.min(6.5, Math.max(3, 1.3 + chars * 0.055));
  sc.start = acc;
  acc += sc.d;
}
const TOTAL = acc;

// photos are resized once, whole, into the space between the header and Gaston
for (const sc of scenes.filter((s) => s.photo)) {
  const img = sharp(path.join(root, 'public', sc.photo));
  const meta = await img.metadata();
  const boxTop = head.bottom + 40;
  const boxH = 830 - boxTop;
  let pw = 960;
  let ph = Math.round((meta.height / meta.width) * pw);
  if (ph > boxH) {
    ph = boxH;
    pw = Math.round((meta.width / meta.height) * ph);
  }
  sc.layer = { input: await img.resize(pw, ph).png().toBuffer(), left: Math.round((W - pw) / 2), top: boxTop + Math.round((boxH - ph) / 2) };
  sc.creditY = boxTop + boxH + 40;
}

function frame(t) {
  const i = scenes.findLastIndex((s) => t >= s.start);
  const scene = scenes[Math.max(0, i)];
  const sceneT = t - scene.start;
  const b = scene.photo ? null : bubble(scene, sceneT, scene === scenes.at(-1));
  if (b && b.top < head.bottom + 20) throw new Error(`Bubble too tall on ${day}: ${scene.big || ''} ${scene.small || ''}`);
  const sparkle = [0, 1, 2]
    .map((k) => {
      const a = (t * 1.3 + k * 2.1) % 3;
      return `<text x="${150 + k * 360}" y="${(1000 - a * 60).toFixed(1)}" font-family="DejaVu Sans" font-size="44" fill="${RED}" opacity="${Math.max(0, 0.5 - Math.abs(a - 1.5) / 3).toFixed(3)}">✦</text>`;
    })
    .join('');
  const credit = scene.photo ? `<text x="540" y="${scene.creditY}" text-anchor="middle" font-family="Inter" font-size="28" fill="${SOFT}">${esc(scene.credit)}</text>` : '';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <rect width="${W}" height="${H}" fill="${STYLE.bg}"/>
    ${head.svg}
    ${sparkle}
    ${lake(t)}
    ${gaston(t, b ? b.talking : false, sceneT)}
    <rect x="0" y="1470" width="${W}" height="450" fill="${STYLE.bg}"/>
    ${lake(t)}
    ${b ? b.svg : credit}
    ${LOGO}
  </svg>`;
  const img = sharp(Buffer.from(svg));
  return scene.layer ? img.composite([scene.layer]) : img;
}

const video = path.join(outDir, `morges-info-${day}.mp4`);
const silent = path.join(outDir, 'image.mp4');
const ffmpeg = spawn(
  'ffmpeg',
  ['-loglevel', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-',
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20', '-movflags', '+faststart', silent],
  { stdio: ['pipe', 'inherit', 'inherit'] },
);
const done = new Promise((resolve, reject) => ffmpeg.on('close', (code) => (code ? reject(new Error(`ffmpeg exited with ${code}`)) : resolve())));
const stills = new Set(scenes.map((s) => Math.round((s.start + s.d * 0.85) * FPS)));
for (let n = 0; n < Math.round(TOTAL * FPS); n++) {
  const t = n / FPS;
  const img = frame(t);
  if (stills.has(n)) await img.clone().png().toFile(path.join(outDir, `slide-${[...stills].indexOf(n) + 1}.png`));
  const buf = await img.removeAlpha().raw().toBuffer();
  if (!ffmpeg.stdin.write(buf)) await new Promise((resolve) => ffmpeg.stdin.once('drain', resolve));
}
ffmpeg.stdin.end();
await done;

// the Morges.info music under the pictures (Instagram's voice goes on top)
const wav = path.join(outDir, 'musique.wav');
music(TOTAL, wav);
execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', silent, '-i', wav, '-map', '0:v', '-map', '1:a',
  '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k', '-shortest', '-movflags', '+faststart', video]);
rmSync(silent);
rmSync(wav);

const voice = scenes
  .filter((s) => !s.photo)
  .map((s) => [s.big && (/[.!?:]$/.test(s.big) ? s.big : `${s.big}.`), s.small].filter(Boolean).join(' '))
  .join(' ')
  .replace(/morges\.info(\/[\w/-]*)?/g, 'Morges point info')
  .replace(/\u00a0/g, ' ');
writeFileSync(path.join(outDir, 'legende.txt'), `${caption}\n`);
writeFileSync(path.join(outDir, 'voix.txt'), `${voice}\n`);
console.log(video);
console.log(path.join(outDir, 'legende.txt'));
console.log(path.join(outDir, 'voix.txt'));
