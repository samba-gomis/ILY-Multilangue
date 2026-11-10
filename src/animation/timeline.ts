export type Phase = 'parade' | 'appear' | 'converge' | 'final'
/** `parade` : durée du défilement des traductions une par une (0 = pas de défilement). */
export type Durations = { parade?: number; appear: number; converge: number }
export type PhaseState = { phase: Phase; progress: number; phaseElapsed: number }

export const DURATIONS: Durations = { parade: 0, appear: 800, converge: 3000 }

/** Temps écoulé depuis le début de l'animation → phase courante et progression dans [0, 1]. */
export function getPhase(elapsedMs: number, d: Durations = DURATIONS): PhaseState {
  let t = Math.max(0, elapsedMs)
  const parade = d.parade ?? 0
  if (t < parade) return { phase: 'parade', progress: t / parade, phaseElapsed: t }
  t -= parade
  if (t < d.appear) return { phase: 'appear', progress: t / d.appear, phaseElapsed: t }
  const c = t - d.appear
  if (c < d.converge) return { phase: 'converge', progress: c / d.converge, phaseElapsed: c }
  return { phase: 'final', progress: 1, phaseElapsed: c - d.converge }
}

/** Pendant le défilement : indice de la traduction affichée et avancement dans son créneau, ou null après. */
export function paradeSlot(elapsedMs: number, stepMs: number, count: number): { index: number; local: number } | null {
  if (stepMs <= 0) return null
  const index = Math.floor(Math.max(0, elapsedMs) / stepMs)
  if (index >= count) return null
  return { index, local: (Math.max(0, elapsedMs) - index * stepMs) / stepMs }
}
