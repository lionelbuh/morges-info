/**
 * Instagram video (Reel, 1080×1920, with the Morges.info music) presented by Gaston, the little swan of Morges.info,
 * with its caption and the text for Instagram's text-to-speech voice, made from the site's data.
 *
 * Usage: node scripts/reel.mjs [YYYY-MM-DD]   (default: today in Morges)
 * Output in reels/out/<date>/ (git-ignored): morges-info-<date>.mp4, legende.txt, voix.txt and
 * slide-<n>.png (one still per scene, for checking). Needs ffmpeg.
 *
 * The theme follows the day of the week:
 *   Mon  Morges hier      an old photograph and its story, as a silent film (scripts/reel-film.mjs)
 *   Wed  Le saviez-vous ? a fact about a place of Morges
 *   Fri  Ce week-end à Morges (the Saturday market, the lake and an invitation to the calendar)
 *   Sun  Découvrir Morges (one theme of the page, in turn)
 * Videos are posted on those four days. Any other date falls back on a neighbour's theme
 * (Tue and Thu: Le saviez-vous ?, Sat: Découvrir Morges). Each theme moves on by one item every week.
 *
 * The video opens with the Morges.info sound logo (scripts/music.mjs); the voice is added in Instagram
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
import { emblemShapes } from '../src/site/emblem.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const W = 1080;
const H = 1920;
const FPS = 25;
const INK = '#1c1b19';
const SOFT = '#57524a';
const SWAN_LINE = '#c9c4ba';
const HASHTAGS = '#Morges #MorgesInfo #Vaud #LacLéman #Suisse #GastonLeCygne';
const BUBBLE_BOTTOM = 1140;

const day = process.argv[2] || todayInMorges();
const dayNumber = Math.floor(Date.parse(`${day}T00:00:00Z`) / 86400000);
const weekday = new Date(`${day}T12:00:00Z`).getUTCDay(); // 0 = Sunday
const week = Math.floor((dayNumber + 3) / 7); // changes every Monday
const pick = (list) => list[((week % list.length) + list.length) % list.length];

// Monday: "Morges hier" has its own look, a silent film (scripts/reel-film.mjs)
if (weekday === 1) {
  await import('./reel-film.mjs');
  process.exit(0);
}

/**
 * So that two videos never look alike: each theme has its own background colour and its own
 * accessory for Gaston, and he swims in from the left one week and from the right the next.
 */
const THEME = weekday === 5 ? 'weekend' : weekday === 0 || weekday === 6 ? 'discover' : weekday >= 2 && weekday <= 4 ? 'fact' : 'past';
const STYLE = {
  // top: deep colour behind the title; bg: light colour of the lower half (lake, Gaston, logo)
  past: { top: '#4a3324', mid: '#9c7148', bg: '#f1e2c6', accent: '#e9c27a', accessory: 'boater' },
  fact: { top: '#15406e', mid: '#3d7cb8', bg: '#dcebf7', accent: '#8fd0ff', accessory: 'glasses' },
  weekend: { top: '#b4421d', mid: '#ea8a3c', bg: '#fde6c2', accent: '#ffd36b', accessory: 'sunglasses' },
  discover: { top: '#174f3a', mid: '#3f8a63', bg: '#dff0d8', accent: '#bfe9a4', accessory: 'beret' },
}[THEME];
const HELLO = ['Coucou !', 'Salut tout le monde !', 'Hello Morges !', 'Bonjour, bonjour !', 'Hé, coucou !'][((week % 5) + 5) % 5];
const FACING = week % 2 ? -1 : 1; // tilt of the photos, and the side of the decorative circles

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

/** Foot of every frame: on a dark band, the Morges.info harbour emblem beside the flag of Morges, above the name. */
const FLAG = `<path d="M0 0h100v50H0z" fill="#fff"/><path d="M0 50h100v50H0z" fill="#d52b1e"/>
    <path d="M0 18Q12.5 12.5 25 18T50 18T75 18T100 18V32Q87.5 37.5 75 32T50 32T25 32T0 32Z" fill="#d52b1e"/>
    <path d="M0 68Q12.5 62.5 25 68T50 68T75 68T100 68V82Q87.5 87.5 75 82T50 82T25 82T0 82Z" fill="#fff"/>`;
