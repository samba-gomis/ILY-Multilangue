import { translations, type Translation } from '../data/translations'
import type { WordInput } from './layout'

/** Langues qui ne doivent jamais manquer dans le cœur. */
const PRIORITY = new Set(['wo'])

/** Toutes les traductions, plus la phrase saisie (mise en valeur). */
export function allWords(phrase: string): WordInput[] {
  return [
    ...translations.map((t) => ({ text: t.text, dir: t.dir, ...(PRIORITY.has(t.lang) ? { priority: true } : {}) })),
    { text: phrase, highlight: true },
  ]
}

/** Ordre du défilement : le français, puis le wolof, puis toutes les autres langues. */
export function paradeOrder(): Translation[] {
  const first = translations.filter((t) => t.lang === 'fr')
  const wolof = translations.filter((t) => t.lang === 'wo')
  const rest = translations.filter((t) => t.lang !== 'fr' && t.lang !== 'wo')
  return [...first, ...wolof, ...rest]
}
