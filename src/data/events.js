import { validateText, validateSources, isIsoDate, validatePhoto } from './schema.js';

/**
 * Local events — only from official or otherwise reliable sources, each with
 * its source and the date it was last checked. `summary` (optional, four
 * languages) is a short description written by Morges.info. Past events disappear
 * automatically from listings (see upcomingEvents). No automated feed.
 */
export const EVENTS = [
  {
    id: 'beausobre-zip-zap-circus-2026',
    title: {
      fr: 'Zip Zap Circus',
      en: 'Zip Zap Circus',
      de: 'Zip Zap Circus',
      it: 'Zip Zap Circus',
    },
    startDate: '2026-11-04',
    endDate: '2026-11-04',
    placeId: 'beausobre',
    hours: null,
    summary: {
      fr: 'Cirque contemporain de la troupe sud-africaine Zip Zap, au Théâtre de Beausobre.',
      en: 'Contemporary circus by the South African troupe Zip Zap, at the Théâtre de Beausobre.',
      de: 'Zeitgenössischer Zirkus der südafrikanischen Truppe Zip Zap im Théâtre de Beausobre.',
      it: 'Circo contemporaneo della compagnia sudafricana Zip Zap, al Théâtre de Beausobre.',
    },
    sources: [
      { label: 'Théâtre de Beausobre — programme', url: 'https://beausobre.ch/' },
    ],
    lastVerified: '2026-10-28',
  },
  {
    id: 'david-chante-renaud-2026',
    title: {
      fr: 'Concert : David chante Renaud',
      en: 'Concert: David sings Renaud',
      de: 'Konzert: David singt Renaud',
      it: 'Concerto: David canta Renaud',
    },
    startDate: '2026-11-06',
    endDate: '2026-11-06',
    startTime: '20:00',
    endTime: '22:00',
    placeId: null,
    venue: { name: 'Lykke Concept Store', address: 'Grand-Rue 89, 1110 Morges' },
    hours: {
      fr: 'Vendredi à 20 h, pendant environ deux heures. Entrée libre, chapeau à la sortie.',
      en: 'Friday at 8 pm, for about two hours. Free entry, with a collection at the end.',
      de: 'Freitag um 20 Uhr, etwa zwei Stunden. Eintritt frei, Kollekte am Ausgang.',
      it: 'Venerdì alle 20, per circa due ore. Ingresso libero, offerta all’uscita.',
    },
    summary: {
      fr: 'Depuis 2003, David reprend les chansons de Renaud, des plus connues aux plus rares, sans imitation et avec sincérité. Accompagné depuis 2018 par le guitariste Jonathan, en acoustique.',
      en: 'Since 2003, David has been singing Renaud’s songs, from the best known to the rarest, sincerely and without imitation. Accompanied since 2018 by the guitarist Jonathan, in an acoustic set.',
      de: 'Seit 2003 singt David die Lieder von Renaud, von den bekanntesten bis zu den seltensten, ohne Imitation und mit viel Aufrichtigkeit. Seit 2018 begleitet ihn der Gitarrist Jonathan, akustisch.',
      it: 'Dal 2003 David reinterpreta le canzoni di Renaud, dalle più note alle più rare, senza imitazione e con sincerità. Dal 2018 lo accompagna il chitarrista Jonathan, in acustico.',
    },
    photo: {
      src: '/images/events/david-chante-renaud.webp',
      width: 960,
      height: 640,
      alt: {
        fr: 'David et le guitariste Jonathan, debout devant des wagons de marchandises tagués',
        en: 'David and the guitarist Jonathan, standing in front of graffitied freight wagons',
        de: 'David und der Gitarrist Jonathan vor besprayten Güterwagen',
        it: 'David e il chitarrista Jonathan, in piedi davanti a vagoni merci coperti di graffiti',
      },
      credit: 'David chante Renaud',
      licence: 'Photo de presse transmise à Morges.info pour annoncer le concert (05.11.2026)',
    },
    sources: [{ label: 'Lykke Concept Store — événements', url: 'https://lykke-conceptstore.ch/events' }],
    lastVerified: '2026-11-05',
  },
  {
    id: 'festival-des-sports-patinoire-2026',
    title: {
      fr: 'Festival des Sports, édition Patinoire',
      en: 'Sports Festival, ice-rink edition',
      de: 'Sportfestival, Ausgabe Eisbahn',
      it: 'Festival dello sport, edizione pista di pattinaggio',
    },
    startDate: '2026-11-08',
    endDate: '2026-11-08',
    placeId: 'patinoire-eaux-minerales',
    hours: null,
    summary: {
      fr: 'Une journée d’animations sportives à la patinoire des Eaux-Minérales.',
      en: 'A day of sports activities at the Eaux-Minérales ice rink.',
      de: 'Ein Tag mit Sportangeboten in der Eisbahn Eaux-Minérales.',
      it: 'Una giornata di attività sportive alla pista di pattinaggio delle Eaux-Minérales.',
    },
    sources: [
      { label: 'Ville de Morges — agenda : Festival des Sports, édition Patinoire', url: 'https://www.morges.ch/agenda/festival-des-sports--edition-patinoire-212903' },
    ],
    lastVerified: '2026-10-28',
  },
  {
    id: 'beausobre-blaise-bersinger-2026',
    title: {
      fr: 'Blaise Bersinger',
      en: 'Blaise Bersinger',
      de: 'Blaise Bersinger',
      it: 'Blaise Bersinger',
    },
    startDate: '2026-11-12',
    endDate: '2026-11-12',
    placeId: 'beausobre',
    hours: null,
    summary: {
      fr: 'Spectacle d’humour de Blaise Bersinger, au Théâtre de Beausobre.',
      en: 'Comedy show by Blaise Bersinger, at the Théâtre de Beausobre.',
      de: 'Comedy-Programm von Blaise Bersinger im Théâtre de Beausobre.',
      it: 'Spettacolo comico di Blaise Bersinger, al Théâtre de Beausobre.',
    },
    sources: [
      { label: 'Théâtre de Beausobre — programme', url: 'https://beausobre.ch/' },
    ],
    lastVerified: '2026-10-28',
  },
  {
    id: 'beausobre-circa-2026',
    title: {
      fr: 'Cie Circa',
      en: 'Circa',
      de: 'Circa',
      it: 'Circa',
    },
    startDate: '2026-11-18',
    endDate: '2026-11-18',
    placeId: 'beausobre',
    hours: null,
    summary: {
      fr: 'Cirque contemporain de la compagnie australienne Circa, au Théâtre de Beausobre.',
      en: 'Contemporary circus by the Australian company Circa, at the Théâtre de Beausobre.',
      de: 'Zeitgenössischer Zirkus der australischen Compagnie Circa im Théâtre de Beausobre.',
      it: 'Circo contemporaneo della compagnia australiana Circa, al Théâtre de Beausobre.',
    },
    sources: [
      { label: 'Théâtre de Beausobre — programme', url: 'https://beausobre.ch/' },
    ],
    lastVerified: '2026-10-28',
  },
  {
    id: 'beausobre-solann-2026',
    title: {
      fr: 'Solann',
      en: 'Solann',
      de: 'Solann',
      it: 'Solann',
    },
    startDate: '2026-11-21',
    endDate: '2026-11-21',
    placeId: 'beausobre',
    hours: null,
    summary: {
      fr: 'Concert de la chanteuse Solann, au Théâtre de Beausobre.',
      en: 'Concert by the singer Solann, at the Théâtre de Beausobre.',
      de: 'Konzert der Sängerin Solann im Théâtre de Beausobre.',
      it: 'Concerto della cantante Solann, al Théâtre de Beausobre.',
    },
    sources: [
      { label: 'Théâtre de Beausobre — programme', url: 'https://beausobre.ch/' },
    ],
    lastVerified: '2026-10-28',
  },
  {
    id: 'requiem-for-a-dead-sun-2026',
    title: {
      fr: 'Requiem for a Dead Sun',
      en: 'Requiem for a Dead Sun',
      de: 'Requiem for a Dead Sun',
      it: 'Requiem for a Dead Sun',
    },
    startDate: '2026-11-29',
    endDate: '2026-11-29',
    placeId: 'beausobre',
    hours: null,
    summary: {
      fr: 'Grande œuvre chorale et instrumentale d’Alain Roche, au Théâtre de Beausobre.',
      en: 'A large choral and instrumental work by Alain Roche, at the Théâtre de Beausobre.',
      de: 'Grosses Werk für Chor und Instrumente von Alain Roche im Théâtre de Beausobre.',
      it: 'Grande opera corale e strumentale di Alain Roche, al Théâtre de Beausobre.',
    },
    sources: [
      { label: 'Théâtre de Beausobre — programme', url: 'https://beausobre.ch/' },
      { label: 'Songkick — Alain Roche au Théâtre de Beausobre', url: 'https://www.songkick.com/fr/concerts/43298041-alain-roche-at-theatre-de-beausobre' },
    ],
    lastVerified: '2026-10-28',
  },
  {
    id: 'marche-de-noel-2026',
    title: {
      fr: 'Marché de Noël de Morges',
      en: 'Morges Christmas Market',
      de: 'Weihnachtsmarkt Morges',
      it: 'Mercatino di Natale di Morges',
    },
    startDate: '2026-12-02',
    endDate: '2026-12-20',
    placeId: 'chateau',
    featured: true,
    website: 'https://www.morgesnoel.ch/',
    hours: {
      fr: 'Mercredi à vendredi de 15 h à 21 h, samedi de 10 h à 21 h, dimanche de 10 h à 20 h ; fermé lundi et mardi. Les espaces de restauration restent ouverts jusqu’à minuit les jours de marché.',
      en: 'Wednesday to Friday 3 pm to 9 pm, Saturday 10 am to 9 pm, Sunday 10 am to 8 pm; closed Monday and Tuesday. The food areas stay open until midnight on market days.',
      de: 'Mittwoch bis Freitag 15 bis 21 Uhr, Samstag 10 bis 21 Uhr, Sonntag 10 bis 20 Uhr; montags und dienstags geschlossen. Die Verpflegungsbereiche sind an Markttagen bis Mitternacht offen.',
      it: 'Da mercoledì a venerdì dalle 15 alle 21, sabato dalle 10 alle 21, domenica dalle 10 alle 20; chiuso lunedì e martedì. Le aree di ristorazione restano aperte fino a mezzanotte nei giorni di mercato.',
    },
    weekHours: {
      mon: null,
      tue: null,
      wed: ['15:00', '21:00'],
      thu: ['15:00', '21:00'],
      fri: ['15:00', '21:00'],
      sat: ['10:00', '21:00'],
      sun: ['10:00', '20:00'],
    },
    summary: {
      fr: 'Près de 150 exposants répartis en six zones autour du Château, des pop-ups qui changent chaque week-end et de quoi se restaurer sur place.',
      en: 'Nearly 150 stallholders in six areas around the Castle, pop-ups that change every weekend and food stands on site.',
      de: 'Fast 150 Ausstellerinnen und Aussteller in sechs Zonen rund um das Schloss, Pop-ups, die jedes Wochenende wechseln, und Verpflegungsstände vor Ort.',
      it: 'Quasi 150 espositori in sei zone intorno al Castello, pop-up che cambiano ogni fine settimana e stand di ristorazione sul posto.',
    },
    details: [
      {
        title: { fr: 'Y aller', en: 'Getting there', de: 'Anreise', it: 'Come arrivare' },
        text: {
          fr: 'En train, la gare est à environ 6 minutes à pied ; en bus, arrêt Casino, à environ 5 minutes. En voiture : Parking des Sports à quelques minutes à travers le parc (première heure gratuite) et parkings souterrains proches dès CHF 2 l’heure ; le week-end, mieux vaut arriver tôt. À vélo : stationnement abrité face au Château.',
          en: 'By train, the station is about a 6-minute walk; by bus, the Casino stop is about 5 minutes away. By car: the Parking des Sports is a few minutes away through the park (first hour free), and underground car parks nearby cost from CHF 2 an hour; at weekends, it is best to arrive early. By bike: covered parking opposite the Castle.',
          de: 'Mit dem Zug: Der Bahnhof liegt etwa 6 Gehminuten entfernt; mit dem Bus: Haltestelle Casino, etwa 5 Minuten. Mit dem Auto: Parking des Sports, wenige Minuten durch den Park (erste Stunde gratis), und Tiefgaragen in der Nähe ab CHF 2 pro Stunde; am Wochenende kommt man besser früh. Mit dem Velo: überdachte Abstellplätze gegenüber dem Schloss.',
          it: 'In treno, la stazione è a circa 6 minuti a piedi; in autobus, fermata Casino, a circa 5 minuti. In auto: Parking des Sports a pochi minuti attraverso il parco (prima ora gratuita) e autosili sotterranei vicini da CHF 2 all’ora; nel fine settimana è meglio arrivare presto. In bici: parcheggio coperto di fronte al Castello.',
        },
      },
      {
        title: { fr: 'Se restaurer', en: 'Food and drink', de: 'Essen und Trinken', it: 'Mangiare e bere' },
        text: {
          fr: 'Des stands de restauration sur tout le site, ouverts jusqu’à minuit les jours de marché.',
          en: 'Food stands across the site, open until midnight on market days.',
          de: 'Verpflegungsstände auf dem ganzen Gelände, an Markttagen bis Mitternacht offen.',
          it: 'Stand di ristorazione in tutta l’area, aperti fino a mezzanotte nei giorni di mercato.',
        },
      },
      {
        title: { fr: 'Accessibilité', en: 'Accessibility', de: 'Barrierefreiheit', it: 'Accessibilità' },
        text: {
          fr: 'Cinq zones sur six sont accessibles en fauteuil roulant et avec une poussette. Seule la zone Caves, au sous-sol du Château, ne l’est pas. L’équipe du marché peut vous aider sur place.',
          en: 'Five of the six areas are accessible by wheelchair and with a pushchair. Only the Caves area, in the Castle’s basement, is not. The market team can help you on site.',
          de: 'Fünf der sechs Zonen sind mit dem Rollstuhl und dem Kinderwagen zugänglich. Nur die Zone Caves im Untergeschoss des Schlosses ist es nicht. Das Marktteam hilft Ihnen vor Ort.',
          it: 'Cinque zone su sei sono accessibili in sedia a rotelle e con il passeggino. Solo la zona Caves, nel seminterrato del Castello, non lo è. Il personale del mercato può aiutarvi sul posto.',
        },
      },
      {
        title: { fr: 'Chiens', en: 'Dogs', de: 'Hunde', it: 'Cani' },
        text: {
          fr: 'Bienvenus, tenus en laisse.',
          en: 'Welcome, on a lead.',
          de: 'Willkommen, an der Leine.',
          it: 'Benvenuti, al guinzaglio.',
        },
      },
    ],
    sources: [
      { label: 'Marché de Noël de Morges — site officiel', url: 'https://www.morgesnoel.ch/' },
      { label: 'Ville de Morges — agenda : Marché de Noël de Morges', url: 'https://www.morges.ch/agenda/marche-de-noel-de-morges-213841' },
      { label: 'Morges Région Tourisme — Marché de Noël au Château de Morges', url: 'https://www.morges-tourisme.ch/events/marche-de-noel-au-chateau-de-morges/' },
    ],
    lastVerified: '2026-11-04',
  },
];

