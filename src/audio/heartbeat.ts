export type BeatEvent = { time: number; kind: 'lub' | 'dub' }

const DUB_DELAY = 0.25 // secondes entre « lub » et « dub »
const LOOKAHEAD = 0.1 // secondes programmées à l'avance
const TICK_MS = 25
const MASTER = 0.8

/** Battements dans la fenêtre [fromSec, toSec), alignés sur firstBeatSec. Pur. */
export function beatTimes(bpm: number, fromSec: number, toSec: number, firstBeatSec: number): BeatEvent[] {
  const period = 60 / bpm
  const out: BeatEvent[] = []
  let n = Math.max(0, Math.floor((fromSec - firstBeatSec - DUB_DELAY) / period))
  for (; ; n++) {
    const lub = firstBeatSec + n * period
    if (lub >= toSec) break
    if (lub >= fromSec) out.push({ time: lub, kind: 'lub' })
    const dub = lub + DUB_DELAY
    if (dub >= fromSec && dub < toSec) out.push({ time: dub, kind: 'dub' })
  }
  return out.sort((a, b) => a.time - b.time)
}

export type Heartbeat = {
  start(bpm: number): void
  setBpm(bpm: number): void
  fadeOut(ms: number): void
  stop(): void
  setMuted(m: boolean): void
}

/** Battement de cœur synthétisé : deux impulsions graves, la seconde plus faible. */
export function createHeartbeat(ctx: AudioContext): Heartbeat {
  const master = ctx.createGain()
  master.gain.value = MASTER
  master.connect(ctx.destination)

  let timer: ReturnType<typeof setInterval> | null = null
  let fadeTimer: ReturnType<typeof setTimeout> | null = null
  let bpm = 60
  let anchor = 0 // instant d'un « lub » de référence
  let scheduledUntil = 0
  let muted = false

  function pulse(time: number, kind: BeatEvent['kind']) {
    const osc = ctx.createOscillator()
    const env = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(kind === 'lub' ? 55 : 48, time)
    const peak = kind === 'lub' ? 1 : 0.6
    env.gain.setValueAtTime(0.0001, time)
    env.gain.linearRampToValueAtTime(peak, time + 0.012)
    env.gain.exponentialRampToValueAtTime(0.0001, time + 0.12)
    osc.connect(env)
    env.connect(master)
    osc.start(time)
    osc.stop(time + 0.15)
  }

  function tick() {
    const until = ctx.currentTime + LOOKAHEAD
    for (const e of beatTimes(bpm, scheduledUntil, until, anchor)) pulse(e.time, e.kind)
    scheduledUntil = until
  }

  function stop() {
    if (timer) clearInterval(timer)
    if (fadeTimer) clearTimeout(fadeTimer)
    timer = null
    fadeTimer = null
  }

  function setBpm(newBpm: number) {
    // Le dernier « lub » déjà programmé devient la référence : son « dub » reste dû,
    // et le suivant arrive au nouveau tempo.
    const period = 60 / bpm
    const n = Math.floor((scheduledUntil - anchor) / period)
    anchor = anchor + Math.max(0, n) * period
    bpm = newBpm
  }

  return {
    start(newBpm) {
      if (timer) return setBpm(newBpm) // déjà en marche : pas de second battement
      stop()
      bpm = newBpm
      anchor = ctx.currentTime + 0.05
      scheduledUntil = ctx.currentTime
      master.gain.cancelScheduledValues(ctx.currentTime)
      master.gain.setValueAtTime(muted ? 0 : MASTER, ctx.currentTime)
      tick()
      timer = setInterval(tick, TICK_MS)
    },
    setBpm,
    fadeOut(ms) {
      const now = ctx.currentTime
      master.gain.cancelScheduledValues(now)
      master.gain.setValueAtTime(muted ? 0 : MASTER, now)
      master.gain.linearRampToValueAtTime(0, now + ms / 1000)
      if (fadeTimer) clearTimeout(fadeTimer)
      fadeTimer = setTimeout(stop, ms)
    },
    stop,
    setMuted(m) {
      muted = m
      master.gain.cancelScheduledValues(ctx.currentTime)
      master.gain.setValueAtTime(m ? 0 : MASTER, ctx.currentTime)
    },
  }
}
