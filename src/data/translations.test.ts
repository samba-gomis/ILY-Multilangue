import { translations } from './translations'

const byLang = (l: string) => translations.find((t) => t.lang === l)?.text

test('entre 75 et 90 entrées', () => {
  expect(translations.length).toBeGreaterThanOrEqual(75)
  expect(translations.length).toBeLessThanOrEqual(90)
})

test('aucun texte vide', () => {
  for (const t of translations) expect(t.text.trim()).not.toBe('')
})

test('pas de doublon de texte', () => {
  expect(new Set(translations.map((t) => t.text)).size).toBe(translations.length)
})

test('rtl pour ar, he, fa, ur', () => {
  for (const lang of ['ar', 'he', 'fa', 'ur']) {
    const entries = translations.filter((t) => t.lang === lang)
    expect(entries.length).toBeGreaterThan(0)
    for (const t of entries) expect(t.dir).toBe('rtl')
  }
})

test('wolof présent sous les deux formes', () => {
  const wo = translations.filter((t) => t.lang === 'wo').map((t) => t.text)
  expect(wo).toEqual(expect.arrayContaining(['Damala beug', 'Dama la nob']))
})

test('formes romantiques imposées', () => {
  expect(byLang('es')).toBe('Te amo')
  expect(byLang('it')).toBe('Ti amo')
  expect(byLang('ja')).toBe('愛してる')
  expect(byLang('ko')).toBe('사랑해')
  expect(byLang('zh')).toBe('我爱你')
})

test('le français est présent', () => {
  expect(translations.some((t) => t.lang === 'fr' && t.text === "Je t'aime")).toBe(true)
})

test('chaque traduction indique son pays (ou sa région)', () => {
  for (const t of translations) expect(t.country.trim()).not.toBe('')
})

test('pays des langues clés', () => {
  const country = (text: string) => translations.find((t) => t.text === text)?.country
  expect(country("Je t'aime")).toBe('France')
  expect(country('Damala beug')).toBe('Sénégal')
  expect(country('Dama la nob')).toBe('Sénégal')
  expect(country('愛してる')).toBe('Japon')
  expect(country('I love you')).toBe('Royaume-Uni')
  expect(country('Mi amas vin')).toBe('Langue internationale')
})
