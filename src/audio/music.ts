export type Music = {
  play(fadeMs: number): Promise<void>
  setMuted(m: boolean): void
  stop(): void
  readonly failed: boolean
}

const FADE_STEP_MS = 50

/** La chanson : boucle, fondu d'entrée, échec silencieux (fichier absent, lecture refusée). */
export function createMusic(url: string, startSec: number, AudioCtor: typeof Audio = Audio): Music {
  const el = new AudioCtor(url)
  el.loop = true
  el.preload = 'auto'
  let failed = false
  let fade: ReturnType<typeof setInterval> | null = null
  el.addEventListener?.('error', () => {
    failed = true
  })

  const clearFade = () => {
    if (fade) clearInterval(fade)
    fade = null
  }

  return {
    async play(fadeMs) {
      clearFade()
      try {
        el.currentTime = startSec
        el.volume = 0
        await el.play()
      } catch {
        failed = true
        return
      }
      const step = FADE_STEP_MS / Math.max(fadeMs, FADE_STEP_MS)
      fade = setInterval(() => {
        el.volume = Math.min(1, el.volume + step)
        if (el.volume >= 1) clearFade()
      }, FADE_STEP_MS)
    },
    setMuted(m) {
      el.muted = m
    },
    stop() {
      clearFade()
      el.pause()
    },
    get failed() {
      return failed
    },
  }
}
