export type Phase = 'appear' | 'converge' | 'final'
export type Durations = { appear: number; converge: number }
export type PhaseState = { phase: Phase; progress: number; phaseElapsed: number }

export const DURATIONS: Durations = { appear: 800, converge: 3000 }

/** Temps écoulé depuis le début de l'animation → phase courante et progression dans [0, 1]. */
export function getPhase(elapsedMs: number, d: Durations = DURATIONS): PhaseState {
  const t = Math.max(0, elapsedMs)
  if (t < d.appear) return { phase: 'appear', progress: t / d.appear, phaseElapsed: t }
  const c = t - d.appear
  if (c < d.converge) return { phase: 'converge', progress: c / d.converge, phaseElapsed: c }
  return { phase: 'final', progress: 1, phaseElapsed: c - d.converge }
}
