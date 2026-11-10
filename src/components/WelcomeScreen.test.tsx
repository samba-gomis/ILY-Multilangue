import { fireEvent, render, screen } from '@testing-library/react'
import { WelcomeScreen } from './WelcomeScreen'

test('affiche la question et un seul bouton « Je t’aime »', () => {
  render(<WelcomeScreen onStart={vi.fn()} />)
  expect(screen.getByRole('heading', { name: 'Dis-moi que tu m’aimes 🥺 !' })).toBeInTheDocument()
  expect(screen.getAllByRole('button')).toHaveLength(1)
  expect(screen.getByRole('button', { name: 'Je t’aime ❤️' })).toBeEnabled()
})

test('pas de champ de saisie', () => {
  render(<WelcomeScreen onStart={vi.fn()} />)
  expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
})

test('le clic lance la suite', () => {
  const onStart = vi.fn()
  render(<WelcomeScreen onStart={onStart} />)
  fireEvent.click(screen.getByRole('button', { name: 'Je t’aime ❤️' }))
  expect(onStart).toHaveBeenCalledTimes(1)
})
