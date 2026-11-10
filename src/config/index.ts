import example from './config.example'
import { resolveConfig } from './resolveConfig'
import type { AppConfig } from './types'

export type { AppConfig }

export const config: AppConfig = resolveConfig(
  import.meta.glob<{ default: AppConfig }>('./config.local.ts', { eager: true }),
  example,
)
