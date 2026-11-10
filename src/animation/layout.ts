import { fitToBox, heartOutline, rowIntervals } from './heartShape'
import type { Box, Point, Rect } from './types'

export type Measure = (text: string, size: number) => number
export type WordInput = { text: string; dir?: 'rtl'; highlight?: boolean }
/** x = bord gauche, y = ligne de base ; la boîte du mot va de y - size à y. */
export type Placement = {
  text: string
  x: number
  y: number
  size: number
  dir?: 'rtl'
  highlight: boolean
}
export type Layout = {
  placements: Placement[]
  outline: Point[]
  center: Point
  nameZone: Rect
  baseSize: number
}

type Interval = [number, number]

const LINE = 1.25 // hauteur de ligne, en multiple de la taille de police
const GAP = 0.5 // espace entre deux mots, en multiple de la taille
const INSET = 0.15 // marge intérieure par rapport au bord du cœur
const MIN_SCALE = 0.7 // réduction maximale d'un mot
const LOOKAHEAD = 8 // nombre de mots essayés avant de fermer un intervalle
const HIGHLIGHT_SCALE = 1.6 // la phrase saisie est plus grande

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function shuffle<T>(items: T[], rng: () => number): T[] {
  const a = [...items]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function intersectIntervals(a: Interval[], b: Interval[]): Interval[] {
  const out: Interval[] = []
  for (const [l1, r1] of a)
    for (const [l2, r2] of b) {
      const l = Math.max(l1, l2)
      const r = Math.min(r1, r2)
      if (r > l) out.push([l, r])
    }
  return out.sort((m, n) => m[0] - n[0])
}

function subtract(intervals: Interval[], [cl, cr]: Interval): Interval[] {
  const out: Interval[] = []
  for (const [l, r] of intervals) {
    if (cr <= l || cl >= r) {
      out.push([l, r])
      continue
    }
    if (cl > l) out.push([l, cl])
    if (cr < r) out.push([cr, r])
  }
  return out
}

/** Intervalles libres pour une ligne de texte dont la boîte va de top à bottom. */
function freeIntervals(top: number, bottom: number, size: number, outline: Point[], zone: Rect): Interval[] {
  let iv = intersectIntervals(rowIntervals(top, outline), rowIntervals(bottom, outline))
  const inset = INSET * size
  iv = iv.map(([l, r]) => [l + inset, r - inset] as Interval).filter(([l, r]) => r > l)
  if (bottom > zone.y && top < zone.y + zone.height) iv = subtract(iv, [zone.x - GAP * size, zone.x + zone.width + GAP * size])
  return iv
}

/** Taille utilisable pour un mot dans une largeur donnée, ou null s'il ne tient pas même réduit. */
function fitSize(text: string, size: number, avail: number, measure: Measure): number | null {
  const w = measure(text, size)
  if (w <= avail) return size
  const s = size * (avail / w)
  return s >= size * MIN_SCALE && measure(text, s) <= avail ? s : null
}

function attempt(words: WordInput[], outline: Point[], zone: Rect, top: number, bottom: number, size: number, rng: () => number) {
  return (measure: Measure) => {
    const placements: Placement[] = []
    const highlight = words.find((w) => w.highlight)
    const others = words.filter((w) => !w.highlight)
    const rows: number[] = []
    for (let y = top + size * LINE; y <= bottom; y += size * LINE) rows.push(y)

    // 1. La phrase saisie : plus grande, juste au-dessus du prénom, centrée ; on remonte si besoin.
    let hlRect: Rect | null = null
    if (highlight) {
      const above = rows.filter((y) => y <= zone.y - size * 0.2)
      for (let k = above.length - 1; k >= 0 && !hlRect; k--) {
        const y = above[k]
        for (const start of [size * HIGHLIGHT_SCALE, size]) {
          if (hlRect) break
          for (const [l, r] of freeIntervals(y - start, y, start, outline, zone)) {
            const s = fitSize(highlight.text, start, r - l, measure)
            if (s === null) continue
            const w = measure(highlight.text, s)
            const cx = Math.min(Math.max(zone.x + zone.width / 2, l + w / 2), r - w / 2)
            placements.push({ text: highlight.text, x: cx - w / 2, y, size: s, dir: highlight.dir, highlight: true })
            hlRect = { x: cx - w / 2 - GAP * size, y: y - s, width: w + 2 * GAP * size, height: s }
            break
          }
        }
      }
    }

    // 2. Les traductions, ligne par ligne, de gauche à droite ; la liste est recyclée.
    let queue = shuffle(others, rng)
    for (const y of rows) {
      let iv = freeIntervals(y - size, y, size, outline, zone)
      if (hlRect && y > hlRect.y && y - size < hlRect.y + hlRect.height)
        iv = subtract(iv, [hlRect.x, hlRect.x + hlRect.width])
      for (const [l, r] of iv) {
        let cursor = l
        for (;;) {
          if (queue.length === 0) queue = shuffle(others, rng)
          let placed = false
          for (let k = 0; k < Math.min(LOOKAHEAD, queue.length); k++) {
            const word = queue[k]
            const s = fitSize(word.text, size, r - cursor, measure)
            if (s === null) continue
            placements.push({ text: word.text, x: cursor, y, size: s, dir: word.dir, highlight: false })
            cursor += measure(word.text, s) + GAP * size
            queue.splice(k, 1)
            placed = true
            break
          }
          if (!placed) break
        }
      }
    }
    return { placements, highlightPlaced: !highlight || hlRect !== null }
  }
}

export function layoutWords(words: WordInput[], box: Box, measure: Measure, seed = 1): Layout {
  const outline = fitToBox(heartOutline(240), box, Math.min(box.width, box.height) * 0.06)
  const xs = outline.map((p) => p.x)
  const ys = outline.map((p) => p.y)
  const minX = Math.min(...xs)
  const minY = Math.min(...ys)
  const heartW = Math.max(...xs) - minX
  const heartH = Math.max(...ys) - minY
  const center = { x: minX + heartW / 2, y: minY + heartH * 0.45 }
  const zw = heartW * 0.46
  const zh = heartH * 0.16
  const nameZone: Rect = { x: center.x - zw / 2, y: center.y - zh / 2, width: zw, height: zh }
  const unique = new Set(words.filter((w) => !w.highlight).map((w) => w.text)).size

  let baseSize = heartH / 22
  let result = { placements: [] as Placement[], highlightPlaced: false }
  for (let tries = 0; tries < 8; tries++) {
    if (tries > 0) baseSize *= 0.92
    result = attempt(words, outline, nameZone, minY, minY + heartH, baseSize, mulberry32(seed))(measure)
    const placedUnique = new Set(result.placements.filter((p) => !p.highlight).map((p) => p.text)).size
    if (placedUnique >= unique * 0.9 && result.highlightPlaced) break
  }
  return { placements: result.placements, outline, center, nameZone, baseSize }
}
