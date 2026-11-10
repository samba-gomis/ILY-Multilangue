import { allWords } from './words'
import { layoutWords } from './layout'
import { MESSAGE_BAND_MIN, stageBox } from './stage'

const measure = (t: string, s: number) => [...t].length * s * 0.6

test.each([
  [667, 375],
  [1440, 900],
  [390, 844],
])('en %i×%i, le cœur laisse libre la bande minimale du message', (width, height) => {
  const layout = layoutWords(allWords("Je t'aime ❤️"), stageBox({ width, height }), measure, 7)
  const bottom = Math.max(...layout.outline.map((p) => p.y))
  expect(bottom).toBeLessThanOrEqual(height - MESSAGE_BAND_MIN)
})

test('la bande grandit avec la hauteur réelle du message', () => {
  const box = stageBox({ width: 667, height: 375 }, 130)
  expect(box.height).toBeLessThanOrEqual(375 - 130)
})

test('la bande ne mange jamais plus de 45 % de l’écran', () => {
  expect(stageBox({ width: 667, height: 375 }, 400).height).toBeGreaterThanOrEqual(375 * 0.55 - 1e-9)
})

test('stageBox garde toute la largeur', () => {
  expect(stageBox({ width: 667, height: 375 }).width).toBe(667)
})
