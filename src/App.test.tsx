import { act, fireEvent, render, screen } from '@testing-library/react'
import App from './App'

const mocks = vi.hoisted(() => {
  const heartbeat = { start: vi.fn(), setBpm: vi.fn(), fadeOut: vi.fn(), stop: vi.fn(), setMuted: vi.fn() }
  const music = { play: vi.fn(() => Promise.resolve()), unlock: vi.fn(), setMuted: vi.fn(), stop: vi.fn(), failed: false }
  return {
    heartbeat,
    music,
    createHeartbeat: vi.fn(() => heartbeat),
    createMusic: vi.fn(() => music),
  }
})
vi.mock('./audio/heartbeat', () => ({ createHeartbeat: mocks.createHeartbeat }))
vi.mock('./audio/music', () => ({ createMusic: mocks.createMusic }))
vi.mock('./components/HeartCanvas', () => ({
  HeartCanvas: ({ onPhaseChange }: { onPhaseChange: (p: string) => void }) => (
    <div>
      <button onClick={() => onPhaseChange('converge')}>phase-converge</button>
      <button onClick={() => onPhaseChange('final')}>phase-final</button>
    </div>
  ),
}))

beforeEach(() => {
  vi.useFakeTimers()
  vi.clearAllMocks()
  vi.stubGlobal(
    'AudioContext',
    class {
      resume() {
        return Promise.resolve()
      }
    },
  )
})
afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

const submit = () => screen.getByRole('button', { name: 'Dis-le dans toutes les langues →' })

test("clic → chargement → cœur après 2500 ms", () => {
  render(<App />)
  fireEvent.click(submit())
  expect(screen.getByText('Je cherche toutes les façons de te le dire… 💕')).toBeInTheDocument()
  expect(mocks.heartbeat.start).toHaveBeenCalledWith(60)
  act(() => vi.advanceTimersByTime(2500))
  expect(screen.queryByText('Je cherche toutes les façons de te le dire… 💕')).not.toBeInTheDocument()
  expect(screen.getByTestId('heart-stage')).toBeInTheDocument()
})

test("double submit ne lance qu'un chargement", () => {
  render(<App />)
  const button = submit()
  fireEvent.click(button)
  fireEvent.click(button)
  expect(mocks.createHeartbeat).toHaveBeenCalledTimes(1)
  expect(mocks.heartbeat.start).toHaveBeenCalledTimes(1)
})

test("Rejouer revient à l'accueil et coupe l'audio", () => {
  render(<App />)
  fireEvent.click(submit())
  act(() => vi.advanceTimersByTime(2500))
  fireEvent.click(screen.getByRole('button', { name: 'Rejouer' }))
  expect(screen.getByRole('heading', { name: 'Dis-moi que tu m’aimes 🥺 !' })).toBeInTheDocument()
  expect(mocks.heartbeat.stop).toHaveBeenCalled()
  expect(mocks.music.stop).toHaveBeenCalled()
})

test('le bouton son coupe le battement et la chanson', () => {
  render(<App />)
  fireEvent.click(submit())
  fireEvent.click(screen.getByRole('button', { name: 'Couper le son' }))
  expect(mocks.heartbeat.setMuted).toHaveBeenLastCalledWith(true)
  expect(mocks.music.setMuted).toHaveBeenLastCalledWith(true)
  expect(screen.getByRole('button', { name: 'Remettre le son' })).toBeInTheDocument()
})

test('sans Web Audio, l’expérience continue sans erreur', () => {
  vi.stubGlobal('AudioContext', undefined)
  render(<App />)
  fireEvent.click(submit())
  act(() => vi.advanceTimersByTime(2500))
  expect(screen.getByTestId('heart-stage')).toBeInTheDocument()
  expect(mocks.createHeartbeat).not.toHaveBeenCalled()
})

test('convergence accélère le battement, le cœur final lance la chanson puis éteint le battement', async () => {
  render(<App />)
  fireEvent.click(submit())
  act(() => vi.advanceTimersByTime(2500))
  fireEvent.click(screen.getByText('phase-converge'))
  expect(mocks.heartbeat.setBpm).toHaveBeenCalledWith(80)
  fireEvent.click(screen.getByText('phase-final'))
  expect(mocks.music.play).toHaveBeenCalledWith(2000)
  await act(async () => {})
  expect(mocks.heartbeat.fadeOut).toHaveBeenCalledWith(2000)
})

test('si la chanson échoue, le battement continue', async () => {
  mocks.music.failed = true
  render(<App />)
  fireEvent.click(submit())
  act(() => vi.advanceTimersByTime(2500))
  fireEvent.click(screen.getByText('phase-final'))
  await act(async () => {})
  expect(mocks.heartbeat.fadeOut).not.toHaveBeenCalled()
  mocks.music.failed = false
})

test('la chanson est amorcée dans le geste du clic (iOS)', () => {
  render(<App />)
  fireEvent.click(submit())
  expect(mocks.music.unlock).toHaveBeenCalledTimes(1)
})
