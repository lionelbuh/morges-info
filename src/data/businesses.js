import { validateText, validateSources, validatePhoto, validateOpeningHours, validateCommercial, isIsoDate } from './schema.js';

/**
 * Independent businesses in the commune of Morges, listed free of charge.
 *
 * Add an entry only after verifying it — never from guesswork or scraped
 * directories — and publish photos only with the business's agreement.
 *
 * Shape of an entry (see docs/CONTENT.md for a full example):
 * {
 *   id: 'kebab-case-id',
 *   name: 'Nom officiel',
 *   category: 'health' | 'food' | 'shops' | 'services' | 'animals',
 *   person?: 'Prénom Nom',                          // who runs it, when it is one person
 *   address: 'Rue …, 1110 Morges',                  // or, for home visits only, serviceArea instead
 *   serviceArea?: { fr, en, de, it },              // where they come to you (based in Morges)
 *   phone?: '+41 xx xxx xx xx',
 *   email?: 'name@domain.ch',                       // shown entity-encoded
 *   coordinates: { lat, lng } | null,
 *   description: { fr: '…', en?, de?, it? },     // written by the editors: one or two sentences
 *   services?: [{ title: {…}, text: {…} }],       // what they offer, summarised by the editors
 *   about?: {…},                                     // background, training, labels
 *   note?: {…},                                      // e.g. "does not replace medical advice"
 *   notice?: { text: {…}, until: 'YYYY-MM-DD' },     // temporary notice, hidden after `until`
 *   website: 'https://…' | null,
 *   instagram?: 'https://www.instagram.com/…/',
 *   facebook?: 'https://www.facebook.com/…',
 *   openingHours: null | { text: { fr }, sources, lastVerified },
 *   photos: [],                                     // Photo, see schema.js; several → gallery
 *   sources: [{ label, url }],
 *   lastVerified: 'YYYY-MM-DD',
 *   editorial: { selected: true },                  // editors' choice — cannot be bought
 *   commercial: { status: 'none' },                 // future: 'enhanced' | 'sponsored'
 * }
 */
export const BUSINESS_CATEGORIES = ['health', 'food', 'shops', 'services', 'animals'];

