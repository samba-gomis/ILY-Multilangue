import type { Box, Point } from './types'

/**
 * Contour paramétrique classique du cœur, en coordonnées brutes.
 * y est inversé pour l'écran (y vers le bas) : la pointe est en bas.
 */
export function heartOutline(steps: number): Point[] {
  const pts: Point[] = []
  for (let i = 0; i < steps; i++) {
    const t = (2 * Math.PI * i) / steps
    pts.push({
      x: 16 * Math.sin(t) ** 3,
      y: -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)),
    })
  }
  return pts
}

/** Met le contour à l'échelle (uniforme) et le centre dans la boîte, avec une marge. */
export function fitToBox(points: Point[], box: Box, margin: number): Point[] {
  const xs = points.map((p) => p.x)
  const ys = points.map((p) => p.y)
  const minX = Math.min(...xs)
  const minY = Math.min(...ys)
  const w = Math.max(...xs) - minX
  const h = Math.max(...ys) - minY
  const scale = Math.min((box.width - 2 * margin) / w, (box.height - 2 * margin) / h)
  const offX = (box.width - w * scale) / 2
  const offY = (box.height - h * scale) / 2
  return points.map((p) => ({ x: offX + (p.x - minX) * scale, y: offY + (p.y - minY) * scale }))
}

/** Test point-dans-polygone (lancer de rayon horizontal). */
export function isInsideHeart(p: Point, outline: Point[]): boolean {
  let inside = false
  for (let i = 0, j = outline.length - 1; i < outline.length; j = i++) {
    const a = outline[i]
    const b = outline[j]
    if (a.y > p.y !== b.y > p.y && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) {
      inside = !inside
    }
  }
  return inside
}

/** Intervalles [gauche, droite] où la ligne horizontale y traverse l'intérieur du polygone. */
export function rowIntervals(y: number, outline: Point[]): [number, number][] {
  const xs: number[] = []
  for (let i = 0, j = outline.length - 1; i < outline.length; j = i++) {
    const a = outline[i]
    const b = outline[j]
    if (a.y > y !== b.y > y) xs.push(a.x + ((y - a.y) * (b.x - a.x)) / (b.y - a.y))
  }
  xs.sort((m, n) => m - n)
  const out: [number, number][] = []
  for (let k = 0; k + 1 < xs.length; k += 2) out.push([xs[k], xs[k + 1]])
  return out
}
