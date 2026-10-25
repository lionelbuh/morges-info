/**
 * The photo map: points from which a photograph of Morges was taken ("points de vue").
 *
 * Each viewpoint holds the old photo (`then`), the current photo (`now`), or both — often only the old
 * one at first, until a reader sends today's view taken from the same spot. With both, the site shows a
 * before/after comparison; with one, it asks readers for the missing photo.
 *
 * Every photo follows the archive record (archive.js): date with precision, author, source, rights and
 * verification. An image is published only when rights are cleared and verification is "verified".
 * Never add generated images or pictures copied from the internet. How to add photos: docs/PHOTO_MAP.md.
 *
 * @typedef {Object} Viewpoint
 * @property {string} id                 "vue-…" (lowercase, digits, hyphens); also the page address /photos/<id>/
 * @property {Record<'fr'|'en'|'de'|'it', string>} title     short title, e.g. "Grand-Rue, vers l'est"
 * @property {Record<'fr'|'en'|'de'|'it', string>} location  street or place, in words
 * @property {{lat: number, lng: number}} coordinates         where the photographer stood
 * @property {{ status: string, sources: object[], note?: string }} geo   as for places (places.js)
 * @property {string=} placeId          nearby place of the map, if any
 * @property {import('./archive.js').ArchivePhoto|null} then  old photo (placeId not needed)
 * @property {import('./archive.js').ArchivePhoto|null} now   current photo
 */
import { validateArchivePhoto, publishablePhotos } from './archive.js';
import { validateText, validateSources } from './schema.js';

/** @type {Viewpoint[]} */
export const VIEWPOINTS = [
  {
    id: 'vue-parc-independance-kiosque',
    title: {
      fr: 'Le kiosque à musique du parc de l’Indépendance',
      en: 'The bandstand in the Parc de l’Indépendance',
      de: 'Der Musikpavillon im Parc de l’Indépendance',
      it: 'Il chiosco della musica nel Parc de l’Indépendance',
    },
    location: {
      fr: 'Parc de l’Indépendance, au bord du lac',
      en: 'Parc de l’Indépendance, on the lakeshore',
      de: 'Parc de l’Indépendance, am Seeufer',
      it: 'Parc de l’Indépendance, sulla riva del lago',
    },
    coordinates: { lat: 46.50569818581667, lng: 6.495344864861067 },
    geo: {
      status: 'team',
      sources: [{ label: 'Morges.info — point de prise de vue placé sur la carte le 25.10.2026' }],
      note: 'Approximate spot where the photographer stood, facing the bandstand.',
    },
    placeId: 'parc-independance',
    then: {
      id: 'parc-independance-kiosque-1902',
      title: {
        fr: 'Morges, parc de l’Indépendance : le kiosque à musique, carte postale de 1902',
        en: 'Morges, Parc de l’Indépendance: the bandstand, postcard from 1902',
        de: 'Morges, Parc de l’Indépendance: der Musikpavillon, Postkarte von 1902',
        it: 'Morges, Parc de l’Indépendance: il chiosco della musica, cartolina del 1902',
      },
      caption: {
        fr: 'Le kiosque, élevé en 1897 d’après les plans du serrurier morgien Auguste Badan. Seul son socle fut conservé en 1961 ; il a été reconstruit en 1986. Carte postale envoyée de Morges le 3 septembre 1902.',
        en: 'The bandstand, built in 1897 to plans by the Morges locksmith Auguste Badan. Only its base was kept in 1961; it was rebuilt in 1986. Postcard sent from Morges on 3 September 1902.',
        de: 'Der Pavillon wurde 1897 nach Plänen des Morger Schlossers Auguste Badan errichtet. 1961 blieb nur der Sockel erhalten; 1986 wurde er wieder aufgebaut. Postkarte, am 3. September 1902 in Morges abgeschickt.',
        it: 'Il chiosco, eretto nel 1897 su progetto del fabbro morgiense Auguste Badan. Nel 1961 se ne conservò solo lo zoccolo; è stato ricostruito nel 1986. Cartolina spedita da Morges il 3 settembre 1902.',
      },
      // The card was posted on 3 September 1902; the photograph itself was taken between 1897 and then.
      date: { value: '1902', precision: 'circa' },
      creator: 'Edouard Staub, éditeur, Morges',
      source: { institution: 'notreHistoire.ch', url: 'https://notrehistoire.ch/documents/01k81dkz4re35har48smt9rdxp' },
      rights: {
        status: 'open-licence',
        licence: 'CC BY-NC-ND 4.0',
        licenceUrl: 'https://creativecommons.org/licenses/by-nc-nd/4.0/deed.fr',
        holder: 'Philippe Chappuis (collection personnelle)',
        credit: 'Collection Philippe Chappuis',
      },
      verification: {
        status: 'verified',
        verifiedBy: 'Morges.info',
        verifiedAt: '2026-10-25',
        notes:
          'Licence read on the notreHistoire.ch page. Non-commercial (NC): remove or ask permission before any advertising or sponsorship on this page. No derivatives (ND): shown whole and uncropped, only resized.',
      },
      image: { src: '/images/photos/parc-independance-kiosque-1902.webp', width: 1600, height: 1044 },
    },
    now: null,
  },
];

/** Photos of a viewpoint that may be shown ({ then, now }, each null when missing or not yet cleared). */
export function shownPhotos(vp) {
  const ok = (photo) => (photo && publishablePhotos([photo], { requirePlace: false }).length ? photo : null);
  return { then: ok(vp.then), now: ok(vp.now) };
}

/** Viewpoints with at least one photo that may be shown. */
export function publishedViewpoints(list = VIEWPOINTS) {
  return list.filter((vp) => {
    const { then, now } = shownPhotos(vp);
    return then || now;
  });
}

export function getViewpoint(id, list = VIEWPOINTS) {
  return list.find((vp) => vp.id === id);
}

export function validateViewpoint(vp) {
  const p = `viewpoint(${vp && vp.id})`;
  const errors = [];
  if (!vp || !/^vue-[a-z0-9-]+$/.test(vp.id || '')) errors.push(`${p}.id must look like "vue-grand-rue-est"`);
  errors.push(...validateText(vp && vp.title, `${p}.title`, { allLanguages: true }));
  errors.push(...validateText(vp && vp.location, `${p}.location`, { allLanguages: true }));
  const c = vp && vp.coordinates;
  if (!c || !(c.lat > 46.49 && c.lat < 46.53 && c.lng > 6.46 && c.lng < 6.53)) errors.push(`${p}.coordinates must be in Morges`);
  errors.push(...validateSources(vp && vp.geo && vp.geo.sources, `${p}.geo.sources`));
  if (!vp || (!vp.then && !vp.now)) errors.push(`${p} needs a "then" or a "now" photo`);
  for (const role of ['then', 'now']) {
    if (vp && vp[role]) errors.push(...validateArchivePhoto(vp[role], { requirePlace: false }).map((err) => `${p}.${role}: ${err}`));
  }
  return errors;
}
