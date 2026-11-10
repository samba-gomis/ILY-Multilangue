import { useEffect, useRef, useState } from 'react'
import { DISPLAY_FONT, FONT_STACK, waitForFonts } from '../animation/fonts'
import { layoutWords, mulberry32, type Layout, type Measure } from '../animation/layout'
import { createParticles, floatOffset, pulseScale, updateParticles, type TextParticle } from '../animation/particles'
import { DURATIONS, getPhase, paradeSlot, type Phase } from '../animation/timeline'
import { stageBox } from '../animation/stage'
import { allWords, paradeOrder } from '../animation/words'

type Props = {
  phrase: string
  songBpm: number
  name: string
  message: string
  reducedMotion: boolean
  onPhaseChange: (p: Phase) => void
  /** Durée d'affichage de chaque traduction pendant le défilement (0 = pas de défilement). */
  paradeStepMs?: number
}

const MESSAGE_DELAY_MS = 3000
const RESIZE_DEBOUNCE_MS = 150
const LAYOUT_SEED = 7
const CREAM = '#fdeef4'
const ROSE = '#ff6b9a'
const PHASE_ORDER: Phase[] = ['parade', 'appear', 'converge', 'final']
const ANNOUNCED: Phase[] = ['converge', 'final'] // phases signalées à App (audio)
const PARADE_STEP_MS = 500

