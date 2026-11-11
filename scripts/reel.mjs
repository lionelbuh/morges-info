/**
 * Daily Instagram video (Reel, 1080×1920, no sound) and its caption, made from the site's data.
 *
 * Usage: node scripts/reel.mjs [YYYY-MM-DD]   (default: today in Morges)
 * Output: reels/out/<date>/morges-info-<date>.mp4 and legende.txt (git-ignored). Needs ffmpeg.
 *
 * The theme follows the day of the week:
 *   Mon, Wed, Sun  Morges hier      an old photograph and its story
 *   Tue, Thu       Le saviez-vous ? a fact about a place of Morges
 *   Fri            Ce week-end à Morges (the calendar's events from Friday to Sunday)
 *   Sat            Découvrir Morges (one theme of the page, in turn)
 *
 * Photos: only public-domain photographs are used. The others were published on the site with their
 * authors' agreement, or under licences that forbid changes: they need a separate yes for Instagram.
 * Slides without a usable photo are typographic. Photos are always shown whole, never cropped.
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { publishedViewpoints, shownPhotos } from '../src/data/viewpoints.js';
import { PLACES } from '../src/data/places.js';
import { upcomingEvents, eventsOnDay, todayInMorges } from '../src/data/events.js';
import { DISCOVER_THEMES } from '../src/data/discover.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const W = 1080;
const H = 1920;
const PAPER = '#f3eee4';
const INK = '#1c1b19';
const RED = '#b3121a';
const SOFT = '#57524a';
const HASHTAGS = '#Morges #MorgesInfo #Vaud #LacLéman #Suisse';

const day = process.argv[2] || todayInMorges();
const dayNumber = Math.floor(Date.parse(`${day}T00:00:00Z`) / 86400000);
const weekday = new Date(`${day}T12:00:00Z`).getUTCDay(); // 0 = Sunday

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const pick = (list, salt = 0) => list[(((dayNumber + salt) % list.length) + list.length) % list.length];

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

function wrap(text, max) {
  const lines = [];
  let line = '';
  for (const word of text.split(/\s+/)) {
    if ((`${line} ${word}`).trim().length > max && line) {
      lines.push(line);
      line = word;
    } else line = `${line} ${word}`.trim();
  }
  if (line) lines.push(line);
  return lines;
}
const tspans = (lines, x, y, lh) => lines.map((l, i) => `<tspan x="${x}" y="${y + i * lh}">${esc(l)}</tspan>`).join('');

const formatDay = (iso) =>
  new Intl.DateTimeFormat('fr-CH', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' }).format(new Date(`${iso}T12:00:00Z`));

/** Photographs that may be used outside the site without asking: public domain only. */
const freePhotos = publishedViewpoints()
  .map((vp) => ({ vp, photo: shownPhotos(vp).then }))
  .filter(({ photo }) => photo && photo.rights.status === 'public-domain');

/** The site's emblem (the arms of Morges, as in the header) above its name and motto, at the foot of every slide. */
const LOGO = `<g transform="translate(490 1560)">
    <path d="M0 0h100v50H0z" fill="#fff"/><path d="M0 50h100v50H0z" fill="#d52b1e"/>
    <path d="M0 18Q12.5 12.5 25 18T50 18T75 18T100 18V32Q87.5 37.5 75 32T50 32T25 32T0 32Z" fill="#d52b1e"/>
    <path d="M0 68Q12.5 62.5 25 68T50 68T75 68T100 68V82Q87.5 87.5 75 82T50 82T25 82T0 82Z" fill="#fff"/>
    <path d="M1 1h98v98H1z" fill="none" stroke="${INK}" stroke-opacity=".35" stroke-width="2"/>
  </g>
  <text x="540" y="1760" text-anchor="middle" font-family="DejaVu Serif" font-size="64" font-weight="bold" fill="${INK}">Morges<tspan fill="${RED}" font-style="italic">.info</tspan></text>
  <text x="540" y="1812" text-anchor="middle" font-family="Inter" font-size="26" font-weight="bold" letter-spacing="5" fill="${SOFT}">LA GAZETTE INDÉPENDANTE DE MORGES</text>`;

