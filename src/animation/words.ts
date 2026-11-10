import { translations } from '../data/translations'
import type { WordInput } from './layout'

/** Toutes les traductions, plus la phrase saisie (mise en valeur). */
export function allWords(phrase: string): WordInput[] {
  return [...translations.map((t) => ({ text: t.text, dir: t.dir })), { text: phrase, highlight: true }]
}
