import type { Box } from './types'

/** Hauteur minimale réservée en bas de l'écran au message. */
export const MESSAGE_BAND_MIN = 110
const MESSAGE_BAND_MAX_RATIO = 0.45

/**
 * Zone où le cœur est dessiné : tout l'écran sauf une bande en bas pour le message.
 * `messageBand` = espace réellement occupé par le message depuis le bas de l'écran (mesuré dans le DOM).
 */
export function stageBox(viewport: Box, messageBand = 0): Box {
  const band = Math.min(viewport.height * MESSAGE_BAND_MAX_RATIO, Math.max(MESSAGE_BAND_MIN, messageBand))
  return { width: viewport.width, height: Math.max(0, viewport.height - band) }
}
