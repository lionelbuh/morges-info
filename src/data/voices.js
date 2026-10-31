import { validateText, isIsoDate } from './schema.js';

/**
 * "Parole aux Morgiens": residents' views, ideas and questions.
 *
 * Messages arrive through the form (prénom + initial, no email) and are sent to
 * the editor by Web3Forms. Nothing is published automatically: a message is
 * added here by hand, after review, in French as written (spelling may be
 * corrected), with an English, German and Italian translation. The editor may
 * remove any message at any time.
 *
 * Each topic is a question opened by the editor. `messages` answer it; each
 * message may have `replies` (one level only). Messages on any other subject
 * go in the topic "libre".
 *
 * Message: { id, name: 'Claire M.', date: 'YYYY-MM-DD', editor?: true, original?: 'en', text: { fr, en, de, it }, replies?: [...] }
 * `original`: the language the message was written in, when not French (shown as "translated from …").
 * The French text is then a translation, published as the page's reference text.
 */
export const VOICE_TOPICS = [
  {
    id: 'coin-prefere',
    opened: '2026-10-31',
    question: {
      fr: 'Quel est votre coin préféré de Morges, et pourquoi ?',
      en: 'What is your favourite spot in Morges, and why?',
      de: 'Was ist Ihr Lieblingsort in Morges, und warum?',
      it: 'Qual è il vostro angolo preferito di Morges, e perché?',
    },
    messages: [
      {
        id: 'chemin-foret-st-prex',
        name: 'Lionel B.',
        date: '2026-10-31',
        editor: true,
        text: {
          fr: 'Le chemin qui part dans la forêt le long du lac en direction de St-Prex est un coin qui me manque beaucoup.',
          en: 'The path that heads into the woods along the lake towards St-Prex is a spot I miss very much.',
          de: 'Der Weg, der am See entlang in den Wald Richtung St-Prex führt, ist ein Ort, den ich sehr vermisse.',
          it: 'Il sentiero che entra nel bosco lungo il lago in direzione di St-Prex è un angolo che mi manca molto.',
        },
      },
      {
        id: 'banc-arbre-grand-rue',
        name: 'Mimo',
        date: '2026-10-31',
        original: 'en',
        text: {
          fr: 'Le banc qui fait le tour du tronc d’arbre, au croisement de la Grand-Rue et de la rue Centrale, devant Manor. Je peux m’y installer toute la journée et oublier le monde.',
          en: 'The seating around the tree trunk at the crossing of Grand-Rue and Rue Centrale, in front of Manor. I can sit there all day and forget about the world.',
          de: 'Die Sitzbank rund um den Baumstamm an der Kreuzung von Grand-Rue und Rue Centrale, vor dem Manor. Dort kann ich den ganzen Tag sitzen und die Welt vergessen.',
          it: 'La panchina intorno al tronco dell’albero, all’incrocio tra la Grand-Rue e la Rue Centrale, davanti a Manor. Posso starci tutto il giorno e dimenticare il mondo.',
        },
      },
    ],
  },
  {
    id: 'ce-qui-manque',
    opened: '2026-10-31',
    question: {
      fr: 'Que manque-t-il à Morges ? Une idée pour rendre la ville encore plus agréable.',
      en: 'What is Morges missing? An idea to make the town even more pleasant.',
      de: 'Was fehlt in Morges? Eine Idee, um die Stadt noch angenehmer zu machen.',
      it: 'Che cosa manca a Morges? Un’idea per rendere la città ancora più piacevole.',
    },
    messages: [
      {
        id: 'activite-dimanche',
        name: 'Mimo',
        date: '2026-10-31',
        original: 'en',
        text: {
          fr: 'Une activité le dimanche. Pas besoin d’un grand événement : peut-être un groupe de musique local ou une association.',
          en: 'Some kind of activity on Sundays. It does not have to be a major event, perhaps a local music band or a community group.',
          de: 'Irgendeine Aktivität am Sonntag. Es muss kein grosser Anlass sein, vielleicht eine lokale Band oder ein Verein.',
          it: 'Qualche attività la domenica. Non deve essere per forza un grande evento: magari una band locale o un’associazione.',
        },
      },
    ],
  },
  {
    id: 'souvenir',
    opened: '2026-10-31',
    question: {
      fr: 'Un souvenir de Morges d’autrefois ?',
      en: 'A memory of Morges in the old days?',
      de: 'Eine Erinnerung an das Morges von früher?',
      it: 'Un ricordo della Morges di una volta?',
    },
    messages: [],
  },
  {
    id: 'libre',
    opened: '2026-10-31',
    free: true,
    question: {
      fr: 'Vos avis, idées et questions',
      en: 'Your views, ideas and questions',
      de: 'Ihre Meinungen, Ideen und Fragen',
      it: 'Le vostre opinioni, idee e domande',
    },
    messages: [
      {
        id: 'marche-noel-parc',
        name: 'Mathieu G.',
        date: '2026-10-31',
        text: {
          fr: 'On a de beaux espaces, comme le parc de l’Indépendance, qui est sous-exploité. Pourquoi faire le marché de Noël dans la cour du château, très serrée, alors qu’on a un bel espace très grand où l’on pourrait faire un magnifique marché de Noël, très attrayant ?',
          en: 'We have beautiful spaces, such as the Parc de l’Indépendance, which is underused. Why hold the Christmas market in the castle courtyard, which is very cramped, when we have a fine, very large space where we could hold a magnificent and really attractive Christmas market?',
          de: 'Wir haben schöne Orte wie den Parc de l’Indépendance, der zu wenig genutzt wird. Warum findet der Weihnachtsmarkt im sehr engen Schlosshof statt, wenn wir einen schönen, sehr grossen Platz haben, auf dem man einen prächtigen und sehr attraktiven Weihnachtsmarkt machen könnte?',
          it: 'Abbiamo begli spazi, come il Parc de l’Indépendance, che è poco sfruttato. Perché fare il mercatino di Natale nel cortile del castello, molto stretto, quando abbiamo un bello spazio molto grande dove si potrebbe fare un magnifico mercatino di Natale, molto attraente?',
        },
      },
    ],
  },
];