export const BUSINESSES = [
  {
    id: 'amandine-reflexologie',
    name: 'Amandine Réflexologie',
    category: 'health',
    address: 'Rue Louis-de-Savoie 29, 1110 Morges',
    addressNote: 'Espace Anahata',
    phone: '+41 78 606 20 81',
    email: 'info@amandinereflexologie.ch',
    coordinates: null,
    description: {
      fr: 'Thérapeute en réflexologie à l’Espace Anahata : réflexologie thérapeutique et préventive (diverses méthodes), drainage lymphatique et massage métamorphique par voies réflexes, massage du visage et Reiki. Reconnue ASCA et RME, certificat de branche OrTra TC.',
      en: 'Reflexology therapist at Espace Anahata: therapeutic and preventive reflexology (various methods), lymphatic drainage and metamorphic massage through reflex zones, facial massage and Reiki. Recognised by ASCA and RME, OrTra TC branch certificate.',
      de: 'Reflexologie-Therapeutin im Espace Anahata: therapeutische und präventive Reflexzonentherapie (verschiedene Methoden), Lymphdrainage und Metamorphose-Massage über Reflexzonen, Gesichtsmassage und Reiki. Von ASCA und EMR anerkannt, Branchenzertifikat OdA KT.',
      it: 'Terapeuta di riflessologia all’Espace Anahata: riflessologia terapeutica e preventiva (diversi metodi), linfodrenaggio e massaggio metamorfico per vie riflesse, massaggio del viso e Reiki. Riconosciuta ASCA e RME, certificato di settore OrTra TC.',
    },
    services: [
      {
        title: {
          fr: 'Réflexologie',
          en: 'Reflexology',
          de: 'Reflexzonentherapie',
          it: 'Riflessologia',
        },
        text: {
          fr: 'Un massage par pressions sur des zones réflexes des pieds, des mains ou du visage, chacune associée à une partie du corps. Les zones sont choisies selon votre demande, à but thérapeutique ou préventif.',
          en: 'A massage using pressure on reflex zones of the feet, hands or face, each linked to a part of the body. The zones are chosen according to your needs, for therapeutic or preventive purposes.',
          de: 'Eine Massage mit gezieltem Druck auf Reflexzonen an Füssen, Händen oder Gesicht, die jeweils einem Körperteil zugeordnet sind. Die Zonen werden nach Ihrem Anliegen gewählt, therapeutisch oder vorbeugend.',
          it: 'Un massaggio con pressioni su zone riflesse dei piedi, delle mani o del viso, ognuna collegata a una parte del corpo. Le zone sono scelte secondo la vostra richiesta, a scopo terapeutico o preventivo.',
        },
      },
      {
        title: {
          fr: 'Reiki',
          en: 'Reiki',
          de: 'Reiki',
          it: 'Reiki',
        },
        text: {
          fr: 'Une méthode japonaise de soin énergétique par imposition des mains (« rei » : universel, « ki » : énergie vitale), pour favoriser le bien-être. Elle peut compléter d’autres approches, conventionnelles ou alternatives.',
          en: 'A Japanese method of energy healing by laying on of hands (“rei”: universal, “ki”: life energy), to promote well-being. It can complement other approaches, conventional or alternative.',
          de: 'Eine japanische Methode der Energiearbeit durch Handauflegen («Rei»: universell, «Ki»: Lebensenergie), die das Wohlbefinden fördern soll. Sie kann andere, schulmedizinische oder alternative Ansätze ergänzen.',
          it: 'Un metodo giapponese di trattamento energetico con l’imposizione delle mani («rei»: universale, «ki»: energia vitale), per favorire il benessere. Può completare altri approcci, convenzionali o alternativi.',
        },
      },
      {
        title: {
          fr: 'Autres soins',
          en: 'Other treatments',
          de: 'Weitere Behandlungen',
          it: 'Altri trattamenti',
        },
        text: {
          fr: 'Drainage lymphatique et massage métamorphique par voies réflexes, massage du visage.',
          en: 'Lymphatic drainage and metamorphic massage through reflex zones, facial massage.',
          de: 'Lymphdrainage und Metamorphose-Massage über Reflexzonen, Gesichtsmassage.',
          it: 'Linfodrenaggio e massaggio metamorfico per vie riflesse, massaggio del viso.',
        },
      },
    ],
    note: {
      fr: 'Ces soins ne remplacent en aucun cas un avis ni un traitement médical.',
      en: 'These treatments never replace medical advice or treatment.',
      de: 'Diese Behandlungen ersetzen in keinem Fall eine ärztliche Beratung oder Behandlung.',
      it: 'Questi trattamenti non sostituiscono in alcun caso un parere né un trattamento medico.',
    },
    website: 'https://amandinereflexologie.ch/',
    instagram: 'https://www.instagram.com/amandinereflexologie/',
    openingHours: null,
    photos: [
      {
        src: '/images/businesses/amandine-reflexologie-pied.webp',
        width: 1200,
        height: 1600,
        alt: {
          fr: 'Réflexologie plantaire : les mains de la thérapeute sur le pied d’une personne, posé sur une serviette bleue',
          en: 'Foot reflexology: the therapist’s hands on a person’s foot, resting on a blue towel',
          de: 'Fussreflexzonenmassage: die Hände der Therapeutin am Fuss einer Person, auf einem blauen Tuch',
          it: 'Riflessologia plantare: le mani della terapeuta sul piede di una persona, appoggiato su un asciugamano blu',
        },
        credit: 'Amandine Réflexologie',
        licence: 'Tous droits réservés, publié avec l’accord d’Amandine Réflexologie (02.11.2026)',
      },
      {
        src: '/images/businesses/amandine-reflexologie-salle-de-soins.webp',
        width: 1200,
        height: 900,
        alt: {
          fr: 'Salle de soins d’Amandine Réflexologie : table de soins, attrape-rêves, plantes et fenêtre aux voilages blancs',
          en: 'Amandine Réflexologie’s treatment room: treatment table, dreamcatchers, plants and a window with white curtains',
          de: 'Behandlungsraum von Amandine Réflexologie: Behandlungsliege, Traumfänger, Pflanzen und Fenster mit weissen Vorhängen',
          it: 'Sala trattamenti di Amandine Réflexologie: lettino, acchiappasogni, piante e finestra con tende bianche',
        },
        credit: 'Amandine Réflexologie',
        licence: 'Tous droits réservés, publié avec l’accord d’Amandine Réflexologie (28.10.2026)',
      },
      {
        src: '/images/businesses/amandine-reflexologie-flyer.webp',
        width: 901,
        height: 714,
        alt: {
          fr: 'Flyer d’Amandine Réflexologie : réflexologie, drainage lymphatique, massage métamorphique, massage du visage, Reiki',
          en: 'Amandine Réflexologie flyer: reflexology, lymphatic drainage, metamorphic massage, facial massage, Reiki',
          de: 'Flyer von Amandine Réflexologie: Reflexzonentherapie, Lymphdrainage, Metamorphose-Massage, Gesichtsmassage, Reiki',
          it: 'Volantino di Amandine Réflexologie: riflessologia, linfodrenaggio, massaggio metamorfico, massaggio del viso, Reiki',
        },
        credit: 'Amandine Réflexologie',
        licence: 'Tous droits réservés, publié avec l’accord d’Amandine Réflexologie (28.10.2026)',
      },
      {
        src: '/images/businesses/amandine-reflexologie-cabinet.webp',
        width: 1200,
        height: 900,
        alt: {
          fr: 'Le cabinet en soirée : table de soins, bureau et chaises, miroirs dorés au mur',
          en: 'The practice in the evening: treatment table, desk and chairs, golden mirrors on the wall',
          de: 'Die Praxis am Abend: Behandlungsliege, Schreibtisch und Stühle, goldene Spiegel an der Wand',
          it: 'Lo studio la sera: lettino, scrivania e sedie, specchi dorati alla parete',
        },
        credit: 'Amandine Réflexologie',
        licence: 'Tous droits réservés, publié avec l’accord d’Amandine Réflexologie (28.10.2026)',
      },
      {
        src: '/images/businesses/amandine-reflexologie-salle-attente.webp',
        width: 900,
        height: 1200,
        alt: {
          fr: 'Salle d’attente sous les toits, avec fauteuils en rotin et fenêtre donnant sur le lac',
          en: 'Waiting room under the roof, with rattan chairs and a window overlooking the lake',
          de: 'Wartezimmer unter dem Dach, mit Rattanstühlen und Fenster mit Blick auf den See',
          it: 'Sala d’attesa sotto il tetto, con poltrone in rattan e finestra sul lago',
        },
        credit: 'Amandine Réflexologie',
        licence: 'Tous droits réservés, publié avec l’accord d’Amandine Réflexologie (28.10.2026)',
      },
    ],
    sources: [
      { label: 'Amandine Réflexologie — site web', url: 'https://amandinereflexologie.ch/' },
      { label: 'Morges.info — informations et flyer transmis par Amandine Réflexologie (28.10.2026), présentation des soins (02.11.2026)' },
    ],
    lastVerified: '2026-11-02',
    editorial: { selected: true },
    commercial: { status: 'none' },
  },
  {
    id: 'luckycats',
    name: 'Luckycats',
    person: 'Estelle Franzone',
    category: 'animals',
    serviceArea: {
      fr: 'À domicile : Morges et environs (Etoy, Buchillon, Apples, Préverenges, Lonay…). Demandez si votre région est desservie.',
      en: 'At your home: Morges and surroundings (Etoy, Buchillon, Apples, Préverenges, Lonay…). Ask whether your area is covered.',
      de: 'Bei Ihnen zu Hause: Morges und Umgebung (Etoy, Buchillon, Apples, Préverenges, Lonay…). Fragen Sie, ob Ihre Gegend abgedeckt ist.',
      it: 'A domicilio: Morges e dintorni (Etoy, Buchillon, Apples, Préverenges, Lonay…). Chiedete se la vostra zona è servita.',
    },
    phone: '+41 76 384 01 37',
    email: 'contact@luckycats.ch',
    coordinates: null,
    description: {
      fr: 'Cat sitter et comportementaliste chat (non vétérinaire) basée à Morges. Estelle Franzone s’occupe de chats depuis plus de 30 ans et vient chez vous.',
      en: 'Cat sitter and cat behaviourist (non-veterinary) based in Morges. Estelle Franzone has been caring for cats for over 30 years and comes to your home.',
      de: 'Katzensitterin und Katzenverhaltensberaterin (keine Tierärztin) mit Sitz in Morges. Estelle Franzone betreut seit über 30 Jahren Katzen und kommt zu Ihnen nach Hause.',
      it: 'Cat sitter e comportamentalista felina (non veterinaria) con sede a Morges. Estelle Franzone si occupa di gatti da oltre 30 anni e viene a casa vostra.',
    },
    services: [
      {
        title: {
          fr: 'Cat sitting',
          en: 'Cat sitting',
          de: 'Katzensitting',
          it: 'Cat sitting',
        },
        text: {
          fr: 'Des visites à domicile pendant votre absence : soins quotidiens, câlins et, si besoin, médicaments, brossage ou trajet d’urgence chez votre vétérinaire. Les habitudes de votre chat sont respectées et vous recevez régulièrement de ses nouvelles par message. Les autres petits compagnons (poissons, rongeurs, oiseaux…) sont aussi pris en charge.',
          en: 'Home visits while you are away: daily care, cuddles and, if needed, medication, brushing or an emergency trip to your vet. Your cat’s routine is respected and you regularly get news by message. Other small companions (fish, rodents, birds…) are looked after too.',
          de: 'Hausbesuche während Ihrer Abwesenheit: tägliche Pflege, Streicheleinheiten und bei Bedarf Medikamente, Bürsten oder eine Notfallfahrt zu Ihrer Tierärztin oder Ihrem Tierarzt. Die Gewohnheiten Ihrer Katze werden respektiert, und Sie erhalten regelmässig Nachrichten. Auch andere kleine Mitbewohner (Fische, Nager, Vögel…) werden versorgt.',
          it: 'Visite a domicilio durante la vostra assenza: cure quotidiane, coccole e, se necessario, medicine, spazzolatura o un trasporto urgente dal vostro veterinario. Le abitudini del gatto vengono rispettate e ricevete regolarmente sue notizie per messaggio. Anche gli altri piccoli compagni (pesci, roditori, uccelli…) vengono accuditi.',
        },
      },
      {
        title: {
          fr: 'Comportementaliste chat (non vétérinaire)',
          en: 'Cat behaviourist (non-veterinary)',
          de: 'Katzenverhaltensberaterin (keine Tierärztin)',
          it: 'Comportamentalista felina (non veterinaria)',
        },
        text: {
          fr: 'Une consultation à domicile d’environ 2 h 30, si possible avec toutes les personnes du foyer : observation du lieu de vie et conseils pour comprendre votre chat, apaiser les comportements gênants (besoins hors bac, agressivité, cohabitation difficile) ou préparer un changement (bébé, nouveau conjoint, déménagement). Elle ne remplace pas un vétérinaire.',
          en: 'A home consultation of about 2½ hours, ideally with everyone in the household: a look at the cat’s surroundings and advice to understand your cat, calm troublesome behaviour (soiling outside the litter box, aggression, difficult cohabitation) or prepare for a change (a baby, a new partner, a move). It does not replace a vet.',
          de: 'Eine Beratung bei Ihnen zu Hause von etwa 2½ Stunden, wenn möglich mit allen Personen im Haushalt: Beobachtung des Lebensraums und Ratschläge, um Ihre Katze zu verstehen, störendes Verhalten zu beruhigen (Unsauberkeit, Aggressivität, schwieriges Zusammenleben) oder eine Veränderung vorzubereiten (Baby, neue Partnerin oder neuer Partner, Umzug). Sie ersetzt keinen Tierarzt.',
          it: 'Una consulenza a domicilio di circa 2 ore e mezza, se possibile con tutte le persone della casa: osservazione dell’ambiente e consigli per capire il vostro gatto, calmare i comportamenti fastidiosi (bisogni fuori dalla lettiera, aggressività, convivenza difficile) o preparare un cambiamento (un bebè, un nuovo partner, un trasloco). Non sostituisce il veterinario.',
        },
      },
    ],
    about: {
      fr: 'Passionnée par le monde félin, Estelle garde des chats depuis plus de 30 ans. Diplômée comportementaliste chat (non vétérinaire) en 2018, elle a aussi formé des cat sitters professionnels de 2021 à 2026. Luckycats est membre du collectif Catus (consultants en comportement) depuis 2020 et labellisé pour le cat sitting par Qualipet Sitting depuis 2023.',
      en: 'Passionate about cats, Estelle has been looking after them for over 30 years. She qualified as a cat behaviourist (non-veterinary) in 2018 and trained professional cat sitters from 2021 to 2026. Luckycats has been a member of the Catus collective (behaviour consultants) since 2020 and holds the Qualipet Sitting label for cat sitting since 2023.',
      de: 'Estelle ist eine leidenschaftliche Katzenfreundin und betreut seit über 30 Jahren Katzen. 2018 erhielt sie ihr Diplom als Katzenverhaltensberaterin (keine Tierärztin), und von 2021 bis 2026 bildete sie professionelle Katzensitter aus. Luckycats ist seit 2020 Mitglied des Kollektivs Catus (Verhaltensberatung) und seit 2023 von Qualipet Sitting für das Katzensitting zertifiziert.',
      it: 'Appassionata del mondo felino, Estelle si occupa di gatti da oltre 30 anni. Diplomata comportamentalista felina (non veterinaria) nel 2018, ha anche formato cat sitter professionisti dal 2021 al 2026. Luckycats è membro del collettivo Catus (consulenti del comportamento) dal 2020 ed è certificata per il cat sitting da Qualipet Sitting dal 2023.',
    },
    website: 'https://www.luckycats.ch/',
    instagram: 'https://www.instagram.com/luckycatslesheureuxchats/',
    facebook: 'https://www.facebook.com/profile.php?id=100039481723383',
    openingHours: null,
    photos: [
      {
        src: '/images/businesses/luckycats-estelle-franzone.webp',
        width: 450,
        height: 675,
        alt: {
          fr: 'Estelle Franzone, de Luckycats, souriante, avec des lunettes roses',
          en: 'Estelle Franzone of Luckycats, smiling, wearing pink glasses',
          de: 'Estelle Franzone von Luckycats, lächelnd, mit rosa Brille',
          it: 'Estelle Franzone di Luckycats, sorridente, con occhiali rosa',
        },
        credit: 'Luckycats',
        licence: 'Tous droits réservés, publié avec l’accord de Luckycats (02.11.2026)',
      },
      {
        src: '/images/businesses/luckycats-chat-bengal.webp',
        width: 828,
        height: 1600,
        alt: {
          fr: 'Un chat bengal tacheté assis sur un arbre à chat, qui regarde l’objectif',
          en: 'A spotted Bengal cat sitting on a cat tree, looking at the camera',
          de: 'Eine gefleckte Bengalkatze sitzt auf einem Kratzbaum und blickt in die Kamera',
          it: 'Un gatto bengala maculato seduto su un tiragraffi, che guarda l’obiettivo',
        },
        credit: 'Luckycats',
        licence: 'Tous droits réservés, publié avec l’accord de Luckycats (03.11.2026)',
      },
      {
        src: '/images/businesses/luckycats-chat-blanc.webp',
        width: 1200,
        height: 1561,
        alt: {
          fr: 'Un chat blanc à poils longs dressé sur ses pattes arrière, jouant avec un jouet vert',
          en: 'A long-haired white cat standing on its hind legs, playing with a green toy',
          de: 'Eine weisse Langhaarkatze steht auf den Hinterbeinen und spielt mit einem grünen Spielzeug',
          it: 'Un gatto bianco a pelo lungo in piedi sulle zampe posteriori, che gioca con un giocattolo verde',
        },
        credit: 'Luckycats',
        licence: 'Tous droits réservés, publié avec l’accord de Luckycats (03.11.2026)',
      },
      {
        src: '/images/businesses/luckycats-deux-chats.webp',
        width: 1200,
        height: 1313,
        alt: {
          fr: 'Deux chats sur un rebord de fenêtre : un tigré gris devant, un chat noir derrière',
          en: 'Two cats on a windowsill: a grey tabby in front, a black cat behind',
          de: 'Zwei Katzen auf einem Fenstersims: vorne eine graue Tigerkatze, dahinter eine schwarze Katze',
          it: 'Due gatti sul davanzale: un tigrato grigio davanti, un gatto nero dietro',
        },
        credit: 'Luckycats',
        licence: 'Tous droits réservés, publié avec l’accord de Luckycats (03.11.2026)',
      },
      {
        src: '/images/businesses/luckycats-chat-tigre.webp',
        width: 1200,
        height: 800,
        alt: {
          fr: 'Gros plan sur le visage d’un chat tigré aux yeux verts',
          en: 'Close-up of the face of a tabby cat with green eyes',
          de: 'Nahaufnahme des Gesichts einer Tigerkatze mit grünen Augen',
          it: 'Primo piano del muso di un gatto tigrato dagli occhi verdi',
        },
        credit: 'Luckycats',
        licence: 'Tous droits réservés, publié avec l’accord de Luckycats (03.11.2026)',
      },
      {
        src: '/images/businesses/luckycats-annonce.webp',
        width: 1167,
        height: 603,
        alt: {
          fr: 'Annonce Luckycats, avec les yeux d’un chat tigré : « Comportementaliste félin. Votre chat présente des comportements gênants ou inhabituels ? Conduites agressives, élimination hors bac, cohabitation, stress, etc. Solutions adaptées pour un chat serein et un foyer apaisé. Estelle Franzone, 076 384 01 37, www.luckycats.ch. Cat sitter (plus de 30 ans d’expérience). Partez l’esprit tranquille ! Visites à domicile pour chats et petits animaux. Bien-être animal, confiance, professionnalisme. »',
          en: 'Luckycats advertisement, with the eyes of a tabby cat (in French): “Cat behaviourist. Is your cat showing troublesome or unusual behaviour? Aggression, soiling outside the litter box, cohabitation, stress, etc. Tailored solutions for a serene cat and a peaceful home. Estelle Franzone, 076 384 01 37, www.luckycats.ch. Cat sitter (over 30 years of experience). Leave with peace of mind! Home visits for cats and small animals. Animal welfare, trust, professionalism.”',
          de: 'Anzeige von Luckycats mit den Augen einer Tigerkatze (auf Französisch): «Katzenverhaltensberaterin. Zeigt Ihre Katze störendes oder ungewöhnliches Verhalten? Aggressivität, Unsauberkeit, Zusammenleben, Stress usw. Passende Lösungen für eine gelassene Katze und ein ruhiges Zuhause. Estelle Franzone, 076 384 01 37, www.luckycats.ch. Katzensitterin (über 30 Jahre Erfahrung). Verreisen Sie beruhigt! Besuche zu Hause für Katzen und Kleintiere. Tierwohl, Vertrauen, Professionalität.»',
          it: 'Annuncio di Luckycats, con gli occhi di un gatto tigrato (in francese): «Comportamentalista felina. Il vostro gatto ha comportamenti fastidiosi o insoliti? Aggressività, bisogni fuori dalla lettiera, convivenza, stress, ecc. Soluzioni su misura per un gatto sereno e una casa tranquilla. Estelle Franzone, 076 384 01 37, www.luckycats.ch. Cat sitter (oltre 30 anni di esperienza). Partite tranquilli! Visite a domicilio per gatti e piccoli animali. Benessere animale, fiducia, professionalità.»',
        },
        credit: 'Luckycats',
        licence: 'Tous droits réservés, publié avec l’accord de Luckycats (03.11.2026)',
      },
    ],
    sources: [
      { label: 'Luckycats — site web', url: 'https://www.luckycats.ch/' },
      { label: 'Morges.info — informations et photos transmises par Luckycats, avec son accord (02–03.11.2026)' },
    ],
    lastVerified: '2026-11-03',
    editorial: { selected: true },
    commercial: { status: 'none' },
  },
  {
    id: 'chez-loubna',
    name: 'Chez Loubna',
    category: 'food',
    address: 'Grand-Rue 31, 1110 Morges',
    coordinates: null,
    description: {
      fr: 'Cuisine marocaine maison au cœur de Morges, sur place ou à emporter : couscous, tajines, pastillas, harira, pâtisseries orientales et thé marocain.',
      en: 'Home-made Moroccan cooking in the heart of Morges, to eat in or take away: couscous, tagines, pastillas, harira, oriental pastries and Moroccan tea.',
      de: 'Hausgemachte marokkanische Küche im Herzen von Morges, vor Ort oder zum Mitnehmen: Couscous, Tajines, Pastillas, Harira, orientalisches Gebäck und marokkanischer Tee.',
      it: 'Cucina marocchina fatta in casa nel cuore di Morges, sul posto o da asporto: cuscus, tajine, pastille, harira, dolci orientali e tè marocchino.',
    },
    services: [
      {
        title: { fr: 'Sur place ou à emporter', en: 'Eat in or take away', de: 'Vor Ort oder zum Mitnehmen', it: 'Sul posto o da asporto' },
        text: {
          fr: 'Couscous, tajines, pastillas et autres spécialités marocaines, avec une cuisine ouverte en continu aux heures d’ouverture.',
          en: 'Couscous, tagines, pastillas and other Moroccan specialities, with the kitchen open throughout opening hours.',
          de: 'Couscous, Tajines, Pastillas und weitere marokkanische Spezialitäten, mit durchgehend warmer Küche während der Öffnungszeiten.',
          it: 'Cuscus, tajine, pastille e altre specialità marocchine, con la cucina aperta senza interruzione durante l’orario di apertura.',
        },
      },
      {
        title: { fr: 'Douceurs et thé', en: 'Sweets and tea', de: 'Süsses und Tee', it: 'Dolci e tè' },
        text: {
          fr: 'Pâtisseries orientales et thé marocain, à déguster sur place ou à emporter.',
          en: 'Oriental pastries and Moroccan tea, to enjoy on the spot or take away.',
          de: 'Orientalisches Gebäck und marokkanischer Tee, vor Ort oder zum Mitnehmen.',
          it: 'Dolci orientali e tè marocchino, da gustare sul posto o da portare via.',
        },
      },
    ],
    about: {
      fr: 'Une cuisine familiale, généreuse et préparée avec soin, aux saveurs traditionnelles et aux épices parfumées, servie avec le sourire dans une adresse conviviale de la Grand-Rue.',
      en: 'Generous family cooking, carefully prepared, with traditional flavours and fragrant spices, served with a smile at a friendly address on the Grand-Rue.',
      de: 'Grosszügige, sorgfältig zubereitete Familienküche mit traditionellen Aromen und duftenden Gewürzen, mit einem Lächeln serviert an einer gemütlichen Adresse an der Grand-Rue.',
      it: 'Una cucina di famiglia generosa e preparata con cura, dai sapori tradizionali e dalle spezie profumate, servita con il sorriso in un indirizzo accogliente della Grand-Rue.',
    },
    website: 'https://chezloubna.ch/',
    openingHours: {
      text: {
        fr: ['Lundi : 10 h 30 – 18 h 30', 'Mardi, mercredi, jeudi et samedi : 9 h 30 – 18 h 30', 'Vendredi : 9 h 30 – 14 h 30 et 18 h – 22 h', 'Dimanche : fermé'],
        en: ['Monday: 10:30–18:30', 'Tuesday, Wednesday, Thursday and Saturday: 9:30–18:30', 'Friday: 9:30–14:30 and 18:00–22:00', 'Sunday: closed'],
        de: ['Montag: 10.30–18.30 Uhr', 'Dienstag, Mittwoch, Donnerstag und Samstag: 9.30–18.30 Uhr', 'Freitag: 9.30–14.30 und 18–22 Uhr', 'Sonntag: geschlossen'],
        it: ['Lunedì: 10.30–18.30', 'Martedì, mercoledì, giovedì e sabato: 9.30–18.30', 'Venerdì: 9.30–14.30 e 18–22', 'Domenica: chiuso'],
      },
      sources: [{ label: 'Morges.info — horaires transmis par Chez Loubna (06.11.2026)' }],
      lastVerified: '2026-11-06',
    },
    photos: [
      {
        src: '/images/businesses/chez-loubna-vitrine.webp',
        width: 1200,
        height: 675,
        alt: {
          fr: 'La vitrine de Chez Loubna, avec des lanternes, des plats en céramique peints et l’inscription « Cuisine marocaine sur place ou à emporter »',
          en: 'The window of Chez Loubna, with lanterns, painted ceramic plates and the words “Moroccan cooking, eat in or take away”',
          de: 'Das Schaufenster von Chez Loubna mit Laternen, bemalten Keramiktellern und der Aufschrift «Marokkanische Küche, vor Ort oder zum Mitnehmen»',
          it: 'La vetrina di Chez Loubna, con lanterne, piatti di ceramica dipinti e la scritta «Cucina marocchina sul posto o da asporto»',
        },
        credit: 'Chez Loubna',
        licence: 'Tous droits réservés, publié avec l’accord de Chez Loubna (06.11.2026)',
      },
      {
        src: '/images/businesses/chez-loubna-tajine.webp',
        width: 1086,
        height: 1448,
        alt: {
          fr: 'Un tajine aux pruneaux, abricots secs et graines de sésame, dans un plat en terre peint en bleu',
          en: 'A tagine with prunes, dried apricots and sesame seeds, in a blue painted earthenware dish',
          de: 'Eine Tajine mit Dörrpflaumen, getrockneten Aprikosen und Sesam in einer blau bemalten Tonschale',
          it: 'Un tajine con prugne secche, albicocche secche e semi di sesamo, in un piatto di terracotta dipinto di blu',
        },
        credit: 'Chez Loubna',
        licence: 'Tous droits réservés, publié avec l’accord de Chez Loubna (06.11.2026)',
      },
      {
        src: '/images/businesses/chez-loubna-couscous.webp',
        width: 901,
        height: 1600,
        alt: {
          fr: 'Deux grands plats de couscous aux légumes, pois chiches et oignons caramélisés aux raisins secs, en cuisine',
          en: 'Two large dishes of couscous with vegetables, chickpeas and caramelised onions with raisins, in the kitchen',
          de: 'Zwei grosse Platten Couscous mit Gemüse, Kichererbsen und karamellisierten Zwiebeln mit Rosinen, in der Küche',
          it: 'Due grandi piatti di cuscus con verdure, ceci e cipolle caramellate con uvetta, in cucina',
        },
        credit: 'Chez Loubna',
        licence: 'Tous droits réservés, publié avec l’accord de Chez Loubna (06.11.2026)',
      },
      {
        src: '/images/businesses/chez-loubna-logo.webp',
        width: 720,
        height: 720,
        alt: {
          fr: 'Le logo de Chez Loubna, cuisine marocaine, Grande Rue 31 à Morges',
          en: 'The logo of Chez Loubna, Moroccan cooking, Grande Rue 31 in Morges',
          de: 'Das Logo von Chez Loubna, marokkanische Küche, Grande Rue 31 in Morges',
          it: 'Il logo di Chez Loubna, cucina marocchina, Grande Rue 31 a Morges',
        },
        credit: 'Chez Loubna',
        licence: 'Tous droits réservés, publié avec l’accord de Chez Loubna (06.11.2026)',
      },
    ],
    sources: [
      { label: 'Chez Loubna — site web', url: 'https://chezloubna.ch/' },
      { label: 'Morges.info — informations et photos transmises par Chez Loubna, avec son accord (06.11.2026)' },
    ],
    lastVerified: '2026-11-06',
    editorial: { selected: true },
    commercial: { status: 'none' },
  },
];

