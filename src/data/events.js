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
    id: 'atelier-peinture-doree-2026',
    title: {
      fr: 'Atelier « La peinture dorée »',
      en: '“Golden painting” workshop',
      de: 'Workshop «Goldene Malerei»',
      it: 'Laboratorio «La pittura dorata»',
    },
    startDate: '2026-11-14',
    endDate: '2026-11-14',
    startTime: '16:00',
    endTime: '18:00',
    placeId: null,
    venue: {
      name: { fr: 'Villa privée à Morges', en: 'Private villa in Morges', de: 'Private Villa in Morges', it: 'Villa privata a Morges' },
      note: {
        fr: 'adresse communiquée après l’inscription',
        en: 'address given after registration',
        de: 'Adresse nach der Anmeldung mitgeteilt',
        it: 'indirizzo comunicato dopo l’iscrizione',
      },
    },
    hours: {
      fr: 'Samedi de 16 h à 18 h. Places limitées.',
      en: 'Saturday 4 pm to 6 pm. Limited places.',
      de: 'Samstag 16 bis 18 Uhr. Begrenzte Plätze.',
      it: 'Sabato dalle 16 alle 18. Posti limitati.',
    },
    summary: {
      fr: 'Un atelier créatif pour les femmes : deux heures pour soi, dans une ambiance douce et bienveillante, à la découverte de la peinture acrylique et de la feuille d’or. Animé par Déborah et Matière.',
      en: 'A creative workshop for women: two hours for yourself, in a gentle, caring atmosphere, discovering acrylic painting and gold leaf. Led by Déborah and Matière.',
      de: 'Ein kreativer Workshop für Frauen: zwei Stunden für sich, in einer sanften, wohlwollenden Atmosphäre, mit Acrylmalerei und Blattgold. Geleitet von Déborah und Matière.',
      it: 'Un laboratorio creativo per donne: due ore per sé, in un’atmosfera dolce e accogliente, alla scoperta della pittura acrilica e della foglia d’oro. Condotto da Déborah e Matière.',
    },
    registration: { url: 'https://luma.com/4i3dsrp5', until: '2026-11-12' },
    photo: {
      src: '/images/events/peinture-doree.webp',
      width: 600,
      height: 600,
      alt: {
        fr: 'Feuilles d’or posées sur une toile blanche, à côté de deux pinceaux',
        en: 'Gold leaf laid on a white canvas, next to two paintbrushes',
        de: 'Blattgold auf einer weissen Leinwand neben zwei Pinseln',
        it: 'Foglie d’oro posate su una tela bianca, accanto a due pennelli',
      },
      credit: 'Matière',
      licence: 'Visuel de l’atelier transmis à Morges.info par l’organisatrice (05.11.2026)',
    },
    sources: [
      { label: 'Luma — La peinture dorée (inscription)', url: 'https://luma.com/4i3dsrp5' },
      { label: 'Morges.info — informations transmises par l’organisatrice, Déborah (05.11.2026)' },
    ],
    lastVerified: '2026-11-05',
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
  // --- added 2026-11-18: Ville de Morges, Noël 2026 programme; Théâtre de Beausobre programme; André Geiser (sent by the owner)
  {
    id: 'andre-geiser-la-rive-2026',
    title: {
      fr: 'Concert : André Geiser, pop française',
      en: 'Concert: André Geiser, French pop',
      de: 'Konzert: André Geiser, französischer Pop',
      it: 'Concerto: André Geiser, pop francese',
    },
    startDate: '2026-11-20',
    endDate: '2026-11-20',
    startTime: '18:00',
    endTime: '22:00',
    placeId: null,
    venue: { name: 'La Rive Lounge Bar', address: 'Rue des Charpentiers 19b, 1110 Morges' },
    hours: {
      fr: 'En deux parties : de 18 h à 19 h pour l’apéro, puis de 20 h 15 à 22 h. Entrée libre, chapeau pour les musiciens. Réservation conseillée au 021 811 00 11, en précisant que vous venez pour le concert.',
      en: 'In two parts: 6 to 7 pm for the aperitif, then 8.15 to 10 pm. Free entry, with a collection for the musicians. Booking advised on 021 811 00 11, mentioning that you are coming for the concert.',
      de: 'In zwei Teilen: 18 bis 19 Uhr zum Apéro, dann 20.15 bis 22 Uhr. Eintritt frei, Kollekte für die Musiker. Reservation empfohlen unter 021 811 00 11, mit dem Hinweis, dass Sie wegen des Konzerts kommen.',
      it: 'In due parti: dalle 18 alle 19 per l’aperitivo, poi dalle 20.15 alle 22. Ingresso libero, offerta per i musicisti. Prenotazione consigliata allo 021 811 00 11, precisando che venite per il concerto.',
    },
    summary: {
      fr: 'Auteur-compositeur-interprète de la région lausannoise, André Geiser joue en acoustique des reprises de chanson française (Vianney, Zaz, Goldman, Cabrel…) et ses propres titres. Avec Alain Geiser à la basse.',
      en: 'A singer-songwriter from the Lausanne area, André Geiser plays acoustic covers of French songs (Vianney, Zaz, Goldman, Cabrel…) and songs of his own. With Alain Geiser on bass.',
      de: 'Der Singer-Songwriter aus der Region Lausanne spielt akustische Coverversionen französischer Chansons (Vianney, Zaz, Goldman, Cabrel…) und eigene Lieder. Mit Alain Geiser am Bass.',
      it: 'Cantautore della regione di Losanna, André Geiser suona in acustico cover della canzone francese (Vianney, Zaz, Goldman, Cabrel…) e brani propri. Con Alain Geiser al basso.',
    },
    website: 'https://www.geiserandre.com',
    sources: [
      { label: 'André Geiser — site officiel', url: 'https://www.geiserandre.com' },
      { label: 'Morges.info — affiche et annonce de l’événement (Duke’s La Scène, André Geiser), transmises le 18.11.2026' },
    ],
    lastVerified: '2026-11-18',
  },
  {
    id: 'beausobre-un-bateau-2026',
    title: { fr: 'Un bateau (jeune public)', en: 'Un bateau (for children)', de: 'Un bateau (für Kinder)', it: 'Un bateau (per bambini)' },
    startDate: '2026-11-22',
    endDate: '2026-11-22',
    startTime: '11:00',
    placeId: 'beausobre',
    hours: null,
    summary: {
      fr: 'Spectacle jeune public de la Cie Sans Soucis, avec musique, marionnettes et images animées, au CUBE de Beausobre.',
      en: 'A show for children by the Cie Sans Soucis, with music, puppets and animated images, at the CUBE of Beausobre.',
      de: 'Kinderstück der Cie Sans Soucis mit Musik, Marionetten und animierten Bildern, im CUBE von Beausobre.',
      it: 'Spettacolo per bambini della Cie Sans Soucis, con musica, marionette e immagini animate, al CUBE di Beausobre.',
    },
    sources: [{ label: 'Théâtre de Beausobre — programme', url: 'https://beausobre.ch/programme/' }],
    lastVerified: '2026-11-18',
  },
  {
    id: 'beausobre-la-veuve-2026',
    title: { fr: 'La Veuve', en: 'La Veuve', de: 'La Veuve', it: 'La Veuve' },
    startDate: '2026-11-27',
    endDate: '2026-11-29',
    placeId: 'beausobre',
    hours: {
      fr: 'Vendredi à 20 h, samedi à 19 h, dimanche à 18 h.',
      en: 'Friday at 8 pm, Saturday at 7 pm, Sunday at 6 pm.',
      de: 'Freitag um 20 Uhr, Samstag um 19 Uhr, Sonntag um 18 Uhr.',
      it: 'Venerdì alle 20, sabato alle 19, domenica alle 18.',
    },
    summary: {
      fr: 'Comédie et théâtre d’objets de la Cie du Botte-Cul, au CUBE de Beausobre.',
      en: 'Comedy and object theatre by the Cie du Botte-Cul, at the CUBE of Beausobre.',
      de: 'Komödie und Objekttheater der Cie du Botte-Cul, im CUBE von Beausobre.',
      it: 'Commedia e teatro d’oggetti della Cie du Botte-Cul, al CUBE di Beausobre.',
    },
    sources: [{ label: 'Théâtre de Beausobre — programme', url: 'https://beausobre.ch/programme/' }],
    lastVerified: '2026-11-18',
  },
  {
    id: 'concert-avent-temple-2026',
    title: { fr: 'Concert de l’Avent', en: 'Advent concert', de: 'Adventskonzert', it: 'Concerto dell’Avvento' },
    startDate: '2026-11-29',
    endDate: '2026-11-29',
    startTime: '17:00',
    placeId: 'temple',
    hours: null,
    summary: {
      fr: 'Concert d’orgue avec l’organiste Émile Sécheret, au temple de Morges.',
      en: 'Organ concert by the organist Émile Sécheret, at the Temple of Morges.',
      de: 'Orgelkonzert mit dem Organisten Émile Sécheret in der reformierten Kirche von Morges.',
      it: 'Concerto d’organo con l’organista Émile Sécheret, al tempio di Morges.',
    },
    sources: [{ label: 'Ville de Morges — programme des animations de Noël 2026', url: 'https://www.morges.ch/agenda/programme-des-animations-de-noel-2026-214080' }],
    lastVerified: '2026-11-18',
  },
  {
    id: 'illumination-sapin-2026',
    title: {
      fr: 'Illumination du sapin et Saint-Nicolas',
      en: 'Christmas tree lighting and Saint Nicholas',
      de: 'Beleuchtung des Weihnachtsbaums und Samichlaus',
      it: 'Accensione dell’albero e San Nicolao',
    },
    startDate: '2026-12-04',
    endDate: '2026-12-04',
    startTime: '18:00',
    placeId: 'hotel-de-ville',
    hours: {
      fr: 'Dès 18 h : vin chaud offert et photo avec Saint-Nicolas. À 18 h 45 : illumination du sapin et lancement de la Chasse aux lumières.',
      en: 'From 6 pm: free mulled wine and photos with Saint Nicholas. At 6.45 pm: the tree is lit and the Light Hunt begins.',
      de: 'Ab 18 Uhr: offerierter Glühwein und Foto mit dem Samichlaus. Um 18.45 Uhr: Der Baum wird beleuchtet und die Lichterjagd beginnt.',
      it: 'Dalle 18: vin brulé offerto e foto con San Nicolao. Alle 18.45: accensione dell’albero e inizio della Caccia alle luci.',
    },
    summary: {
      fr: 'Le coup d’envoi des fêtes sur la place de l’Hôtel-de-Ville.',
      en: 'The start of the festive season on the Place de l’Hôtel-de-Ville.',
      de: 'Der Auftakt der Festtage auf der Place de l’Hôtel-de-Ville.',
      it: 'L’avvio delle feste sulla piazza dell’Hôtel-de-Ville.',
    },
    sources: [{ label: 'Ville de Morges — programme des animations de Noël 2026', url: 'https://www.morges.ch/agenda/programme-des-animations-de-noel-2026-214080' }],
    lastVerified: '2026-11-18',
  },
  {
    id: 'chasse-aux-lumieres-2026',
    title: { fr: 'La Chasse aux lumières', en: 'The Light Hunt', de: 'Die Lichterjagd', it: 'La Caccia alle luci' },
    startDate: '2026-12-04',
    endDate: '2027-01-09',
    placeId: null,
    venue: {
      name: { fr: 'Centre-ville de Morges', en: 'Morges town centre', de: 'Stadtzentrum von Morges', it: 'Centro di Morges' },
      note: {
        fr: 'Installations lumineuses dans le centre-ville ; boîte aux lettres géante pour les bulletins.',
        en: 'Light installations around the town centre; a giant letterbox for the entry forms.',
        de: 'Lichtinstallationen im Stadtzentrum; ein riesiger Briefkasten für die Teilnahmekarten.',
        it: 'Installazioni luminose nel centro; una buca delle lettere gigante per le schede.',
      },
    },
    hours: null,
    summary: {
      fr: 'Un parcours ludique de Noël : repérez les installations lumineuses du centre-ville et déposez votre bulletin pour le tirage au sort. Proposé par la Ville et la COOR, avec le concours des vitrines. Résultats le 9 janvier.',
      en: 'A playful Christmas trail: spot the light installations in the town centre and post your entry for the prize draw. Run by the Town and the COOR, with a shop-window contest. Results on 9 January.',
      de: 'Ein spielerischer Weihnachtsparcours: Entdecken Sie die Lichtinstallationen im Zentrum und werfen Sie Ihre Karte für die Verlosung ein. Von der Stadt und der COOR, mit Schaufensterwettbewerb. Resultate am 9. Januar.',
      it: 'Un percorso di Natale ludico: scoprite le installazioni luminose del centro e imbucate la scheda per l’estrazione. Proposto dal Comune e dalla COOR, con il concorso delle vetrine. Risultati il 9 gennaio.',
    },
    sources: [{ label: 'Ville de Morges — programme des animations de Noël 2026', url: 'https://www.morges.ch/agenda/programme-des-animations-de-noel-2026-214080' }],
    lastVerified: '2026-11-18',
  },
  {
    id: 'samedi-pati-2026-12',
    title: { fr: 'Samedi à la Pati !', en: 'Saturday at the rink!', de: 'Samstag auf dem Eis!', it: 'Sabato in pista!' },
    startDate: '2026-12-05',
    endDate: '2026-12-05',
    startTime: '13:00',
    endTime: '22:00',
    placeId: 'patinoire-eaux-minerales',
    hours: null,
    summary: {
      fr: 'Patinage libre en musique, avec buvette, à la patinoire des Eaux-Minérales.',
      en: 'Free skating to music, with a bar, at the Eaux-Minérales ice rink.',
      de: 'Freies Eislaufen mit Musik und Buvette in der Eisbahn Eaux-Minérales.',
      it: 'Pattinaggio libero con musica e buvette alla pista delle Eaux-Minérales.',
    },
    sources: [{ label: 'Ville de Morges — programme des animations de Noël 2026', url: 'https://www.morges.ch/agenda/programme-des-animations-de-noel-2026-214080' }],
    lastVerified: '2026-11-18',
  },
  {
    id: 'beausobre-caveriviere-2026',
    title: { fr: 'Philippe Caverivière', en: 'Philippe Caverivière', de: 'Philippe Caverivière', it: 'Philippe Caverivière' },
    startDate: '2026-12-05',
    endDate: '2026-12-05',
    startTime: '19:00',
    placeId: 'beausobre',
    hours: null,
    summary: {
      fr: 'Spectacle d’humour « Tu crois que c’est une bonne idée ? », au Théâtre de Beausobre.',
      en: 'Comedy show “Tu crois que c’est une bonne idée ?”, at the Théâtre de Beausobre.',
      de: 'Comedy-Programm «Tu crois que c’est une bonne idée ?» im Théâtre de Beausobre.',
      it: 'Spettacolo comico «Tu crois que c’est une bonne idée ?», al Théâtre de Beausobre.',
    },
    sources: [{ label: 'Théâtre de Beausobre — programme', url: 'https://beausobre.ch/programme/' }],
    lastVerified: '2026-11-18',
  },
  {
    id: 'expo-cazenave-espace81-2026',
    title: {
      fr: 'Exposition lumineuse de Bertrand Cazenave',
      en: 'Light exhibition by Bertrand Cazenave',
      de: 'Lichtausstellung von Bertrand Cazenave',
      it: 'Mostra luminosa di Bertrand Cazenave',
    },
    startDate: '2026-12-09',
    endDate: '2027-01-11',
    placeId: null,
    venue: { name: 'Espace 81', address: 'Grand-Rue 81, 1110 Morges' },
    hours: {
      fr: 'Le 9 décembre, deux ateliers gratuits pour enfants (13 h 30 et 15 h, une heure), sur inscription à espace81@morges.ch, puis goûter de Noël dès 16 h 30.',
      en: 'On 9 December, two free workshops for children (1.30 and 3 pm, one hour), booking at espace81@morges.ch, followed by a Christmas snack from 4.30 pm.',
      de: 'Am 9. Dezember zwei kostenlose Kinderateliers (13.30 und 15 Uhr, eine Stunde), Anmeldung an espace81@morges.ch, danach Weihnachtszvieri ab 16.30 Uhr.',
      it: 'Il 9 dicembre, due laboratori gratuiti per bambini (13.30 e 15, un’ora), iscrizione a espace81@morges.ch, poi merenda di Natale dalle 16.30.',
    },
    summary: {
      fr: 'L’artiste donne une seconde vie à des objets oubliés en les transformant en méduses lumineuses : un monde sous-marin poétique, entre lumière et mouvement.',
      en: 'The artist gives forgotten objects a second life by turning them into glowing jellyfish: a poetic underwater world of light and movement.',
      de: 'Der Künstler gibt vergessenen Gegenständen ein zweites Leben als leuchtende Quallen: eine poetische Unterwasserwelt aus Licht und Bewegung.',
      it: 'L’artista dà una seconda vita a oggetti dimenticati trasformandoli in meduse luminose: un poetico mondo sottomarino fra luce e movimento.',
    },
    sources: [
      { label: 'Ville de Morges — programme des animations de Noël 2026', url: 'https://www.morges.ch/agenda/programme-des-animations-de-noel-2026-214080' },
      { label: 'Ville de Morges — Espace 81', url: 'https://www.morges.ch/espace81' },
    ],
    lastVerified: '2026-11-18',
  },
  {
    id: 'beausobre-casse-noisette-2026',
    title: { fr: 'Casse-Noisette', en: 'The Nutcracker', de: 'Der Nussknacker', it: 'Lo Schiaccianoci' },
    startDate: '2026-12-11',
    endDate: '2026-12-11',
    placeId: 'beausobre',
    hours: null,
    summary: {
      fr: 'Le ballet de Noël, au Théâtre de Beausobre.',
      en: 'The Christmas ballet, at the Théâtre de Beausobre.',
      de: 'Das Weihnachtsballett im Théâtre de Beausobre.',
      it: 'Il balletto di Natale, al Théâtre de Beausobre.',
    },
    sources: [
      { label: 'Théâtre de Beausobre — programme', url: 'https://beausobre.ch/programme/' },
      { label: 'Ville de Morges — programme des animations de Noël 2026', url: 'https://www.morges.ch/agenda/programme-des-animations-de-noel-2026-214080' },
    ],
    lastVerified: '2026-11-18',
  },
  {
    id: 'oratorio-noel-2026',
    title: { fr: 'Oratorio de Noël', en: 'Christmas Oratorio', de: 'Weihnachtsoratorium', it: 'Oratorio di Natale' },
    startDate: '2026-12-12',
    endDate: '2026-12-13',
    placeId: 'temple',
    hours: {
      fr: 'Samedi 12 décembre à 19 h et dimanche 13 décembre à 17 h ; participation au culte du dimanche à 10 h.',
      en: 'Saturday 12 December at 7 pm and Sunday 13 December at 5 pm; also at the Sunday service at 10 am.',
      de: 'Samstag, 12. Dezember, um 19 Uhr und Sonntag, 13. Dezember, um 17 Uhr; Mitwirkung im Sonntagsgottesdienst um 10 Uhr.',
      it: 'Sabato 12 dicembre alle 19 e domenica 13 dicembre alle 17; partecipazione al culto della domenica alle 10.',
    },
    summary: {
      fr: 'Une centaine de choristes et l’Orchestre Jubilu, sous la direction de Thierry Daenzer, dans un oratorio d’œuvres baroques (Telemann, Graun, C. P. E. Bach, J.-S. Bach…) qui suit les récits de l’Évangile.',
      en: 'Some hundred singers and the Orchestre Jubilu, conducted by Thierry Daenzer, in an oratorio of Baroque works (Telemann, Graun, C. P. E. Bach, J. S. Bach…) that follows the Gospel narratives.',
      de: 'Rund hundert Sängerinnen und Sänger und das Orchestre Jubilu unter der Leitung von Thierry Daenzer, in einem Oratorium aus Barockwerken (Telemann, Graun, C. P. E. Bach, J. S. Bach…) nach den Evangelien.',
      it: 'Un centinaio di coristi e l’Orchestre Jubilu, diretti da Thierry Daenzer, in un oratorio di opere barocche (Telemann, Graun, C. P. E. Bach, J. S. Bach…) che segue i racconti del Vangelo.',
    },
    sources: [{ label: 'Ville de Morges — Oratorio de Noël 2026', url: 'https://www.morges.ch/agenda/oratorio-de-noel-2026-213828' }],
    lastVerified: '2026-11-18',
  },
  {
    id: 'dimanches-commerces-2026',
    title: {
      fr: 'Petits commerces ouverts le dimanche',
      en: 'Small shops open on Sunday',
      de: 'Kleine Läden am Sonntag offen',
      it: 'Piccoli negozi aperti la domenica',
    },
    startDate: '2026-12-13',
    endDate: '2026-12-20',
    placeId: 'grand-rue',
    weekHours: { mon: null, tue: null, wed: null, thu: null, fri: null, sat: null, sun: ['10:00', '17:00'] },
    hours: {
      fr: 'Dimanches 13 et 20 décembre, de 10 h à 17 h, pour les commerces qui le souhaitent.',
      en: 'Sundays 13 and 20 December, 10 am to 5 pm, for the shops that choose to open.',
      de: 'Sonntag, 13. und 20. Dezember, 10 bis 17 Uhr, für die Läden, die öffnen möchten.',
      it: 'Domeniche 13 e 20 dicembre, dalle 10 alle 17, per i negozi che lo desiderano.',
    },
    summary: {
      fr: 'Pour les achats de Noël, les petits commerces de Morges peuvent ouvrir deux dimanches.',
      en: 'For Christmas shopping, the small shops of Morges may open on two Sundays.',
      de: 'Für die Weihnachtseinkäufe dürfen die kleinen Läden von Morges an zwei Sonntagen öffnen.',
      it: 'Per gli acquisti di Natale, i piccoli negozi di Morges possono aprire due domeniche.',
    },
    sources: [{ label: 'Ville de Morges — programme des animations de Noël 2026', url: 'https://www.morges.ch/agenda/programme-des-animations-de-noel-2026-214080' }],
    lastVerified: '2026-11-18',
  },
  {
    id: 'beausobre-rosalune-2026',
    title: { fr: 'RosaLune (jeune public)', en: 'RosaLune (for children)', de: 'RosaLune (für Kinder)', it: 'RosaLune (per bambini)' },
    startDate: '2026-12-13',
    endDate: '2026-12-13',
    startTime: '11:00',
    placeId: 'beausobre',
    hours: null,
    summary: {
      fr: 'Théâtre d’ombres de la Cie Conte en Ombres, pour les enfants, au CUBE de Beausobre.',
      en: 'Shadow theatre for children by the Cie Conte en Ombres, at the CUBE of Beausobre.',
      de: 'Schattentheater für Kinder der Cie Conte en Ombres, im CUBE von Beausobre.',
      it: 'Teatro d’ombre per bambini della Cie Conte en Ombres, al CUBE di Beausobre.',
    },
    sources: [{ label: 'Théâtre de Beausobre — programme', url: 'https://beausobre.ch/programme/' }],
    lastVerified: '2026-11-18',
  },
  {
    id: 'choeur-ornement-2026',
    title: {
      fr: 'Chants traditionnels ukrainiens',
      en: 'Traditional Ukrainian songs',
      de: 'Traditionelle ukrainische Lieder',
      it: 'Canti tradizionali ucraini',
    },
    startDate: '2026-12-13',
    endDate: '2026-12-13',
    startTime: '14:00',
    placeId: null,
    venue: {
      name: { fr: 'Centre-ville de Morges', en: 'Morges town centre', de: 'Stadtzentrum von Morges', it: 'Centro di Morges' },
      note: {
        fr: 'En plein air, dans le centre-ville.',
        en: 'Outdoors, in the town centre.',
        de: 'Draussen, im Stadtzentrum.',
        it: 'All’aperto, nel centro.',
      },
    },
    hours: null,
    summary: {
      fr: 'L’association Ornement, chœur de femmes ukrainiennes, chante au centre-ville.',
      en: 'Ornement, a choir of Ukrainian women, sings in the town centre.',
      de: 'Ornement, ein Chor ukrainischer Frauen, singt im Stadtzentrum.',
      it: 'Ornement, coro di donne ucraine, canta nel centro.',
    },
    sources: [{ label: 'Ville de Morges — programme des animations de Noël 2026', url: 'https://www.morges.ch/agenda/programme-des-animations-de-noel-2026-214080' }],
    lastVerified: '2026-11-18',
  },
  {
    id: 'beausobre-millepied-2026',
    title: { fr: 'Benjamin Millepied : Du bout des lèvres', en: 'Benjamin Millepied: Du bout des lèvres', de: 'Benjamin Millepied: Du bout des lèvres', it: 'Benjamin Millepied: Du bout des lèvres' },
    startDate: '2026-12-15',
    endDate: '2026-12-15',
    startTime: '20:00',
    placeId: 'beausobre',
    hours: null,
    summary: {
      fr: 'Spectacle de danse de Benjamin Millepied, au Théâtre de Beausobre.',
      en: 'A dance piece by Benjamin Millepied, at the Théâtre de Beausobre.',
      de: 'Tanzstück von Benjamin Millepied im Théâtre de Beausobre.',
      it: 'Spettacolo di danza di Benjamin Millepied, al Théâtre de Beausobre.',
    },
    sources: [{ label: 'Théâtre de Beausobre — programme', url: 'https://beausobre.ch/programme/' }],
    lastVerified: '2026-11-18',
  },
  {
    id: 'pere-noel-patinoire-2026',
    title: { fr: 'Le Père Noël à la patinoire', en: 'Father Christmas at the ice rink', de: 'Der Weihnachtsmann auf der Eisbahn', it: 'Babbo Natale alla pista di pattinaggio' },
    startDate: '2026-12-17',
    endDate: '2026-12-17',
    startTime: '14:00',
    endTime: '17:00',
    placeId: 'patinoire-eaux-minerales',
    hours: null,
    summary: {
      fr: 'Le Père Noël revient à la patinoire des Eaux-Minérales, avec petite restauration et surprises.',
      en: 'Father Christmas is back at the Eaux-Minérales ice rink, with snacks and surprises.',
      de: 'Der Weihnachtsmann ist zurück in der Eisbahn Eaux-Minérales, mit Imbiss und Überraschungen.',
      it: 'Babbo Natale torna alla pista delle Eaux-Minérales, con spuntini e sorprese.',
    },
    sources: [{ label: 'Ville de Morges — programme des animations de Noël 2026', url: 'https://www.morges.ch/agenda/programme-des-animations-de-noel-2026-214080' }],
    lastVerified: '2026-11-18',
  },
  {
    id: 'beausobre-lemay-lalanne-2026',
    title: { fr: 'Lynda Lemay et Jean-Félix Lalanne', en: 'Lynda Lemay and Jean-Félix Lalanne', de: 'Lynda Lemay und Jean-Félix Lalanne', it: 'Lynda Lemay e Jean-Félix Lalanne' },
    startDate: '2026-12-17',
    endDate: '2026-12-17',
    startTime: '20:00',
    placeId: 'beausobre',
    hours: null,
    summary: {
      fr: '« Autour de leurs guitares » : chanson et guitares, au Théâtre de Beausobre.',
      en: '“Autour de leurs guitares”: songs and guitars, at the Théâtre de Beausobre.',
      de: '«Autour de leurs guitares»: Chanson und Gitarren im Théâtre de Beausobre.',
      it: '«Autour de leurs guitares»: canzoni e chitarre, al Théâtre de Beausobre.',
    },
    sources: [{ label: 'Théâtre de Beausobre — programme', url: 'https://beausobre.ch/programme/' }],
    lastVerified: '2026-11-18',
  },
  {
    id: 'noel-enfants-20-decembre-2026',
    title: {
      fr: 'Petit train et film de Noël pour les enfants',
      en: 'Little train and Christmas film for children',
      de: 'Bähnli und Weihnachtsfilm für Kinder',
      it: 'Trenino e film di Natale per i bambini',
    },
    startDate: '2026-12-20',
    endDate: '2026-12-20',
    startTime: '11:00',
    endTime: '16:00',
    placeId: null,
    venue: {
      name: { fr: 'Centre-ville de Morges', en: 'Morges town centre', de: 'Stadtzentrum von Morges', it: 'Centro di Morges' },
      note: {
        fr: 'Petit train dans le centre-ville ; film au Cinéma Odéon.',
        en: 'Little train in the town centre; film at the Cinéma Odéon.',
        de: 'Bähnli im Stadtzentrum; Film im Kino Odéon.',
        it: 'Trenino nel centro; film al Cinema Odéon.',
      },
    },
    hours: {
      fr: 'Tours en petit train offerts par la COOR de 11 h à 16 h. À 11 h, film d’animation gratuit pour les enfants, offert par le Cinéma Odéon.',
      en: 'Free little-train rides offered by the COOR from 11 am to 4 pm. At 11 am, a free animated film for children, offered by the Cinéma Odéon.',
      de: 'Gratis-Fahrten mit dem Bähnli, offeriert von der COOR, von 11 bis 16 Uhr. Um 11 Uhr ein kostenloser Animationsfilm für Kinder, offeriert vom Kino Odéon.',
      it: 'Giri in trenino offerti dalla COOR dalle 11 alle 16. Alle 11, film d’animazione gratuito per bambini offerto dal Cinema Odéon.',
    },
    summary: {
      fr: 'Un dimanche de Noël pour les familles, le jour de l’ouverture des petits commerces.',
      en: 'A Christmas Sunday for families, on the day the small shops open.',
      de: 'Ein Weihnachtssonntag für Familien, am Tag der Sonntagsöffnung der kleinen Läden.',
      it: 'Una domenica di Natale per le famiglie, il giorno di apertura dei piccoli negozi.',
    },
    sources: [{ label: 'Ville de Morges — programme des animations de Noël 2026', url: 'https://www.morges.ch/agenda/programme-des-animations-de-noel-2026-214080' }],
    lastVerified: '2026-11-18',
  },
  {
    id: 'beausobre-pierre-arditi-2026',
    title: { fr: 'Un soir avec Pierre Arditi', en: 'An evening with Pierre Arditi', de: 'Ein Abend mit Pierre Arditi', it: 'Una sera con Pierre Arditi' },
    startDate: '2026-12-21',
    endDate: '2026-12-21',
    startTime: '20:00',
    placeId: 'beausobre',
    hours: null,
    summary: {
      fr: 'Soirée de théâtre avec le comédien Pierre Arditi, au Théâtre de Beausobre.',
      en: 'An evening of theatre with the actor Pierre Arditi, at the Théâtre de Beausobre.',
      de: 'Theaterabend mit dem Schauspieler Pierre Arditi im Théâtre de Beausobre.',
      it: 'Serata di teatro con l’attore Pierre Arditi, al Théâtre de Beausobre.',
    },
    sources: [{ label: 'Théâtre de Beausobre — programme', url: 'https://beausobre.ch/programme/' }],
    lastVerified: '2026-11-18',
  },
  {
    id: 'nocturne-noel-2026',
    title: { fr: 'Nocturne de Noël', en: 'Christmas late-night shopping', de: 'Weihnachts-Abendverkauf', it: 'Apertura serale di Natale' },
    startDate: '2026-12-22',
    endDate: '2026-12-22',
    startTime: '16:00',
    endTime: '20:00',
    placeId: 'grand-rue',
    hours: {
      fr: 'Commerces ouverts jusqu’à 20 h ; marché des nocturnes de 16 h à 20 h dans la Grand-Rue ; parade des enfants à 17 h 30 ; dès 18 h, tours en calèche, photo avec le Père Noël et spectacle de bulles magiques.',
      en: 'Shops open until 8 pm; late-night market from 4 to 8 pm in the Grand-Rue; children’s parade at 5.30 pm; from 6 pm, carriage rides, photos with Father Christmas and a magic bubble show.',
      de: 'Läden bis 20 Uhr offen; Abendmarkt von 16 bis 20 Uhr in der Grand-Rue; Kinderumzug um 17.30 Uhr; ab 18 Uhr Kutschenfahrten, Foto mit dem Weihnachtsmann und Seifenblasen-Show.',
      it: 'Negozi aperti fino alle 20; mercato serale dalle 16 alle 20 nella Grand-Rue; sfilata dei bambini alle 17.30; dalle 18, giri in carrozza, foto con Babbo Natale e spettacolo di bolle magiche.',
    },
    summary: {
      fr: 'Le grand soir des achats de Noël au centre-ville, avec animations pour les enfants.',
      en: 'The big evening of Christmas shopping in the town centre, with activities for children.',
      de: 'Der grosse Weihnachtseinkaufsabend im Stadtzentrum, mit Animationen für Kinder.',
      it: 'La grande serata degli acquisti di Natale nel centro, con animazioni per i bambini.',
    },
    sources: [{ label: 'Ville de Morges — programme des animations de Noël 2026', url: 'https://www.morges.ch/agenda/programme-des-animations-de-noel-2026-214080' }],
    lastVerified: '2026-11-18',
  },
  {
    id: 'pas-seul-a-noel-2026',
    title: { fr: 'Pas seul à Noël', en: 'Not alone at Christmas', de: 'Nicht allein an Weihnachten', it: 'Non soli a Natale' },
    startDate: '2026-12-24',
    endDate: '2026-12-24',
    startTime: '19:00',
    placeId: null,
    venue: {
      name: 'Pas seul à Noël',
      note: {
        fr: 'Lieu et renseignements : 079 926 58 66 ou info@passeulanoel.ch.',
        en: 'Venue and information: 079 926 58 66 or info@passeulanoel.ch.',
        de: 'Ort und Auskunft: 079 926 58 66 oder info@passeulanoel.ch.',
        it: 'Luogo e informazioni: 079 926 58 66 o info@passeulanoel.ch.',
      },
    },
    hours: {
      fr: 'Dès 19 h. Participation : CHF 10.– par personne.',
      en: 'From 7 pm. Contribution: CHF 10 per person.',
      de: 'Ab 19 Uhr. Beitrag: CHF 10.– pro Person.',
      it: 'Dalle 19. Contributo: CHF 10.– a persona.',
    },
    summary: {
      fr: 'Une soirée conviviale pour celles et ceux qui ne peuvent pas fêter le réveillon avec leurs proches : repas de fête et animations.',
      en: 'A friendly evening for those who cannot celebrate Christmas Eve with their loved ones: a festive meal and entertainment.',
      de: 'Ein geselliger Abend für alle, die Heiligabend nicht mit ihren Liebsten feiern können: Festessen und Unterhaltung.',
      it: 'Una serata conviviale per chi non può festeggiare la vigilia con i propri cari: cena di festa e animazioni.',
    },
    sources: [{ label: 'Ville de Morges — programme des animations de Noël 2026', url: 'https://www.morges.ch/agenda/programme-des-animations-de-noel-2026-214080' }],
    lastVerified: '2026-11-18',
  },
  {
    id: 'galette-des-rois-2027',
    title: { fr: 'Galette des rois', en: 'Epiphany cake', de: 'Dreikönigskuchen', it: 'Torta dei Re Magi' },
    startDate: '2027-01-09',
    endDate: '2027-01-09',
    startTime: '09:00',
    endTime: '12:00',
    placeId: 'hotel-de-ville',
    hours: {
      fr: 'De 9 h à 12 h, pendant le marché ; remise des prix de la Chasse aux lumières et du concours des vitrines à 11 h.',
      en: '9 am to noon, during the market; prizes for the Light Hunt and the shop-window contest at 11 am.',
      de: '9 bis 12 Uhr, während des Markts; Preisverleihung der Lichterjagd und des Schaufensterwettbewerbs um 11 Uhr.',
      it: 'Dalle 9 alle 12, durante il mercato; premiazione della Caccia alle luci e del concorso delle vetrine alle 11.',
    },
    summary: {
      fr: 'Distribution de brioches de la galette des rois par la COOR et spectacle des rois mages, sur la place de l’Hôtel-de-Ville.',
      en: 'The COOR hands out Epiphany brioche and the Three Kings put on a show, on the Place de l’Hôtel-de-Ville.',
      de: 'Die COOR verteilt Dreikönigskuchen, dazu ein Spiel der Heiligen Drei Könige, auf der Place de l’Hôtel-de-Ville.',
      it: 'La COOR distribuisce brioche dei Re Magi e c’è lo spettacolo dei Re Magi, sulla piazza dell’Hôtel-de-Ville.',
    },
    sources: [{ label: 'Ville de Morges — programme des animations de Noël 2026', url: 'https://www.morges.ch/agenda/programme-des-animations-de-noel-2026-214080' }],
    lastVerified: '2026-11-18',
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
    // a venue without a page here: its name (a string, or text in four languages), its address
    // ("street, 1110 Morges"), or a note saying why there is none (a private home)
    const v = e.venue || {};
    const nameOk = typeof v.name === 'string' ? v.name.trim() : validateText(v.name, 'name', { allLanguages: true }).length === 0;
    if (!nameOk) errors.push(`${p}.venue.name is required`);
    if (v.address !== undefined && (typeof v.address !== 'string' || !/,\s*\d{4}\s+\S/.test(v.address))) errors.push(`${p}.venue.address must read "street, 1110 Morges"`);
    if (v.address === undefined && v.note === undefined) errors.push(`${p}.venue needs an address or a note`);
    if (v.note !== undefined) errors.push(...validateText(v.note, `${p}.venue.note`, { allLanguages: true }));
  }
  if (e && e.registration !== undefined) {
    const r = e.registration || {};
    if (!/^https:\/\//.test(r.url || '')) errors.push(`${p}.registration.url must be https`);
    if (r.until !== undefined && (!isIsoDate(r.until) || r.until > e.startDate)) errors.push(`${p}.registration.until must be a date before the event`);
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
  // the featured event first, then the shortest: a one-evening concert is not hidden behind an exhibition of several weeks
  const days = (e) => Date.parse(e.endDate) - Date.parse(e.startDate);
  return list.filter((e) => isOnDay(e, iso)).sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || days(a) - days(b));
}

/** The next featured event that has not ended, if any. */
export function featuredEvent(list = EVENTS, today = todayInMorges()) {
  return upcomingEvents(list, today).find((e) => e.featured) || null;
}

/** Events that have not ended yet, soonest first. */
export function upcomingEvents(list = EVENTS, today = todayInMorges()) {
  return list.filter((e) => e.endDate >= today).sort((a, b) => a.startDate.localeCompare(b.startDate));
}
