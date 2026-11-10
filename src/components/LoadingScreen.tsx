import { useEffect, useRef } from 'react'

export function LoadingScreen({ onDone, durationMs = 2500 }: { onDone: () => void; durationMs?: number }) {
  const done = useRef(onDone)
  useEffect(() => {
    done.current = onDone
  }, [onDone])

  useEffect(() => {
    const id = setTimeout(() => done.current(), durationMs)
    return () => clearTimeout(id)
  }, [durationMs])

  return (
    <main className="screen loading">
      <div className="loading-heart" aria-hidden="true">
        ❤
      </div>
      <p className="loading-text">Dis-le-moi dans plusieurs langues… 💕</p>
    </main>
  )
}