/** Bounding box of the commune (generous): businesses must be inside Morges. */
const MORGES_BBOX = { minLat: 46.495, maxLat: 46.53, minLng: 6.46, maxLng: 6.53 };

export function validateBusiness(b, opts = {}) {
  const p = `business(${b && b.id})`;
  const errors = [];
  if (!b || typeof b.id !== 'string' || !/^[a-z0-9-]+$/.test(b.id)) errors.push(`${p}.id must be kebab-case`);
  if (!b || typeof b.name !== 'string' || !b.name.trim()) errors.push(`${p}.name is required`);
  if (!b || !BUSINESS_CATEGORIES.includes(b.category)) errors.push(`${p}.category is invalid`);
  if (b && b.serviceArea !== undefined) {
    // home visits only: no public address, but the business is based in Morges
    if (b.address !== undefined) errors.push(`${p}: give either an address or a serviceArea, not both`);
    errors.push(...validateText(b.serviceArea, `${p}.serviceArea`, { allLanguages: true }));
  } else if (!b || typeof b.address !== 'string' || !/1110 Morges/.test(b.address)) errors.push(`${p}.address must be in 1110 Morges`);
  if (b && b.person !== undefined && (typeof b.person !== 'string' || !b.person.trim())) errors.push(`${p}.person must be a name`);
  (b && b.services ? b.services : []).forEach((sv, i) => {
    errors.push(...validateText(sv && sv.title, `${p}.services[${i}].title`, { allLanguages: true }));
    errors.push(...validateText(sv && sv.text, `${p}.services[${i}].text`, { allLanguages: true }));
  });
  for (const key of ['about', 'note']) if (b && b[key] !== undefined) errors.push(...validateText(b[key], `${p}.${key}`, { allLanguages: true }));
  if (b && b.notice !== undefined) {
    errors.push(...validateText(b.notice.text, `${p}.notice.text`, { allLanguages: true }));
    if (!isIsoDate(b.notice.until)) errors.push(`${p}.notice.until must be YYYY-MM-DD`);
  }
  if (b && b.phone !== undefined && !/^\+41 \d{2} \d{3} \d{2} \d{2}$/.test(b.phone)) errors.push(`${p}.phone must look like +41 21 123 45 67`);
  if (b && b.email !== undefined && !/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(b.email)) errors.push(`${p}.email is invalid`);
  if (b && b.coordinates) {
    const { lat, lng } = b.coordinates;
    if (!(lat > MORGES_BBOX.minLat && lat < MORGES_BBOX.maxLat && lng > MORGES_BBOX.minLng && lng < MORGES_BBOX.maxLng)) {
      errors.push(`${p}.coordinates are outside Morges`);
    }
  }
  errors.push(...validateText(b && b.description, `${p}.description`));
  if (b && b.website !== null && !/^https:\/\//.test(b.website || '')) errors.push(`${p}.website must be https or null`);
  if (b && b.instagram !== undefined && !/^https:\/\/www\.instagram\.com\/[\w.]+\/?$/.test(b.instagram)) errors.push(`${p}.instagram must be an instagram.com profile address`);
  if (b && b.facebook !== undefined && !/^https:\/\/www\.facebook\.com\/(profile\.php\?id=\d+|[\w.-]+\/?)$/.test(b.facebook)) errors.push(`${p}.facebook must be a facebook.com page address`);
  errors.push(...validateOpeningHours(b && b.openingHours, `${p}.openingHours`));
  (b && b.photos ? b.photos : []).forEach((photo, i) => errors.push(...validatePhoto(photo, `${p}.photos[${i}]`)));
  errors.push(...validateSources(b && b.sources, `${p}.sources`));
  if (!b || !isIsoDate(b.lastVerified)) errors.push(`${p}.lastVerified must be YYYY-MM-DD`);
  if (!b || !b.editorial || typeof b.editorial.selected !== 'boolean') errors.push(`${p}.editorial.selected is required`);
  errors.push(...validateCommercial(b && b.commercial, `${p}.commercial`, opts));
  return errors;
}

/** The temporary notice of a business, while it is current (today = YYYY-MM-DD in Morges). */
export function activeNotice(b, today) {
  return b.notice && today <= b.notice.until ? b.notice : null;
}

/** Entries shown in the editorial selection (sponsored entries are never part of it). */
export function editorialSelection(list = BUSINESSES) {
  return list.filter((b) => b.editorial && b.editorial.selected && b.commercial.status !== 'sponsored');
}
