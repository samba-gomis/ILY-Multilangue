import type { AppConfig } from './types'

/** Prend la config locale (personnelle, ignorée par git) si elle existe, sinon l'exemple. */
export function resolveConfig(
  localModules: Record<string, { default: AppConfig }>,
  fallback: AppConfig,
): AppConfig {
  const first = Object.values(localModules)[0]
  return first ? first.default : fallback
}
