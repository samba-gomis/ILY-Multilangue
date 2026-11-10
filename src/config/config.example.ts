import type { AppConfig } from './types'

// Valeurs d'exemple. Pour personnaliser : copier ce fichier en
// `config.local.ts` (ignoré par git) et y mettre les vraies valeurs.
const config: AppConfig = {
  name: 'Ma chérie',
  message: "Message d'exemple",
  songUrl: '/music/chanson.mp3',
  songBpm: 72,
  songStartSec: 0,
}

export default config
