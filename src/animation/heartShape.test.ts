import { fitToBox, heartOutline, isInsideHeart } from './heartShape'

test('le contour est symétrique gauche/droite', () => {
  const pts = heartOutline(200)
  for (const p of pts) {
    const mirror = pts.some((q) => Math.abs(q.x + p.x) < 1e-6 && Math.abs(q.y - p.y) < 1e-6)
    expect(mirror).toBe(true)
  }
})

test('fitToBox respecte les marges et remplit la boîte', () => {
  const pts = fitToBox(heartOutline(200), { width: 400, height: 400 }, 20)
  const xs = pts.map((p) => p.x)
  const ys = pts.map((p) => p.y)
  for (const v of [...xs, ...ys]) {
    expect(v).toBeGreaterThanOrEqual(20 - 1e-9)
    expect(v).toBeLessThanOrEqual(380 + 1e-9)
  }
  const w = Math.max(...xs) - Math.min(...xs)
  const h = Math.max(...ys) - Math.min(...ys)
  expect(Math.max(w, h)).toBeGreaterThanOrEqual(359)
})

test('isInsideHeart distingue intérieur et extérieur', () => {
  const pts = fitToBox(heartOutline(200), { width: 400, height: 400 }, 20)
  const ys = pts.map((p) => p.y)
  const bottom = Math.max(...ys)
  expect(isInsideHeart({ x: 200, y: 200 }, pts)).toBe(true)
  expect(isInsideHeart({ x: 0, y: 0 }, pts)).toBe(false)
  expect(isInsideHeart({ x: 200, y: bottom + 2 }, pts)).toBe(false)
  // entre les deux lobes, juste au-dessus du creux
  const top = Math.min(...ys)
  expect(isInsideHeart({ x: 200, y: top + 1 }, pts)).toBe(false)
})