export function validateEvent(e) {
  const p = `event(${e && e.id})`;
  const errors = [];
  errors.push(...validateText(e && e.title, `${p}.title`));
  if (!e || !isIsoDate(e.startDate) || !isIsoDate(e.endDate) || e.endDate < e.startDate) errors.push(`${p} dates are invalid`);
  if (e && e.hours !== null) errors.push(...validateText(e.hours, `${p}.hours`));
  if (e && e.summary !== undefined) errors.push(...validateText(e.summary, `${p}.summary`, { allLanguages: true }));
  if (e && e.weekHours !== undefined) {
    const days = Object.keys(e.weekHours || {});
    if (days.length !== 7 || !WEEKDAYS.every((d) => days.includes(d))) errors.push(`${p}.weekHours needs the seven days (mon … sun)`);
    for (const d of WEEKDAYS) {
      const h = e.weekHours && e.weekHours[d];
      if (h !== null && !(Array.isArray(h) && h.length === 2 && h.every((x) => /^([01]\d|2[0-3]):[0-5]\d$/.test(x)))) errors.push(`${p}.weekHours.${d} must be null or ['HH:MM', 'HH:MM']`);
    }
  }
  if (e && e.details !== undefined) {
    if (!Array.isArray(e.details)) errors.push(`${p}.details must be a list`);
    else e.details.forEach((d, i) => errors.push(...validateText(d && d.title, `${p}.details[${i}].title`, { allLanguages: true }), ...validateText(d && d.text, `${p}.details[${i}].text`, { allLanguages: true })));
  }
  const time = /^([01]\d|2[0-3]):[0-5]\d$/;
  if (e && e.startTime !== undefined && !time.test(e.startTime)) errors.push(`${p}.startTime must be HH:MM`);
  if (e && e.endTime !== undefined && (!time.test(e.endTime) || e.startTime === undefined)) errors.push(`${p}.endTime must be HH:MM, after a startTime`);
  if (e && e.venue !== undefined) {
    const v = e.venue || {};
    if (typeof v.name !== 'string' || !v.name.trim() || typeof v.address !== 'string' || !/,\s*\d{4}\s+\S/.test(v.address)) {
      errors.push(`${p}.venue needs a name and an address ("street, 1110 Morges")`);
    }
  }
  if (e && e.photo !== undefined) errors.push(...validatePhoto(e.photo, `${p}.photo`));
  if (e && e.website !== undefined && !/^https:\/\//.test(e.website)) errors.push(`${p}.website must be https`);
  if (e && e.featured !== undefined && typeof e.featured !== 'boolean') errors.push(`${p}.featured must be true or false`);
  errors.push(...validateSources(e && e.sources, `${p}.sources`));
  if (!e || !isIsoDate(e.lastVerified)) errors.push(`${p}.lastVerified must be YYYY-MM-DD`);
  return errors;
}

/** Local calendar date (Europe/Zurich) as YYYY-MM-DD. */
export function todayInMorges(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Zurich' }).format(now);
}

/** Days of the week, as keys of `weekHours`, in the order of Date#getUTCDay (Sunday first). */
export const WEEKDAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

/** The weekday key of a YYYY-MM-DD date. */
export function weekdayOf(iso) {
  return WEEKDAYS[new Date(`${iso}T12:00:00Z`).getUTCDay()];
}

/** Whether an event takes place on a given day (between its dates, and not on a weekday it is closed). */
export function isOnDay(event, iso) {
  if (iso < event.startDate || iso > event.endDate) return false;
  return !event.weekHours || event.weekHours[weekdayOf(iso)] !== null;
}

/** Events on a given day, in the order given. */
export function eventsOnDay(list, iso) {
  return list.filter((e) => isOnDay(e, iso));
}

/** The next featured event that has not ended, if any. */
export function featuredEvent(list = EVENTS, today = todayInMorges()) {
  return upcomingEvents(list, today).find((e) => e.featured) || null;
}

/** Events that have not ended yet, soonest first. */
export function upcomingEvents(list = EVENTS, today = todayInMorges()) {
  return list.filter((e) => e.endDate >= today).sort((a, b) => a.startDate.localeCompare(b.startDate));
}