export function HeartCanvas({
  phrase,
  songBpm,
  name,
  message,
  reducedMotion,
  onPhaseChange,
  paradeStepMs = PARADE_STEP_MS,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const messageRef = useRef<HTMLParagraphElement>(null)
  const [showMessage, setShowMessage] = useState(false)
  const phaseCb = useRef(onPhaseChange)
  useEffect(() => {
    phaseCb.current = onPhaseChange
  }, [onPhaseChange])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const words = allWords(phrase)
    const parade = paradeOrder()
    const durations = { ...DURATIONS, parade: paradeStepMs * parade.length }
    const shown = new Set<string>() // traductions déjà passées en gros
    const measure: Measure = (text, size, weight = 400) => {
      ctx.font = `${weight} ${size}px ${FONT_STACK}`
      return ctx.measureText(text).width
    }

    let raf = 0
    let cancelled = false
    let resizeTimer: ReturnType<typeof setTimeout> | undefined
    let width = 0
    let height = 0
    let layout: Layout | null = null
    let particles: TextParticle[] = []
    let startAt: number | null = null
    let lastAt: number | null = null
    let lastPhase: Phase = PHASE_ORDER[0]
    let messageShown = false

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      // Le message (même encore invisible) occupe déjà sa place : on la mesure pour que le cœur ne le chevauche pas.
      const msgTop = messageRef.current?.getBoundingClientRect().top ?? height
      layout = layoutWords(words, stageBox({ width, height }, height - msgTop + 16), measure, LAYOUT_SEED)
      const fresh = createParticles(layout.placements, { width, height }, mulberry32(42))
      // Au redimensionnement, les mots existants repartent de leur position actuelle.
      particles = fresh.map((p, i) => {
        const old = particles[i]
        return old ? { ...p, x: old.x, y: old.y, opacity: old.opacity, phaseOffset: old.phaseOffset } : p
      })
    }

    const drawName = (l: Layout, alpha: number) => {
      const z = l.nameZone
      let size = z.height * 0.8
      ctx.font = `700 ${size}px ${DISPLAY_FONT}`
      const w = ctx.measureText(name).width
      if (w > z.width) size *= z.width / w
      ctx.font = `700 ${size}px ${DISPLAY_FONT}`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.globalAlpha = alpha
      ctx.fillStyle = '#ffffff'
      ctx.shadowColor = ROSE
      ctx.shadowBlur = 18
      ctx.fillText(name, z.x + z.width / 2, z.y + z.height / 2)
      ctx.shadowBlur = 0
    }

    const draw = (phase: Phase, progress: number, phaseElapsed: number, now: number) => {
      if (!layout) return
      ctx.clearRect(0, 0, width, height)
      ctx.save()
      const final = phase === 'final'
      const beat = final ? pulseScale(phaseElapsed, songBpm) : 1
      let alphaMul = 1
      if (final && !reducedMotion) {
        const c = layout.center
        ctx.translate(c.x, c.y)
        ctx.scale(beat, beat)
        ctx.translate(-c.x, -c.y)
      } else if (final) {
        alphaMul = 0.85 + 0.15 * ((beat - 1) / 0.045) // pulsation douce par l'opacité
      }

      ctx.textAlign = 'left'
      ctx.textBaseline = 'alphabetic'
      for (const p of particles) {
        if (p.opacity <= 0) continue
        const off = final && !reducedMotion ? floatOffset(now, p.phaseOffset) : { x: 0, y: 0 }
        ctx.font = `${p.highlight ? 600 : 400} ${p.size}px ${FONT_STACK}`
        ctx.direction = p.dir === 'rtl' ? 'rtl' : 'ltr'
        ctx.globalAlpha = p.opacity * (p.highlight ? 1 : 0.85) * alphaMul
        ctx.fillStyle = p.highlight ? '#ffffff' : CREAM
        ctx.shadowColor = ROSE
        ctx.shadowBlur = p.highlight ? 14 : 0
        ctx.fillText(p.text, p.x + off.x, p.y + off.y)
      }
      ctx.direction = 'ltr'
      ctx.shadowBlur = 0

      const nameAlpha = phase === 'parade' || phase === 'appear' ? 0 : phase === 'converge' ? progress : 1
      if (nameAlpha > 0) drawName(layout, nameAlpha * (final ? alphaMul : 1))
      ctx.restore()
    }

    /** Traduction en cours, en gros au centre, avec « Langue · Pays » en dessous. */
    const drawParade = (index: number, local: number) => {
      const t = parade[index]
      const alpha = Math.min(1, local / 0.2, (1 - local) / 0.2)
      let size = Math.min(width * 0.13, height * 0.12, 84)
      ctx.font = `600 ${size}px ${FONT_STACK}`
      const w = ctx.measureText(t.text).width
      if (w > width * 0.88) size *= (width * 0.88) / w
      const cx = width / 2
      const cy = height * 0.45
      ctx.save()
      ctx.textAlign = 'center'
      ctx.textBaseline = 'alphabetic'
      ctx.direction = t.dir === 'rtl' ? 'rtl' : 'ltr'
      ctx.globalAlpha = Math.max(0, alpha)
      ctx.fillStyle = '#ffffff'
      ctx.shadowColor = ROSE
      ctx.shadowBlur = 24
      ctx.font = `600 ${size}px ${FONT_STACK}`
      ctx.fillText(t.text, cx, cy)
      ctx.direction = 'ltr'
      ctx.shadowBlur = 0
      ctx.globalAlpha = Math.max(0, alpha) * 0.85
      ctx.fillStyle = CREAM
      ctx.font = `400 ${Math.max(15, size * 0.3)}px ${FONT_STACK}`
      ctx.fillText(`${t.label} · ${t.country}`, cx, cy + Math.max(28, size * 0.75))
      ctx.restore()
    }

    const frame = (now: number) => {
      if (startAt === null) startAt = now
      const dt = lastAt === null ? 16.67 : now - lastAt
      lastAt = now
      const { phase, progress, phaseElapsed } = getPhase(now - startAt, durations)

      // Annonce chaque phase une fois, sans en sauter (frame tardive après un onglet en arrière-plan).
      for (let i = PHASE_ORDER.indexOf(lastPhase) + 1; i <= PHASE_ORDER.indexOf(phase); i++)
        if (ANNOUNCED.includes(PHASE_ORDER[i])) phaseCb.current(PHASE_ORDER[i])
      lastPhase = phase

      const slot = phase === 'parade' ? paradeSlot(phaseElapsed, paradeStepMs, parade.length) : null
      const passed = slot ? slot.index : parade.length
      for (let i = shown.size; i < passed; i++) shown.add(parade[i].text)

      updateParticles(particles, phase, progress, dt, reducedMotion, shown)
      draw(phase, progress, phaseElapsed, now)
      if (slot) drawParade(slot.index, slot.local)

      if (phase === 'final' && phaseElapsed >= MESSAGE_DELAY_MS && !messageShown) {
        messageShown = true
        setShowMessage(true)
      }
      raf = requestAnimationFrame(frame)
    }

    const onResize = () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(resize, RESIZE_DEBOUNCE_MS)
    }

    void waitForFonts(words.map((w) => w.text).join('') + name).then(() => {
      if (cancelled) return
      resize()
      raf = requestAnimationFrame(frame)
    })
    window.addEventListener('resize', onResize)

    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
      clearTimeout(resizeTimer)
      window.removeEventListener('resize', onResize)
    }
  }, [phrase, songBpm, name, reducedMotion, paradeStepMs])

  return (
    <>
      <canvas ref={canvasRef} aria-label={`${name} — « Je t'aime » dans toutes les langues, en forme de cœur`} role="img" />
      <p ref={messageRef} className={showMessage ? 'message visible' : 'message'}>{message}</p>
    </>
  )
}
