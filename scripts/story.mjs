/**
 * Instagram story of the Advent calendar (1080×1920 image): Gaston in his Christmas hat, the door of
 * the day and its hook, to send readers to morges.info/calendrier-avent/#case-<n>. The content of the
 * door itself stays on the site.
 *
 * Usage: node scripts/story.mjs [YYYY-MM-DD]   (default: today in Morges; 1 to 24 December only)
 * Output in reels/out/stories/<date>/ (git-ignored): story-<date>.png and texte.txt (the link to add).
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { setLang, t } from '../src/i18n/index.js';
import { todayInMorges } from '../src/data/events.js';
import { ADVENT_DOORS, ADVENT_YEAR } from '../src/data/advent.js';
import { gastonSvg } from '../src/site/advent.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const W = 1080;
const H = 1920;
const INK = '#1c1b19';
const GOLD = '#e7b74a';
const PAPER = '#f3eee4';
const COLOURS = ['#b3121a', '#1f5e3b', '#2b4f7a', '#7a2b4f'];

setLang('fr', { persist: false });
const day = process.argv[2] || todayInMorges();
const [year, month, date] = day.split('-').map(Number);
const door = year === ADVENT_YEAR && month === 12 ? ADVENT_DOORS.find((d) => d.day === date) : null;
if (!door) {
  console.log(`No Advent door on ${day}: stories run from 1 to 24 December ${ADVENT_YEAR}.`);
  process.exit(0);
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
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

const bg = COLOURS[door.day % COLOURS.length];
// snowflakes, always in the same places for a given day
let seed = door.day * 9301;
const rand = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
const snow = Array.from({ length: 70 }, () => `<circle cx="${(rand() * W).toFixed(0)}" cy="${(rand() * H).toFixed(0)}" r="${(2 + rand() * 5).toFixed(1)}" fill="#fff" opacity="${(0.25 + rand() * 0.5).toFixed(2)}"/>`).join('');
const hook = wrap(door.hook.fr, 26).slice(0, 6);
const kind = t(`advent.kinds.${door.kind}`);
const gaston = gastonSvg().replace('<svg class="advent-gaston"', '<svg x="320" y="1250" width="440" height="375"');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect width="${W}" height="${H}" fill="${bg}"/>
  ${snow}
  <text x="540" y="210" text-anchor="middle" font-family="Inter" font-size="40" font-weight="bold" letter-spacing="6" fill="${GOLD}">CALENDRIER DE L’AVENT</text>
  <text x="540" y="270" text-anchor="middle" font-family="Inter" font-size="34" fill="#fff" opacity=".9">Morges.info</text>
  <rect x="300" y="330" width="480" height="400" rx="34" fill="${PAPER}" stroke="${GOLD}" stroke-width="10"/>
  <text x="540" y="410" text-anchor="middle" font-family="Inter" font-size="40" font-weight="bold" letter-spacing="4" fill="${bg}">CASE</text>
  <text x="540" y="640" text-anchor="middle" font-family="DejaVu Serif" font-size="230" font-weight="bold" fill="${bg}">${door.day}</text>
  <text x="540" y="830" text-anchor="middle" font-family="Inter" font-size="40" font-weight="bold" letter-spacing="3" fill="${GOLD}">${esc(kind.toUpperCase())}</text>
  ${hook.map((l, i) => `<text x="540" y="${920 + i * 64}" text-anchor="middle" font-family="DejaVu Serif" font-size="54" font-weight="bold" fill="#fff">${esc(l)}</text>`).join('')}
  ${gaston}
  <rect x="190" y="1640" width="700" height="110" rx="55" fill="#fff"/>
  <text x="540" y="1710" text-anchor="middle" font-family="Inter" font-size="42" font-weight="bold" fill="${INK}">Ouvrez la case sur morges.info</text>
</svg>`;

const outDir = path.join(root, 'reels', 'out', 'stories', day);
mkdirSync(outDir, { recursive: true });
const file = path.join(outDir, `story-${day}.png`);
await sharp(Buffer.from(svg)).png().toFile(file);
const link = `https://morges.info/calendrier-avent/#case-${door.day}`;
writeFileSync(
  path.join(outDir, 'texte.txt'),
  `Story du ${door.day} décembre : case ${door.day} (${kind})\nLien à ajouter (autocollant « Lien ») : ${link}\nTexte du lien : Ouvrir la case ${door.day}\n`,
);
console.log(file);
console.log(link);
