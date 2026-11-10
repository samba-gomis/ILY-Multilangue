import { translations } from '../data/translations'
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
