import { translations } from '../data/translations'
import { allWords, paradeOrder } from './words'

test('le wolof est prioritaire, la phrase saisie est en dernier et mise en valeur', () => {
  const ws = allWords("Je t'aime ❤️")
  expect(ws.filter((w) => w.priority).map((w) => w.text).sort()).toEqual(['Dama la nob', 'Damala beug'])
  expect(ws[ws.length - 1]).toEqual({ text: "Je t'aime ❤️", highlight: true })
})

test('défilement : français, puis les deux wolof, puis toutes les autres langues une seule fois', () => {
  const order = paradeOrder()
  expect(order.map((t) => t.text).slice(0, 3)).toEqual(["Je t'aime", 'Damala beug', 'Dama la nob'])
  expect(order).toHaveLength(translations.length)
  expect(new Set(order.map((t) => t.text)).size).toBe(translations.length)
})
