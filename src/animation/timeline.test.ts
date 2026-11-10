import { getPhase, paradeSlot } from './timeline'

test('début : apparition', () => {
  expect(getPhase(0)).toMatchObject({ phase: 'appear', progress: 0 })
})

test('milieu de l’apparition', () => {
  expect(getPhase(400)).toMatchObject({ phase: 'appear', progress: 0.5 })
})

test('début de la convergence', () => {
  const s = getPhase(1000)
  expect(s.phase).toBe('converge')
  expect(s.progress).toBeCloseTo(200 / 3000, 4)
})

test('cœur final', () => {
  expect(getPhase(4000)).toMatchObject({ phase: 'final', progress: 1 })
  expect(getPhase(10000)).toMatchObject({ phase: 'final', phaseElapsed: 6200 })
})

test('progress toujours dans [0, 1]', () => {
  for (let t = 0; t <= 12000; t += 50) {
    const { progress } = getPhase(t)
    expect(progress).toBeGreaterThanOrEqual(0)
    expect(progress).toBeLessThanOrEqual(1)
  }
})

describe('phase de défilement', () => {
  const d = { parade: 5000, appear: 800, converge: 3000 }

  test('commence par le défilement quand il est configuré', () => {
    expect(getPhase(0, d)).toMatchObject({ phase: 'parade', progress: 0 })
    expect(getPhase(2500, d)).toMatchObject({ phase: 'parade', progress: 0.5 })
  })

  test('puis apparition, convergence et cœur final décalés de la durée du défilement', () => {
    expect(getPhase(5400, d)).toMatchObject({ phase: 'appear', progress: 0.5 })
    expect(getPhase(5800 + 1500, d)).toMatchObject({ phase: 'converge', progress: 0.5 })
    expect(getPhase(5000 + 3800 + 1000, d)).toMatchObject({ phase: 'final', phaseElapsed: 1000 })
  })

  test('paradeSlot : quelle traduction est affichée, et où on en est dans son créneau', () => {
    expect(paradeSlot(0, 500, 90)).toEqual({ index: 0, local: 0 })
    expect(paradeSlot(1250, 500, 90)).toEqual({ index: 2, local: 0.5 })
    expect(paradeSlot(90 * 500, 500, 90)).toBeNull()
  })
})
