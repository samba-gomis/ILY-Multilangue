import type { AppConfig } from './types'

/** Variables d'environnement lues au build (Netlify → Site configuration → Environment variables). */
export type ConfigEnv = {
  VITE_LOVE_NAME?: string
  VITE_LOVE_MESSAGE?: string
  VITE_SONG_BPM?: string
  VITE_SONG_START_SEC?: string
}

const text = (v?: string) => (v && v.trim() ? v.trim().replace(/\\n/g, '\n') : undefined)
const positive = (v?: string) => {
  const n = Number(v)
  return v !== undefined && v.trim() !== '' && Number.isFinite(n) && n >= 0 ? n : undefined
}

/**
 * Ordre de priorité : config locale (fichier ignoré par git) > variables d'environnement > exemple.
 * Dans les variables, « \n » écrit littéralement devient un retour à la ligne.
 */
export function resolveConfig(
  localModules: Record<string, { default: AppConfig }>,
  env: ConfigEnv,
  fallback: AppConfig,
): AppConfig {
  const local = Object.values(localModules)[0]
  if (local) return local.default
  return {
    ...fallback,
    name: text(env.VITE_LOVE_NAME) ?? fallback.name,
    message: text(env.VITE_LOVE_MESSAGE) ?? fallback.message,
    songBpm: positive(env.VITE_SONG_BPM) ?? fallback.songBpm,
    songStartSec: positive(env.VITE_SONG_START_SEC) ?? fallback.songStartSec,
  }
}
