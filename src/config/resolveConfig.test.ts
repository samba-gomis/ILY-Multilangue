import { resolveConfig } from './resolveConfig'
import type { AppConfig } from './types'

const example: AppConfig = {
  name: 'Ma chérie',
  message: "Message d'exemple",
  songUrl: '/music/chanson.mp3',
  songBpm: 72,
  songStartSec: 0,
}

test("retombe sur l'exemple sans config locale", () => {
  expect(resolveConfig({}, example)).toEqual(example)
})

test('utilise la config locale si présente', () => {
  const local = { ...example, name: 'Aïda' }
  expect(resolveConfig({ './config.local.ts': { default: local } }, example).name).toBe('Aïda')
})
