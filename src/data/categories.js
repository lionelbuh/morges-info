/**
 * Point-of-interest categories. Labels are kept in the locale files
 * (key `categories.<id>`), so only the id, colour and icon live here.
 */
export const CATEGORIES = [
  { id: 'heritage', color: '#b3262e', icon: '♜' },
  { id: 'religious', color: '#7a4e9a', icon: '✝' },
  { id: 'streets', color: '#a8692b', icon: '◆' },
  { id: 'lake', color: '#1f6f8b', icon: '≈' },
  { id: 'culture', color: '#2f7d4f', icon: '♪' },
  { id: 'transport', color: '#4a5563', icon: '⇄' },
];

export const CATEGORY_IDS = CATEGORIES.map((c) => c.id);

export function getCategory(id) {
  return CATEGORIES.find((c) => c.id === id);
}
