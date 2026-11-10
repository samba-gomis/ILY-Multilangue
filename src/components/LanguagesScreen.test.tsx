import { act, fireEvent, render, screen } from '@testing-library/react'
import { LanguagesScreen } from './LanguagesScreen'

const label = /^Dis-le-moi dans plusieurs langues…\s💕$/

test('affiche un bouton « Dis-le-moi dans plusieurs langues… 💕 »', () => {
  render(<LanguagesScreen onNext={vi.fn()} />)
  expect(screen.getByRole('button', { name: label })).toBeEnabled()
})

test('le clic mène au cœur', () => {
  const onNext = vi.fn()
  render(<LanguagesScreen onNext={onNext} />)
  fireEvent.click(screen.getByRole('button', { name: label }))
  expect(onNext).toHaveBeenCalledTimes(1)
})

test("ne passe jamais tout seul au cœur", () => {
  vi.useFakeTimers()
  const onNext = vi.fn()
  render(<LanguagesScreen onNext={onNext} />)
  act(() => vi.advanceTimersByTime(60000))
  expect(onNext).not.toHaveBeenCalled()
  vi.useRealTimers()
})
