import { fireEvent, render, screen } from '@testing-library/react'
import { WelcomeScreen } from './WelcomeScreen'

const setup = () => {
  const onSubmit = vi.fn()
  render(<WelcomeScreen onSubmit={onSubmit} />)
  return {
    onSubmit,
    input: screen.getByRole('textbox') as HTMLInputElement,
    button: screen.getByRole('button', { name: 'Dis-le dans toutes les langues →' }),
  }
}

test('affiche le titre, le champ prérempli et le bouton', () => {
  const { input, button } = setup()
  expect(screen.getByRole('heading', { name: 'Dis-moi que tu m’aimes 🥺 !' })).toBeInTheDocument()
  expect(input.value).toBe("Je t'aime ❤️")
  expect(button).toBeEnabled()
})

test('bouton désactivé si espaces seuls', () => {
  const { input, button } = setup()
  fireEvent.change(input, { target: { value: '   ' } })
  expect(button).toBeDisabled()
})

test('la saisie est limitée à 40 caractères', () => {
  expect(setup().input.maxLength).toBe(40)
})

test('le clic envoie la phrase', () => {
  const { input, button, onSubmit } = setup()
  fireEvent.change(input, { target: { value: 'Je t’adore' } })
  fireEvent.click(button)
  expect(onSubmit).toHaveBeenCalledWith('Je t’adore')
})
