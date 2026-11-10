import { useCallback, useRef, useState } from 'react'
import type { Phase } from './animation/timeline'
import { createHeartbeat, type Heartbeat } from './audio/heartbeat'
import { createMusic, type Music } from './audio/music'
import { waitForFonts } from './animation/fonts'
import { Controls } from './components/Controls'
import { allWords } from './animation/words'
import { HeartCanvas } from './components/HeartCanvas'
import { LanguagesScreen } from './components/LanguagesScreen'
import { WelcomeScreen } from './components/WelcomeScreen'
import { config } from './config'

type Screen = 'welcome' | 'languages' | 'heart'

/** La phrase mise en valeur au-dessus du prénom. */
const PHRASE = "Je t'aime ❤️"
type AudioState = { ctx?: AudioContext; heartbeat?: Heartbeat; music?: Music }

function prefersReducedMotion(): boolean {
  return typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function getAudioContextCtor(): (new () => AudioContext) | undefined {
  const w = globalThis as unknown as {
    AudioContext?: new () => AudioContext
    webkitAudioContext?: new () => AudioContext
  }
  return w.AudioContext ?? w.webkitAudioContext
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('welcome')
  const [muted, setMuted] = useState(false)
  const [runId, setRunId] = useState(0)
  const audio = useRef<AudioState>({})
  const started = useRef(false)

  const start = () => {
    if (started.current) return // double tap : un seul lancement
    started.current = true
    // Les polices se chargent pendant l'écran des langues.
    void waitForFonts(allWords(PHRASE).map((w) => w.text).join('') + config.name)

    // Créé dans le gestionnaire de clic : c'est ce qui autorise le son (iOS compris).
    const Ctor = getAudioContextCtor()
    if (Ctor) {
      try {
        audio.current.ctx ??= new Ctor()
        void audio.current.ctx.resume?.()
        audio.current.heartbeat = createHeartbeat(audio.current.ctx)
        audio.current.heartbeat.setMuted(muted)
        audio.current.heartbeat.start(60)
      } catch {
        audio.current.heartbeat = undefined
      }
    }
    audio.current.music = createMusic(config.songUrl, config.songStartSec)
    audio.current.music.unlock() // dans le geste : sinon iOS refusera la lecture 6 s plus tard
    audio.current.music.setMuted(muted)
    setScreen('languages')
  }

  // Clic vers le cœur : la chanson démarre dans le geste, le battement s'efface.
  const showHeart = () => {
    if (screen !== 'languages') return // double tap : une seule chanson
    setScreen('heart')
    const { heartbeat, music } = audio.current
    if (!music) return
    void music.play(2000).then(() => {
      if (!music.failed) heartbeat?.fadeOut(2000)
    })
  }

  // Sans chanson (fichier absent, lecture refusée), le battement accompagne la formation du cœur.
  const onPhaseChange = useCallback((phase: Phase) => {
    if (phase === 'converge' && audio.current.music?.failed !== false) audio.current.heartbeat?.setBpm(80)
  }, [])

  const toggleMute = () => {
    const next = !muted
    setMuted(next)
    audio.current.heartbeat?.setMuted(next)
    audio.current.music?.setMuted(next)
  }

  const replay = () => {
    audio.current.heartbeat?.stop()
    audio.current.music?.stop()
    audio.current.heartbeat = undefined
    audio.current.music = undefined
    started.current = false
    setRunId((n) => n + 1)
    setScreen('welcome')
  }

  return (
    <div className="app">
      {screen === 'welcome' && <WelcomeScreen onStart={start} />}
      {screen === 'languages' && <LanguagesScreen onNext={showHeart} />}
      {screen === 'heart' && (
        <div className="screen heart" data-testid="heart-stage" key={runId}>
          <HeartCanvas
            phrase={PHRASE}
            songBpm={config.songBpm}
            name={config.name}
            message={config.message}
            reducedMotion={prefersReducedMotion()}
            onPhaseChange={onPhaseChange}
          />
        </div>
      )}
      {screen !== 'welcome' && (
        <Controls muted={muted} onToggleMute={toggleMute} onReplay={screen === 'heart' ? replay : undefined} />
      )}
    </div>
  )
}
