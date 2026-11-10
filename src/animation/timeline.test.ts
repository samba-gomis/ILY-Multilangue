import { getPhase } from './timeline'

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
