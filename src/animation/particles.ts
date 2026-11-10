import type { Placement } from './layout'
import type { Phase } from './timeline'
import type { Box, Point } from './types'

/** x / y = position courante ; targetX / targetY = place dans le cœur. */
export type TextParticle = Placement & {
  targetX: number
  targetY: number
  opacity: number
  phaseOffset: number
}

const LERP = 0.035 // par frame de 16,67 ms
const FRAME_MS = 16.67
const MAX_DT = 50 // évite les sauts après un retour sur l'onglet
const PULSE = 0.045
/** Opacité des traductions déjà passées pendant le défilement (en fond). */
export const PARADE_GHOST_OPACITY = 0.3

export function createParticles(placements: Placement[], viewport: Box, rng: () => number): TextParticle[] {
  return placements.map((p) => ({
    ...p,
    targetX: p.x,
    targetY: p.y,
    x: rng() * viewport.width,
    y: rng() * viewport.height,
    opacity: 0,
    phaseOffset: rng() * Math.PI * 2,
  }))
}

export function updateParticles(
  ps: TextParticle[],
  phase: Phase,
  progress: number,
  dtMs: number,
  reducedMotion: boolean,
  /** Pendant le défilement : textes déjà affichés en gros. */
  shown?: ReadonlySet<string>,
): void {
  const dt = Math.min(Math.max(dtMs, 0), MAX_DT)
  const k = 1 - (1 - LERP) ** (dt / FRAME_MS)
  for (const p of ps) {
    if (phase === 'parade') {
      p.opacity = shown?.has(p.text) ? PARADE_GHOST_OPACITY : 0
      continue
    }
    if (reducedMotion) {
      p.x = p.targetX
      p.y = p.targetY
    } else if (phase !== 'appear') {
      p.x += (p.targetX - p.x) * k
      p.y += (p.targetY - p.y) * k
    }
    p.opacity = phase === 'appear' ? Math.max(p.opacity, Math.min(1, Math.max(0, progress))) : 1
  }
}

/** Échelle du cœur : 1 au repos, pic à 1 + PULSE sur chaque battement (« lub » puis « dub » plus faible). */
export function pulseScale(timeMs: number, songBpm: number): number {
  const bpm = songBpm > 100 ? songBpm / 2 : songBpm
  const period = 60000 / bpm
  const phase = (((timeMs % period) + period) % period) / period
  const bump = (center: number) => {
    const d = Math.min(Math.abs(phase - center), 1 - Math.abs(phase - center))
    return Math.exp(-((d * 12) ** 2))
  }
  return 1 + PULSE * Math.min(1, Math.max(bump(0), 0.6 * bump(0.2)))
}

/** Petit flottement propre à chaque mot (≤ 1,5 px). */
export function floatOffset(timeMs: number, phaseOffset: number): Point {
  return {
    x: Math.sin((timeMs / 1700) * Math.PI * 2 + phaseOffset),
    y: Math.cos((timeMs / 2300) * Math.PI * 2 + phaseOffset * 1.3),
  }
}