/** One slide (PNG): kicker, title, optional photo (whole), optional body and lines. */
async function slide(file, { kicker, title, photo, credit, body, lines = [] }) {
  const layers = [];
  let y = 330 + (wrap(title, 22).length - 1) * 88 + 90;
  // the body's height is known first, so the photo takes only the space left above the logo
  const bodyLinesFirst = body ? wrap(body, photo ? 36 : 30) : [];
  const reserved = (credit ? 70 : 0) + (bodyLinesFirst.length ? bodyLinesFirst.length * 62 + 60 : 0) + lines.length * 150;
  if (photo) {
    const img = sharp(path.join(root, 'public', photo));
    const meta = await img.metadata();
    let pw = 960;
    let ph = Math.round((meta.height / meta.width) * pw);
    const room = Math.max(320, 1480 - y - 50 - reserved);
    if (ph > Math.min(760, room)) {
      ph = Math.min(760, room);
      pw = Math.round((meta.width / meta.height) * ph);
    }
    layers.push({ input: await img.resize(pw, ph).png().toBuffer(), left: Math.round((W - pw) / 2), top: y });
    y += ph + 50;
  }
  const creditSvg = credit ? `<text x="60" y="${y}" font-family="Inter" font-size="26" fill="${SOFT}">${esc(credit)}</text>` : '';
  if (credit) y += 70;
  const bodyLines = body ? wrap(body, photo ? 36 : 30) : [];
  const bodySize = photo ? 44 : 52;
  const bodySvg = bodyLines.length
    ? `<text font-family="Inter" font-size="${bodySize}" fill="${INK}">${tspans(bodyLines, 60, y + bodySize, bodySize + 18)}</text>`
    : '';
  y += bodyLines.length * (bodySize + 18) + (bodyLines.length ? 60 : 0);
  const listSvg = lines
    .map(
      (l, i) => `<text x="60" y="${y + i * 150 + 40}" font-family="Inter" font-size="34" font-weight="bold" fill="${RED}">${esc(l.when)}</text>
      <text font-family="DejaVu Serif" font-size="44" font-weight="bold" fill="${INK}">${tspans(wrap(l.what, 34).slice(0, 2), 60, y + i * 150 + 92, 52)}</text>`,
    )
    .join('');
  // text-only slides: the block is centred in the space above the logo
  const shift = photo ? 0 : Math.max(0, Math.round((1450 - y) / 2) - 60);
  layers.forEach((layer) => (layer.top += shift));
  const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="${PAPER}"/>
    <rect x="60" y="120" width="960" height="6" fill="${INK}"/>
    <g transform="translate(0 ${shift})">
      <text x="60" y="210" font-family="Inter" font-size="34" font-weight="bold" letter-spacing="4" fill="${RED}">${esc(kicker.toUpperCase())}</text>
      <text font-family="DejaVu Serif" font-size="74" font-weight="bold" fill="${INK}">${tspans(wrap(title, 22), 60, 320, 88)}</text>
      ${creditSvg}${bodySvg}${listSvg}
    </g>
    ${LOGO}
  </svg>`;
  await sharp(Buffer.from(svg)).composite(layers).png().toFile(file);
}

/** The day's content: slides and caption. */
function content() {
  // Friday: the weekend's events
  if (weekday === 5) {
    const days = [0, 1, 2].map((i) => new Date(Date.parse(`${day}T12:00:00Z`) + i * 86400000).toISOString().slice(0, 10));
    const events = upcomingEvents(undefined, day);
    const weekend = days.flatMap((d) => eventsOnDay(events, d).map((ev) => ({ d, ev })));
    const seen = new Set();
    const items = weekend.filter(({ ev }) => !seen.has(ev.id) && seen.add(ev.id)).slice(0, 5);
    const list = (items.length ? items : events.slice(0, 4).map((ev) => ({ d: ev.startDate, ev }))).map(({ d, ev }) => ({
      when: formatDay(d),
      what: ev.title.fr,
    }));
    const title = items.length ? 'Ce week-end à Morges' : 'Bientôt à Morges';
    return {
      slides: [
        { kicker: 'Agenda', title, lines: list },
        { kicker: 'Agenda', title: 'Tous les événements, horaires et lieux', body: 'Le calendrier complet sur morges.info/vie-locale' },
      ],
      caption: `${title} 📅\n\n${list.map((l) => `• ${l.when} : ${l.what}`).join('\n')}\n\nHoraires, lieux et détails : morges.info/vie-locale\n\n${HASHTAGS} #AgendaMorges`,
    };
  }
  // Saturday: a theme of Découvrir Morges
  if (weekday === 6) {
    const theme = pick(DISCOVER_THEMES);
    const free = freePhotos.find(({ photo }) => photo.image.src === theme.photo.src);
    return {
      slides: [
        { kicker: 'Découvrir Morges', title: theme.title.fr, photo: free && free.photo.image.src, credit: free && `Photo : ${free.photo.rights.credit}, domaine public` },
        { kicker: 'Découvrir Morges', title: theme.title.fr, body: short(theme.text.fr, 260) },
        { kicker: 'Découvrir Morges', title: 'Six idées pour découvrir Morges', body: 'morges.info/decouvrir-morges' },
      ],
      caption: `${theme.title.fr} ✨\n\n${theme.text.fr}\n\nToutes les idées : morges.info/decouvrir-morges\n\n${HASHTAGS} #DécouvrirMorges`,
    };
  }
  // Tuesday and Thursday: a fact about a place
  if (weekday === 2 || weekday === 4) {
    const place = pick(PLACES, weekday);
    const fact = short(place.description.fr);
    const free = freePhotos.find(({ vp }) => vp.placeId === place.id);
    return {
      slides: [
        { kicker: 'Le saviez-vous ?', title: place.name.fr, photo: free && free.photo.image.src, credit: free && `Photo : ${free.photo.rights.credit}, domaine public`, body: free ? undefined : fact },
        ...(free ? [{ kicker: 'Le saviez-vous ?', title: place.name.fr, body: fact }] : []),
        { kicker: 'Lieux de Morges', title: 'Plus de lieux, sur la carte', body: `morges.info/lieux/${place.id}` },
      ],
      caption: `Le saviez-vous ? ${place.name.fr} 💡\n\n${fact}\n\nÀ lire sur morges.info/lieux/${place.id}\n\n${HASHTAGS}`,
    };
  }
  // Monday, Wednesday and Sunday: an old photograph
  const { vp, photo } = pick(freePhotos, weekday);
  const year = photo.date.value.slice(0, 4);
  const when = photo.date.precision === 'circa' ? `vers ${year}` : year;
  const credit = `Photo : ${photo.rights.credit}, domaine public`;
  return {
    slides: [
      { kicker: 'Morges hier', title: `${vp.title.fr}, ${when}`, photo: photo.image.src, credit },
      { kicker: 'Morges hier', title: vp.title.fr, photo: photo.image.src, credit, body: short((photo.caption || vp.title).fr, 200) },
      { kicker: 'Morges hier et aujourd’hui', title: 'Comparez avec Morges aujourd’hui', body: 'La carte photo sur morges.info/photos' },
    ],
    caption: `Morges hier : ${vp.title.fr}, ${when} 📸\n\n${(photo.caption || vp.title).fr}\n\nD’autres photos anciennes, sur la carte : morges.info/photos/${vp.id}\n\n${credit}\n\n${HASHTAGS} #MorgesHier #PhotoAncienne`,
  };
}

