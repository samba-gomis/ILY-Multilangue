export type Music = {
  /** À appeler dans le gestionnaire du clic : iOS n'autorise ensuite play() que sur un élément déjà amorcé. */
  unlock(): void
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
  let muted = false
  let priming = false
  let started = false
  let fade: ReturnType<typeof setInterval> | null = null
  el.addEventListener?.('error', () => {
    failed = true
  })

  const clearFade = () => {
    if (fade) clearInterval(fade)
    fade = null
  }

  return {
    unlock() {
      priming = true
      el.muted = true
      const done = () => {
        priming = false
        el.muted = muted
      }
      try {
        void el
          .play()
          .then(() => {
            if (!started) el.pause()
          })
          .catch(() => {})
          .finally(done)
      } catch {
        done()
      }
    },
    async play(fadeMs) {
      started = true
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
      muted = m
      if (!priming) el.muted = m
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
