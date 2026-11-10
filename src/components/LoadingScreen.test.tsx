import { act, render, screen } from '@testing-library/react'
import { LoadingScreen } from './LoadingScreen'

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

test('affiche le message et appelle onDone une fois à 2500 ms', () => {
  const onDone = vi.fn()
  render(<LoadingScreen onDone={onDone} />)
  expect(screen.getByText('Dis-le-moi dans plusieurs langues… 💕')).toBeInTheDocument()
  act(() => vi.advanceTimersByTime(2499))
  expect(onDone).not.toHaveBeenCalled()
  act(() => vi.advanceTimersByTime(1))
  expect(onDone).toHaveBeenCalledTimes(1)
  act(() => vi.advanceTimersByTime(5000))
  expect(onDone).toHaveBeenCalledTimes(1)
})

test("pas d'appel après démontage", () => {
  const onDone = vi.fn()
  const { unmount } = render(<LoadingScreen onDone={onDone} />)
  unmount()
  act(() => vi.advanceTimersByTime(3000))
  expect(onDone).not.toHaveBeenCalled()
})
