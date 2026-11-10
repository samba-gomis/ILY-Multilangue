import type { Placement } from './layout'
import { mulberry32 } from './layout'
import { createParticles, floatOffset, pulseScale, updateParticles } from './particles'

const placements: Placement[] = [
  { text: 'Te amo', x: 100, y: 200, size: 12, highlight: false },
  { text: 'أحبك', x: 180, y: 220, size: 12, dir: 'rtl', highlight: false },
  { text: "Je t'aime ❤️", x: 150, y: 260, size: 20, highlight: true },
]
const viewport = { width: 390, height: 844 }
const fresh = () => createParticles(placements, viewport, mulberry32(1))
const dist = (p: { x: number; y: number; targetX: number; targetY: number }) =>
  Math.hypot(p.x - p.targetX, p.y - p.targetY)

test('createParticles : invisibles, cible = placement, départ dans l’écran', () => {
  const ps = fresh()
  ps.forEach((p, i) => {
    expect(p.opacity).toBe(0)
    expect(p.targetX).toBe(placements[i].x)
    expect(p.targetY).toBe(placements[i].y)
    expect(p.x).toBeGreaterThanOrEqual(0)
    expect(p.x).toBeLessThanOrEqual(viewport.width)
    expect(p.y).toBeGreaterThanOrEqual(0)
    expect(p.y).toBeLessThanOrEqual(viewport.height)
  })
})

test("après assez de convergence les particules sont à moins d'1 px de leur cible", () => {
  const ps = fresh()
  for (let i = 0; i < 300; i++) updateParticles(ps, 'converge', i / 300, 16.67, false)
  for (const p of ps) expect(dist(p)).toBeLessThan(1)
})

test('dt énorme ne dépasse pas la cible', () => {
  const ps = fresh()
  const before = ps.map(dist)
  updateParticles(ps, 'converge', 0.5, 5000, false)
  ps.forEach((p, i) => {
    expect(Number.isNaN(p.x) || Number.isNaN(p.y)).toBe(false)
    expect(dist(p)).toBeLessThanOrEqual(before[i])
    // un seul pas plafonné à 50 ms : la particule ne saute pas jusqu'à la cible
    expect(dist(p)).toBeGreaterThan(before[i] * 0.5)
  })
})

test('apparition : l’opacité suit la progression', () => {
  const ps = fresh()
  updateParticles(ps, 'appear', 0.3, 16.67, false)
  const mid = ps[0].opacity
  expect(mid).toBeGreaterThan(0)
  expect(mid).toBeLessThan(1)
  updateParticles(ps, 'appear', 1, 16.67, false)
  expect(ps[0].opacity).toBe(1)
})

test('reducedMotion : les mots sont directement à leur place', () => {
  const ps = fresh()
  updateParticles(ps, 'appear', 0.1, 16.67, true)
  for (const p of ps) {
    expect(p.x).toBe(p.targetX)
    expect(p.y).toBe(p.targetY)
  }
})

test('pulseScale reste dans [1, 1.045]', () => {
  for (let t = 0; t < 5000; t += 7) {
    const s = pulseScale(t, 72)
    expect(s).toBeGreaterThanOrEqual(1)
    expect(s).toBeLessThanOrEqual(1.045 + 1e-9)
  }
  expect(Math.max(...Array.from({ length: 1000 }, (_, i) => pulseScale(i, 72)))).toBeGreaterThan(1.04)
})

test('pulseScale : BPM > 100 bat un temps sur deux', () => {
  const period = 60000 / 70
  for (const t of [0, 123, 456, 789]) expect(pulseScale(t + period, 140)).toBeCloseTo(pulseScale(t, 140), 9)
  // 72 bpm : période 60000/72
  expect(pulseScale(100 + 60000 / 72, 72)).toBeCloseTo(pulseScale(100, 72), 9)
})

test('floatOffset reste sous 1,5 px', () => {
  for (let t = 0; t < 10000; t += 37) {
    const o = floatOffset(t, 2.1)
    expect(Math.hypot(o.x, o.y)).toBeLessThanOrEqual(1.5 + 1e-9)
  }
})
