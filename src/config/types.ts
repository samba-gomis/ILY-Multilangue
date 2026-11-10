export type AppConfig = {
  /** Prénom ou surnom affiché au centre du cœur. */
  name: string
  /** Message qui apparaît en fondu sous le cœur. */
  message: string
  /** Chemin du MP3 (servi depuis public/). */
  songUrl: string
  /** Tempo de la chanson, en battements par minute. */
  songBpm: number
  /** Seconde de départ dans la chanson (ex. le refrain). */
  songStartSec: number
}
