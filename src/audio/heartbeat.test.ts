import { beatTimes, createHeartbeat } from './heartbeat'

test('beatTimes à 60 bpm : lub chaque seconde, dub 0,25 s après', () => {
  expect(beatTimes(60, 0, 3, 0)).toEqual([
    { time: 0, kind: 'lub' },
    { time: 0.25, kind: 'dub' },
    { time: 1, kind: 'lub' },
    { time: 1.25, kind: 'dub' },
    { time: 2, kind: 'lub' },
    { time: 2.25, kind: 'dub' },
  ])
})

test('beatTimes à 80 bpm : 0,75 s entre deux lub', () => {
  const lubs = beatTimes(80, 0, 3, 0).filter((e) => e.kind === 'lub').map((e) => e.time)
  expect(lubs).toEqual([0, 0.75, 1.5, 2.25])
})

test('beatTimes ne renvoie que la fenêtre demandée', () => {
  expect(beatTimes(60, 1.1, 1.3, 0)).toEqual([{ time: 1.25, kind: 'dub' }])
})

function fakeContext() {
  const param = () => ({
    value: 1,
    setValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
    cancelScheduledValues: vi.fn(),
  })
  const start = Date.now()
  const ctx = {
    get currentTime() {
      return (Date.now() - start) / 1000
    },
    destination: {},
    createOscillator: vi.fn(() => ({
      type: 'sine',
      frequency: param(),
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    })),
    createGain: vi.fn(() => ({ gain: param(), connect: vi.fn() })),
  }
  return ctx
}

describe('createHeartbeat', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  test('start(60) programme des battements au fil du temps', () => {
    const ctx = fakeContext()
    const hb = createHeartbeat(ctx as unknown as AudioContext)
    hb.start(60)
    vi.advanceTimersByTime(1000)
    expect(ctx.createOscillator.mock.calls.length).toBeGreaterThanOrEqual(2)
    hb.stop()
  })

  test('stop() arrête toute nouvelle programmation', () => {
    const ctx = fakeContext()
    const hb = createHeartbeat(ctx as unknown as AudioContext)
    hb.start(60)
    vi.advanceTimersByTime(500)
    hb.stop()
    const n = ctx.createOscillator.mock.calls.length
    vi.advanceTimersByTime(3000)
    expect(ctx.createOscillator.mock.calls.length).toBe(n)
  })

  test('start() deux fois ne double pas le battement', () => {
    const once = fakeContext()
    const a = createHeartbeat(once as unknown as AudioContext)
    a.start(60)
    vi.advanceTimersByTime(2000)
    a.stop()
    const twice = fakeContext()
    const b = createHeartbeat(twice as unknown as AudioContext)
    b.start(60)
    b.start(60)
    vi.advanceTimersByTime(2000)
    b.stop()
    expect(twice.createOscillator.mock.calls.length).toBe(once.createOscillator.mock.calls.length)
  })
})
