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
 * Message: { id, name: 'Claire M.', date: 'YYYY-MM-DD', editor?: true, text: { fr, en, de, it }, replies?: [...] }
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
    messages: [],
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
    messages: [],
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
    messages: [],
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

