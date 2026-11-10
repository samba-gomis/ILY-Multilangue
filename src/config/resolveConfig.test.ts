import { resolveConfig } from './resolveConfig'
import type { AppConfig } from './types'

const example: AppConfig = {
  name: 'Ma chérie',
  message: "Message d'exemple",
  songUrl: '/music/chanson.mp3',
  songBpm: 72,
  songStartSec: 0,
}

test("retombe sur l'exemple sans config locale ni variables", () => {
  expect(resolveConfig({}, {}, example)).toEqual(example)
})

test('utilise la config locale si présente (prioritaire sur les variables)', () => {
  const local = { ...example, name: 'Aïda' }
  const cfg = resolveConfig({ './config.local.ts': { default: local } }, { VITE_LOVE_NAME: 'Autre' }, example)
  expect(cfg.name).toBe('Aïda')
})

test("lit les variables d'environnement Netlify", () => {
  const cfg = resolveConfig(
    {},
    {
      VITE_LOVE_NAME: 'Diarra',
      VITE_LOVE_MESSAGE: 'Ligne 1\\nLigne 2',
      VITE_SONG_BPM: '130.5',
      VITE_SONG_START_SEC: '64',
    },
    example,
  )
  expect(cfg).toEqual({ ...example, name: 'Diarra', message: 'Ligne 1\nLigne 2', songBpm: 130.5, songStartSec: 64 })
})

test('ignore les variables vides ou les nombres invalides', () => {
  const cfg = resolveConfig({}, { VITE_LOVE_NAME: '  ', VITE_SONG_BPM: 'abc', VITE_SONG_START_SEC: '-5' }, example)
  expect(cfg).toEqual(example)
})
