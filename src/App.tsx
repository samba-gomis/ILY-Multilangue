import { useCallback, useRef, useState } from 'react'
import type { Phase } from './animation/timeline'
import { createHeartbeat, type Heartbeat } from './audio/heartbeat'
import { createMusic, type Music } from './audio/music'
import { waitForFonts } from './animation/fonts'
import { Controls } from './components/Controls'
import { allWords } from './animation/words'
import { HeartCanvas } from './components/HeartCanvas'
import { LoadingScreen } from './components/LoadingScreen'
import { WelcomeScreen } from './components/WelcomeScreen'
import { config } from './config'

type Screen = 'welcome' | 'loading' | 'heart'
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
  const [phrase, setPhrase] = useState('')
  const [muted, setMuted] = useState(false)
  const [runId, setRunId] = useState(0)
  const audio = useRef<AudioState>({})
  const started = useRef(false)

  const start = (text: string) => {
    if (started.current) return // double tap : un seul lancement
    started.current = true
    setPhrase(text)
    // Les polices se chargent pendant l'écran d'attente.
    void waitForFonts(allWords(text).map((w) => w.text).join('') + config.name)

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
    setScreen('loading')
  }

  const onPhaseChange = useCallback((phase: Phase) => {
    const { heartbeat, music } = audio.current
    if (phase === 'converge') heartbeat?.setBpm(80)
    if (phase === 'final' && music) {
      void music.play(2000).then(() => {
        if (!music.failed) heartbeat?.fadeOut(2000)
      })
    }
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
      {screen === 'welcome' && <WelcomeScreen onSubmit={start} />}
      {screen === 'loading' && <LoadingScreen onDone={() => setScreen('heart')} />}
      {screen === 'heart' && (
        <div className="screen heart" data-testid="heart-stage" key={runId}>
          <HeartCanvas
            phrase={phrase}
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
