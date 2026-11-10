import { translations } from '../data/translations'
import { isInsideHeart } from './heartShape'
import { layoutWords, type Measure, type WordInput } from './layout'
import type { Box } from './types'

const measure: Measure = (t, s) => [...t].length * s * 0.6

const words = (phrase = "Je t'aime ❤️"): WordInput[] => [
  ...translations.map((t) => ({ text: t.text, dir: t.dir })),
  { text: phrase, highlight: true },
]

type Rect = { x: number; y: number; width: number; height: number }
const rectOf = (p: { x: number; y: number; size: number; text: string }): Rect => ({
  x: p.x,
  y: p.y - p.size,
  width: measure(p.text, p.size),
  height: p.size,
})
const intersects = (a: Rect, b: Rect) =>
  a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height

const viewports: [string, Box][] = [
  ['390×844', { width: 390, height: 844 }],
  ['1440×900', { width: 1440, height: 900 }],
  ['667×375', { width: 667, height: 375 }],
]

describe.each(viewports)('en %s', (_label, box) => {
  const layout = layoutWords(words(), box, measure, 7)

  test('chaque mot placé est entièrement dans le cœur', () => {
    for (const p of layout.placements) {
      const r = rectOf(p)
      for (const corner of [
        { x: r.x, y: r.y },
        { x: r.x + r.width, y: r.y },
        { x: r.x, y: r.y + r.height },
        { x: r.x + r.width, y: r.y + r.height },
      ]) {
        expect(isInsideHeart(corner, layout.outline)).toBe(true)
      }
    }
  })

  test('aucun chevauchement', () => {
    const rects = layout.placements.map(rectOf)
    for (let i = 0; i < rects.length; i++)
      for (let j = i + 1; j < rects.length; j++) expect(intersects(rects[i], rects[j])).toBe(false)
  })

  test('zone du prénom libre', () => {
    for (const p of layout.placements) expect(intersects(rectOf(p), layout.nameZone)).toBe(false)
  })

  test('la phrase saisie est placée et mise en valeur', () => {
    expect(layout.placements.filter((p) => p.highlight)).toHaveLength(1)
  })

  test('la phrase saisie est plus grande que les traductions', () => {
    const hl = layout.placements.find((p) => p.highlight)!
    expect(hl.size).toBeGreaterThanOrEqual(1.3 * layout.baseSize)
  })

  test('au moins 60 placements (tient dans cet écran)', () => {
    expect(layout.placements.length).toBeGreaterThanOrEqual(60)
  })

  test('le cœur et la zone du prénom tiennent dans l’écran', () => {
    for (const p of layout.outline) {
      expect(p.x).toBeGreaterThanOrEqual(0)
      expect(p.x).toBeLessThanOrEqual(box.width)
      expect(p.y).toBeGreaterThanOrEqual(0)
      expect(p.y).toBeLessThanOrEqual(box.height)
    }
    const z = layout.nameZone
    expect(isInsideHeart({ x: z.x, y: z.y }, layout.outline)).toBe(true)
    expect(isInsideHeart({ x: z.x + z.width, y: z.y + z.height }, layout.outline)).toBe(true)
  })
})

test("un mot trop large n'est jamais placé hors du cœur", () => {
  const long = 'Je t’aime plus que tout au monde, vraiment'.slice(0, 40)
  const layout = layoutWords(words(long), { width: 390, height: 844 }, measure, 7)
  for (const p of layout.placements) {
    const r = rectOf(p)
    expect(isInsideHeart({ x: r.x, y: r.y }, layout.outline)).toBe(true)
    expect(isInsideHeart({ x: r.x + r.width, y: r.y + r.height }, layout.outline)).toBe(true)
  }
  const hl = layout.placements.find((p) => p.highlight)
  if (hl) expect(hl.size).toBeGreaterThanOrEqual(0.7 * layout.baseSize - 1e-9)
})

test('déterministe avec le même seed', () => {
  const box = { width: 390, height: 844 }
  expect(layoutWords(words(), box, measure, 3)).toEqual(layoutWords(words(), box, measure, 3))
})

describe('correctifs de la relecture finale', () => {
  // Gras (600) environ 20 % plus large que le normal : « Je t'aime ❤️ » est dessiné en gras.
  const weighted: Measure = (t, s, weight = 400) => [...t].length * s * 0.55 * (weight >= 600 ? 1.2 : 1)
  const realistic: Measure = (t, s) => [...t].length * s * 0.55

  test.each(viewports)('en %s, la phrase en gras ne déborde ni ne touche ses voisins', (_l, box) => {
    const layout = layoutWords(words("Je t'aime plus que tout au monde, vraiment".slice(0, 40)), box, weighted, 7)
    const hl = layout.placements.find((p) => p.highlight)!
    const r = { x: hl.x, y: hl.y - hl.size, width: weighted(hl.text, hl.size, 600), height: hl.size }
    expect(isInsideHeart({ x: r.x, y: r.y }, layout.outline)).toBe(true)
    expect(isInsideHeart({ x: r.x + r.width, y: r.y + r.height }, layout.outline)).toBe(true)
    for (const p of layout.placements.filter((q) => !q.highlight))
      expect(intersects(r, { x: p.x, y: p.y - p.size, width: weighted(p.text, p.size), height: p.size })).toBe(false)
  })

  test.each(viewports)('en %s, le wolof est toujours dans le cœur', (_l, box) => {
    const ws = translations.map((t) => ({ text: t.text, dir: t.dir, priority: t.lang === 'wo' }))
    for (let seed = 1; seed <= 8; seed++) {
      const texts = layoutWords([...ws, { text: "Je t'aime ❤️", highlight: true }], box, realistic, seed).placements.map(
        (p) => p.text,
      )
      expect(texts).toEqual(expect.arrayContaining(['Damala beug', 'Dama la nob']))
    }
  })

  test('sur téléphone en portrait, au moins 90 % des langues sont placées', () => {
    const layout = layoutWords(words(), { width: 390, height: 844 - 130 }, realistic, 7)
    const unique = new Set(layout.placements.filter((p) => !p.highlight).map((p) => p.text)).size
    expect(unique).toBeGreaterThanOrEqual(Math.ceil(translations.length * 0.9))
  })

  test('un écran de taille nulle ne bloque pas', () => {
    expect(layoutWords(words(), { width: 0, height: 0 }, realistic, 7).placements).toEqual([])
  })
})