const outDir = path.join(root, 'reels', 'out', day);
mkdirSync(outDir, { recursive: true });
const { slides, caption } = content();
const files = [];
for (const [i, s] of slides.entries()) {
  const file = path.join(outDir, `slide-${i + 1}.png`);
  await slide(file, s);
  files.push(file);
}
// 4.5 s per slide, 0.7 s fades
const D = 4.5;
const F = 0.7;
const inputs = files.flatMap((f) => ['-loop', '1', '-t', String(D), '-i', f]);
let chain = '';
let last = '[0]';
files.slice(1).forEach((_, i) => {
  const label = `[x${i}]`;
  chain += `${last}[${i + 1}]xfade=transition=fade:duration=${F}:offset=${((i + 1) * (D - F)).toFixed(2)}${label};`;
  last = label;
});
const video = path.join(outDir, `morges-info-${day}.mp4`);
execFileSync('ffmpeg', [
  '-loglevel', 'error', '-y', ...inputs,
  '-filter_complex', `${chain}${last}format=yuv420p,fps=30[v]`,
  '-map', '[v]', '-c:v', 'libx264', '-crf', '22', '-movflags', '+faststart', video,
]);
writeFileSync(path.join(outDir, 'legende.txt'), `${caption}\n`);
console.log(video);
console.log(path.join(outDir, 'legende.txt'));
