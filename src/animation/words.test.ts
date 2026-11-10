import { allWords } from './words'

test('le wolof est prioritaire, la phrase saisie est en dernier et mise en valeur', () => {
  const ws = allWords("Je t'aime ❤️")
  expect(ws.filter((w) => w.priority).map((w) => w.text).sort()).toEqual(['Dama la nob', 'Damala beug'])
  expect(ws[ws.length - 1]).toEqual({ text: "Je t'aime ❤️", highlight: true })
})
