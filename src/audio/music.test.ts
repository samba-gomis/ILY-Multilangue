import { createMusic } from './music'

class FakeAudio {
  static instances: FakeAudio[] = []
  static failNext = false
  src: string
  loop = false
  preload = ''
  currentTime = 0
  volume = 1
  muted = false
  paused = true
  play = vi.fn(() => {
    if (FakeAudio.failNext) return Promise.reject(new Error('NotAllowedError'))
    this.paused = false
    return Promise.resolve()
  })
  pause = vi.fn(() => {
    this.paused = true
  })
  constructor(src: string) {
    this.src = src
    FakeAudio.instances.push(this)
  }
}

const Ctor = FakeAudio as unknown as typeof Audio
const flush = async () => {
  for (let i = 0; i < 6; i++) await Promise.resolve()
}
const last = () => FakeAudio.instances[FakeAudio.instances.length - 1]

beforeEach(() => {
  FakeAudio.instances = []
  FakeAudio.failNext = false
  vi.useFakeTimers()
})
afterEach(() => vi.useRealTimers())

test('la chanson boucle et démarre à la seconde choisie, en fondu', async () => {
  const music = createMusic('/music/chanson.mp3', 42, Ctor)
  await music.play(2000)
  const el = last()
  expect(el.loop).toBe(true)
  expect(el.currentTime).toBe(42)
  expect(el.volume).toBeLessThan(0.1)
  vi.advanceTimersByTime(2100)
  expect(el.volume).toBe(1)
  expect(music.failed).toBe(false)
})

test('failed devient vrai si play() rejette, sans exception propagée', async () => {
  FakeAudio.failNext = true
  const music = createMusic('/music/chanson.mp3', 0, Ctor)
  await expect(music.play(2000)).resolves.toBeUndefined()
  expect(music.failed).toBe(true)
})

test('setMuted coupe et remet le son', () => {
  const music = createMusic('/music/chanson.mp3', 0, Ctor)
  music.setMuted(true)
  expect(last().muted).toBe(true)
  music.setMuted(false)
  expect(last().muted).toBe(false)
})

test('stop met en pause et arrête le fondu', async () => {
  const music = createMusic('/music/chanson.mp3', 0, Ctor)
  await music.play(2000)
  music.stop()
  const v = last().volume
  vi.advanceTimersByTime(3000)
  expect(last().pause).toHaveBeenCalled()
  expect(last().volume).toBe(v)
})

test('unlock() amorce l’élément pendant le geste : play puis pause, en silence', async () => {
  const music = createMusic('/music/chanson.mp3', 0, Ctor)
  music.unlock()
  const el = last()
  expect(el.play).toHaveBeenCalledTimes(1)
  expect(el.muted).toBe(true) // silencieux pendant l'amorçage
  await flush()
  expect(el.pause).toHaveBeenCalled()
  expect(el.muted).toBe(false)
})

test('unlock() respecte le mute choisi entre-temps', async () => {
  const music = createMusic('/music/chanson.mp3', 0, Ctor)
  music.unlock()
  music.setMuted(true)
  await flush()
  expect(last().muted).toBe(true)
})

test('unlock() ne propage pas un refus', async () => {
  FakeAudio.failNext = true
  const music = createMusic('/music/chanson.mp3', 0, Ctor)
  expect(() => music.unlock()).not.toThrow()
  await flush()
  expect(music.failed).toBe(false) // seul play() décide de l'échec
})
