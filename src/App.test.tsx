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
  HeartCanvas: ({ onPhaseChange, phrase }: { onPhaseChange: (p: string) => void; phrase: string }) => (
    <div>
      <span data-testid="heart-phrase">{phrase}</span>
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

const submit = () => screen.getByRole('button', { name: 'Je t’aime ❤️' })
const toHeart = () => fireEvent.click(screen.getByRole('button', { name: /^Dis-le-moi dans plusieurs langues…\s💕$/ }))

test("« Je t'aime » → écran des langues → clic → cœur", () => {
  render(<App />)
  fireEvent.click(submit())
  expect(mocks.heartbeat.start).toHaveBeenCalledWith(60)
  act(() => vi.advanceTimersByTime(30000))
  expect(screen.queryByTestId('heart-stage')).not.toBeInTheDocument()
  toHeart()
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
  toHeart()
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
  toHeart()
  expect(screen.getByTestId('heart-stage')).toBeInTheDocument()
  expect(mocks.createHeartbeat).not.toHaveBeenCalled()
})

test("la chanson démarre au clic vers le cœur, puis le battement s'efface", async () => {
  render(<App />)
  fireEvent.click(submit())
  expect(mocks.music.play).not.toHaveBeenCalled()
  toHeart()
  expect(mocks.music.play).toHaveBeenCalledTimes(1)
  expect(mocks.music.play).toHaveBeenCalledWith(2000)
  await act(async () => {})
  expect(mocks.heartbeat.fadeOut).toHaveBeenCalledWith(2000)
})

test('les phases du cœur ne relancent pas la chanson', () => {
  render(<App />)
  fireEvent.click(submit())
  toHeart()
  fireEvent.click(screen.getByText('phase-converge'))
  fireEvent.click(screen.getByText('phase-final'))
  expect(mocks.music.play).toHaveBeenCalledTimes(1)
})

test('si la chanson échoue, le battement continue et accélère', async () => {
  mocks.music.failed = true
  render(<App />)
  fireEvent.click(submit())
  toHeart()
  await act(async () => {})
  fireEvent.click(screen.getByText('phase-converge'))
  expect(mocks.heartbeat.fadeOut).not.toHaveBeenCalled()
  expect(mocks.heartbeat.setBpm).toHaveBeenCalledWith(80)
  mocks.music.failed = false
})

test('le cœur affiche toujours « Je t’aime ❤️ » comme phrase mise en valeur', () => {
  render(<App />)
  fireEvent.click(submit())
  toHeart()
  expect(screen.getByTestId('heart-phrase')).toHaveTextContent("Je t'aime ❤️")
})

test('la chanson est amorcée dans le geste du clic (iOS)', () => {
  render(<App />)
  fireEvent.click(submit())
  expect(mocks.music.unlock).toHaveBeenCalledTimes(1)
})

test("double tap sur « Dis-le-moi… » ne lance qu'une chanson", () => {
  render(<App />)
  fireEvent.click(submit())
  const button = screen.getByRole('button', { name: /^Dis-le-moi dans plusieurs langues…\s💕$/ })
  fireEvent.click(button)
  fireEvent.click(button)
  expect(mocks.music.play).toHaveBeenCalledTimes(1)
})
