import { useState, type FormEvent } from 'react'

export function WelcomeScreen({ onSubmit }: { onSubmit: (phrase: string) => void }) {
  const [phrase, setPhrase] = useState("Je t'aime ❤️")
  const empty = phrase.trim() === ''

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!empty) onSubmit(phrase.trim())
  }

  return (
    <main className="screen welcome">
      <form className="welcome-card" onSubmit={submit}>
        <h1 className="title">Dis-moi que tu m’aimes 🥺 !</h1>
        <input
          className="phrase-input"
          aria-label="Ta phrase"
          value={phrase}
          maxLength={40}
          onChange={(e) => setPhrase(e.target.value)}
        />
        <button className="cta" type="submit" disabled={empty}>
          Dis-le dans toutes les langues →
        </button>
      </form>
    </main>
  )
}
