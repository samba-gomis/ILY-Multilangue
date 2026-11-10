import { act, render, screen } from '@testing-library/react'
import { HeartCanvas } from './HeartCanvas'

type FrameCb = (t: number) => void
let callbacks = new Map<number, FrameCb>()
let nextId = 1

function fakeContext2D() {
  const target: Record<string, unknown> = {
    measureText: (t: string) => ({ width: [...t].length * 7 }),
  }
  return new Proxy(target, {
    get(obj, key: string) {
      if (!(key in obj)) obj[key] = vi.fn()
      return obj[key]
    },
    set(obj, key: string, value) {
      obj[key] = value
      return true
    },
  })
}

/** Exécute les frames en attente jusqu'à `untilMs`, par pas de 16 ms. */
function runFrames(fromMs: number, untilMs: number) {
  for (let t = fromMs; t <= untilMs; t += 16) {
    const pending = [...callbacks.entries()]
    callbacks = new Map()
    act(() => pending.forEach(([, cb]) => cb(t)))
  }
}

beforeEach(() => {
  callbacks = new Map()
  nextId = 1
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(
    () => fakeContext2D() as unknown as CanvasRenderingContext2D,
  )
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
    const id = nextId++
    callbacks.set(id, cb as FrameCb)
    return id
  })
  vi.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => {
    callbacks.delete(id)
  })
})
afterEach(() => vi.restoreAllMocks())

const props = {
  phrase: "Je t'aime ❤️",
  songBpm: 72,
  name: 'Ma chérie',
  message: "Message d'exemple",
  reducedMotion: false,
}

async function mount(onPhaseChange = vi.fn()) {
  const r = render(<HeartCanvas {...props} onPhaseChange={onPhaseChange} />)
  await act(async () => {}) // résolution de waitForFonts
  return { ...r, onPhaseChange }
}

test('unmount annule la boucle', async () => {
  const removeSpy = vi.spyOn(window, 'removeEventListener')
  const { unmount } = await mount()
  runFrames(0, 100)
  expect(callbacks.size).toBe(1)
  const [lastId] = [...callbacks.keys()]
  unmount()
  expect(window.cancelAnimationFrame).toHaveBeenCalledWith(lastId)
  expect(callbacks.size).toBe(0)
  expect(removeSpy.mock.calls.some(([type]) => type === 'resize')).toBe(true)
})

test('onPhaseChange : converge puis final, une seule fois chacun', async () => {
  const { onPhaseChange } = await mount()
  runFrames(0, 5000)
  expect(onPhaseChange.mock.calls.map(([p]) => p)).toEqual(['converge', 'final'])
})

test('une frame tardive ne saute pas la phase converge', async () => {
  const { onPhaseChange } = await mount()
  runFrames(0, 0)
  runFrames(6000, 6000)
  expect(onPhaseChange.mock.calls.map(([p]) => p)).toEqual(['converge', 'final'])
})

test('le message apparaît 3 s après le début du cœur final', async () => {
  await mount()
  const msg = screen.getByText("Message d'exemple")
  runFrames(0, 3800 + 2900)
  expect(msg).not.toHaveClass('visible')
  runFrames(3800 + 2916, 3800 + 3200)
  expect(msg).toHaveClass('visible')
})

test('sans contexte 2D, rien ne plante', async () => {
  vi.mocked(HTMLCanvasElement.prototype.getContext).mockImplementation(() => null)
  await mount()
  expect(callbacks.size).toBe(0)
})