/** Limits shared by the form and the checks below. */
export const VOICE_LIMITS = { name: 40, text: 1000 };

/** "Claire M.", "Jean-Marc", "Lionel B." — one first name (hyphens allowed), optionally an initial: never a full name. */
const NAME = /^\p{L}[\p{L}'’-]*(?: \p{L}\.)?$/u;

function validateMessage(m, path, { reply = false } = {}) {
  const errors = [];
  if (!m.id || !/^[a-z0-9-]+$/.test(m.id)) errors.push(`${path}.id must be a slug`);
  if (typeof m.name !== 'string' || !NAME.test(m.name) || m.name.length > VOICE_LIMITS.name) errors.push(`${path}.name must be a first name (+ initial)`);
  if (!isIsoDate(m.date)) errors.push(`${path}.date must be YYYY-MM-DD`);
  if (m.original !== undefined && !['en', 'de', 'it'].includes(m.original)) errors.push(`${path}.original must be en, de or it (French is the default)`);
  errors.push(...validateText(m.text, `${path}.text`, { allLanguages: true }));
  if (m.text && m.text.fr && m.text.fr.length > VOICE_LIMITS.text) errors.push(`${path}.text.fr is longer than ${VOICE_LIMITS.text}`);
  if (reply && m.replies) errors.push(`${path}: replies have no replies (one level only)`);
  (m.replies || []).forEach((r, i) => errors.push(...validateMessage(r, `${path}.replies[${i}]`, { reply: true })));
  return errors;
}

export function validateTopic(topic) {
  const errors = [];
  const path = `voices.${topic.id}`;
  if (!/^[a-z0-9-]+$/.test(topic.id || '')) errors.push(`${path}.id must be a slug`);
  if (!isIsoDate(topic.opened)) errors.push(`${path}.opened must be YYYY-MM-DD`);
  errors.push(...validateText(topic.question, `${path}.question`, { allLanguages: true }));
  if (!Array.isArray(topic.messages)) errors.push(`${path}.messages must be a list`);
  else topic.messages.forEach((m, i) => errors.push(...validateMessage(m, `${path}.messages[${i}]`)));
  return errors;
}

/** Every published message and reply, for counts and unique ids. */
export function allVoiceMessages(topics = VOICE_TOPICS) {
  return topics.flatMap((t) => t.messages.flatMap((m) => [m, ...(m.replies || [])]));
}


/** The most recent published message or reply, with its topic (home page). Null when none is published. */
export function latestVoice(topics = VOICE_TOPICS) {
  const all = topics.flatMap((topic) => topic.messages.flatMap((m) => [m, ...(m.replies || [])].map((message) => ({ message, topic }))));
  // newest date first; on the same day, the one listed last (added last) wins
  return all.reduce((best, item) => (!best || item.message.date >= best.message.date ? item : best), null);
}