const BAND_TOP = 1650;
const LOGO = `<rect x="0" y="${BAND_TOP}" width="${W}" height="${H - BAND_TOP}" fill="${STYLE.top}"/>
  <svg x="${540 - 120}" y="${BAND_TOP + 30}" width="110" height="110" viewBox="0 0 200 200">${emblemShapes('reel-emblem')}</svg>
  <g transform="translate(${540 + 22} ${BAND_TOP + 47}) scale(0.76)">${FLAG}<path d="M1 1h98v98H1z" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="3"/></g>
  <text x="540" y="${BAND_TOP + 210}" text-anchor="middle" font-family="DejaVu Serif" font-size="58" font-weight="bold" fill="#fff">Morges<tspan fill="${STYLE.accent}" font-style="italic">.info</tspan></text>`;

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

/** Which side Gaston peeks from in a scene (it changes from scene to scene, and from week to week). */
const sideOf = (index) => ((index + week) % 2 ? -1 : 1); // 1: from the left, looking right
const headX = (side) => (side === 1 ? 40 + 172 * 1.35 : 1040 - 172 * 1.35);

/** Gaston peeks over the band at the bottom, from the side, in the theme's accessory; he speaks while the bubble fills. */
function gaston(t, talking, sceneT, side) {
  const bob = Math.sin(t * 2.4) * 8;
  const rise = (1 - easeOut(sceneT / 0.6)) * 260;
  const tilt = Math.sin(t * 1.7) * 3;
  const blink = t % 3.1 < 0.12 ? 0.1 : 1;
  const beak = talking ? Math.abs(Math.sin(t * 14)) * 14 : 0;
  const brow = talking ? Math.abs(Math.sin(t * 5)) * 6 : 0;
  const x = side === 1 ? 40 : 1040;
  return `<g transform="translate(${x} ${(BAND_TOP + 10 + bob + rise).toFixed(1)}) rotate(${tilt * side}) scale(${1.35 * side} 1.35)">
    <path d="M60 220 L70 10 C130 -40 50 -120 85 -190 C105 -235 165 -238 178 -200" fill="none" stroke="${SWAN_LINE}" stroke-width="48" stroke-linecap="round"/>
    <path d="M60 220 L70 10 C130 -40 50 -120 85 -190 C105 -235 165 -238 178 -200" fill="none" stroke="#fff" stroke-width="40" stroke-linecap="round"/>
    <g transform="rotate(-28 92 -50)">
      <rect x="62" y="-66" width="64" height="30" rx="10" fill="#d52b1e"/>
      <rect x="62" y="-56" width="64" height="9" fill="#fff"/>
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

/** Soft waves of the lake, just above the band. */
function lake(t) {
  return [0, 1, 2]
    .map((k) => {
      const y = BAND_TOP - 150 + k * 50;
      let d = `M0 ${y}`;
      for (let x = 0; x <= W; x += 30) d += ` L${x} ${(y + Math.sin(x / 90 + t * 1.6 + k) * 12).toFixed(1)}`;
      return `<path d="${d} L${W} ${BAND_TOP} L0 ${BAND_TOP} Z" fill="#fff" opacity="${(0.1 + k * 0.06).toFixed(2)}"/>`;
    })
    .join('');
}

/** A rounded label ("pill") with the kicker. */
function pill(text, x, y, { fill = '#fff', colour = STYLE.top, size = 30 } = {}) {
  const w = Math.round(text.length * size * 0.78 + size * 1.6);
  return `<rect x="${x}" y="${y}" width="${w}" height="${size * 1.9}" rx="${size * 0.95}" fill="${fill}"/>
    <text x="${x + size * 0.8}" y="${y + size * 1.3}" font-family="Inter" font-size="${size}" font-weight="800" letter-spacing="2" fill="${colour}">${esc(text.toUpperCase())}</text>`;
}

/** Top of every frame: story-style progress bars, the kicker in a pill and the title in white. */
function header(kicker, title) {
  const lines = wrap(title, 22).slice(0, 2);
  const svg = (progress) => `${progress}
    ${pill(kicker, 60, 112)}
    ${lines.map((l, i) => `<text x="60" y="${262 + i * 78}" font-family="Inter" font-size="68" font-weight="800" fill="#fff">${esc(l)}</text>`).join('')}`;
  return { svg, bottom: 262 + (lines.length - 1) * 78 + 40 };
}

/** One thin bar per scene, filled as the video goes on (as in Instagram stories). */
function progressBars(t) {
  const gap = 10;
  const w = (W - 120 - gap * (scenes.length - 1)) / scenes.length;
  return scenes
    .map((sc, i) => {
      const x = 60 + i * (w + gap);
      const fill = clamp01((t - sc.start) / sc.d);
      return `<rect x="${x.toFixed(1)}" y="56" width="${w.toFixed(1)}" height="8" rx="4" fill="#fff" opacity=".35"/>
        <rect x="${x.toFixed(1)}" y="56" width="${(w * fill).toFixed(1)}" height="8" rx="4" fill="#fff"/>`;
    })
    .join('');
}

const BIG = { size: 66, lh: 80, max: 21 };
const SMALL = { size: 48, lh: 60, max: 30 };

/** The scene's speech bubble; the words appear one by one while Gaston speaks. */
function bubble(scene, sceneT, last, side) {
  const hx = headX(side) + side * 40;
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
        ? `<text x="540" y="${y - 18}" text-anchor="middle" font-family="Inter" font-size="${BIG.size}" font-weight="800" fill="${INK}">${esc(visible)}</text>`
        : `<text x="540" y="${y - 14}" text-anchor="middle" font-family="Inter" font-size="${SMALL.size}" font-weight="${link ? '800' : '500'}" fill="${link ? STYLE.top : SOFT}">${esc(visible)}</text>`;
    })
    .join('');
  const s = backOut(sceneT / 0.45);
  const fade = last ? 1 : 1 - easeOut((sceneT - (scene.d - 0.3)) / 0.3);
  const bottom = top + h;
  return {
    top,
    talking: sceneT > 0.3 && sceneT < 0.3 + speak,
    svg: `<g opacity="${fade.toFixed(3)}" transform="translate(540 ${bottom}) scale(${s.toFixed(4)}) translate(-540 ${-bottom})">
    <rect x="74" y="${top + 14}" width="932" height="${h}" rx="44" fill="#000" opacity=".16" filter="url(#soft)"/>
    <rect x="70" y="${top}" width="940" height="${h}" rx="44" fill="#fff"/>
    <rect x="70" y="${top}" width="14" height="${h}" rx="7" fill="${STYLE.mid}"/>
    <path d="M${hx - side * 50} ${bottom - 2} L${hx} ${bottom + 90} L${hx + side * 30} ${bottom - 2} Z" fill="#fff"/>
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
// the cover: what the Instagram grid shows. Big title, the day's photo if there is one, a teaser line
const firstPhoto = scenes.find((sc) => sc.photo);
scenes.unshift({ cover: true, photo: firstPhoto && firstPhoto.photo, credit: firstPhoto && firstPhoto.credit });

// timing: a photo stays 3.5 s, a bubble long enough to be read (and spoken)
let acc = 0;
for (const sc of scenes) {
  const chars = `${sc.big || ''} ${sc.small || ''}`.length;
  sc.d = sc.cover ? 2.4 : sc.photo ? 3.5 : Math.min(6.5, Math.max(3, 1.3 + chars * 0.055));
  sc.start = acc;
  acc += sc.d;
}
const TOTAL = acc;

// photos are resized once, whole, into the space between the header and Gaston
// shown whole, as a print with a white border, slightly tilted
for (const sc of scenes.filter((s) => s.photo)) {
  const img = sharp(path.join(root, 'public', sc.photo));
  const meta = await img.metadata();
  const boxTop = sc.cover ? 640 : head.bottom + 50;
  const boxH = (sc.cover ? 1280 : 1220) - boxTop;
  const maxW = sc.cover ? 900 : 900;
  let pw = maxW;
  let ph = Math.round((meta.height / meta.width) * pw);
  if (ph > boxH) {
    ph = boxH;
    pw = Math.round((meta.width / meta.height) * ph);
  }
  const b = 18;
  const print = await sharp({ create: { width: pw + 2 * b, height: ph + 2 * b, channels: 4, background: '#ffffff' } })
    .composite([{ input: await img.resize(pw, ph).png().toBuffer(), left: b, top: b }])
    .png()
    .toBuffer();
  const angle = sc.cover ? (FACING === 1 ? -3 : 3) : FACING === 1 ? 2 : -2;
  const tilted = await sharp(print).rotate(angle, { background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  const tm = await sharp(tilted).metadata();
  sc.layer = { input: tilted, left: Math.round((W - tm.width) / 2), top: boxTop + Math.round((boxH - tm.height) / 2) };
  sc.creditY = boxTop + Math.round((boxH + tm.height) / 2) + 46;
}

/** The cover's text: the theme in a pill, then the title, big. */
function coverText() {
  const lines = wrap(title, 16).slice(0, 3);
  const size = lines.length > 2 ? 92 : 108;
  const top = firstPhoto ? 250 : 380;
  // without a photo, a first line of the story, so that each cover says something of its own
  const story = scenes.find((sc) => !sc.cover && !sc.photo && sc.big !== HELLO);
  const teaser = story ? wrap(story.big && story.big !== title ? story.big : story.small, 26).slice(0, 3) : [];
  const ty = top + 60 + lines.length * (size + 8);
  return `${pill(kicker, 60, top - 120, { size: 34 })}
    ${lines.map((l, i) => `<text x="60" y="${top + 40 + i * (size + 8)}" font-family="Inter" font-size="${size}" font-weight="800" fill="#fff">${esc(l)}</text>`).join('')}
    ${firstPhoto ? '' : `<rect x="60" y="${ty - 46}" width="10" height="${teaser.length * 62 + 10}" rx="5" fill="${STYLE.accent}"/>
    ${teaser.map((l, i) => `<text x="96" y="${ty + i * 62}" font-family="Inter" font-size="50" font-weight="600" fill="#fff">${esc(l)}</text>`).join('')}`}`;
}

function frame(t) {
  const i = scenes.findLastIndex((s) => t >= s.start);
  const scene = scenes[Math.max(0, i)];
  const sceneT = t - scene.start;
  const side = sideOf(Math.max(0, i));
  const b = scene.photo || scene.cover ? null : bubble(scene, sceneT, scene === scenes.at(-1), side);
  if (b && b.top < head.bottom + 20) throw new Error(`Bubble too tall on ${day}: ${scene.big || ''} ${scene.small || ''}`);
  const sparkle = [0, 1, 2]
    .map((k) => {
      const a = (t * 1.3 + k * 2.1) % 3;
      return `<text x="${150 + k * 360}" y="${(1000 - a * 60).toFixed(1)}" font-family="DejaVu Sans" font-size="44" fill="#fff" opacity="${Math.max(0, 0.6 - Math.abs(a - 1.5) / 3).toFixed(3)}">✦</text>`;
    })
    .join('');
  const credit = scene.photo ? `<text x="540" y="${scene.creditY}" text-anchor="middle" font-family="Inter" font-size="26" font-weight="500" fill="#fff" opacity=".9">${esc(scene.credit)}</text>` : '';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${STYLE.top}"/><stop offset=".42" stop-color="${STYLE.mid}"/><stop offset=".62" stop-color="${STYLE.bg}"/>
      </linearGradient>
      <filter id="soft" x="-10%" y="-10%" width="120%" height="140%"><feGaussianBlur stdDeviation="14"/></filter>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#bg)"/>
    <circle cx="${FACING === 1 ? 930 : 150}" cy="220" r="260" fill="#fff" opacity=".06"/>
    <circle cx="${FACING === 1 ? 140 : 940}" cy="760" r="180" fill="#fff" opacity=".05"/>
    ${scene.cover ? `${progressBars(t)}${coverText()}` : head.svg(progressBars(t))}
    ${sparkle}
    ${lake(t)}
    ${b ? b.svg : credit}
    ${gaston(t, b ? b.talking : false, sceneT, side)}
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

// the Morges.info sound logo at the start (Instagram's voice goes on top)
const wav = path.join(outDir, 'musique.wav');
music(TOTAL, wav);
execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', silent, '-i', wav, '-map', '0:v', '-map', '1:a',
  '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k', '-shortest', '-movflags', '+faststart', video]);
rmSync(silent);
rmSync(wav);

const voice = scenes
  .filter((s) => !s.photo && !s.cover)
  .map((s) => [s.big && (/[.!?:]$/.test(s.big) ? s.big : `${s.big}.`), s.small].filter(Boolean).join(' '))
  .join(' ')
  .replace(/morges\.info(\/[\w/-]*)?/g, 'Morges point info')
  .replace(/\u00a0/g, ' ');
writeFileSync(path.join(outDir, 'legende.txt'), `${caption}\n`);
writeFileSync(path.join(outDir, 'voix.txt'), `${voice}\n`);
console.log(video);
console.log(path.join(outDir, 'legende.txt'));
console.log(path.join(outDir, 'voix.txt'));
