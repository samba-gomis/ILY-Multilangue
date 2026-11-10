export function WelcomeScreen({ onStart }: { onStart: () => void }) {
  return (
    <main className="screen welcome">
      <div className="welcome-card">
        <h1 className="title">Dis-moi que tu m’aimes 🥺 !</h1>
        <button className="cta" type="button" onClick={onStart}>
          Je t’aime ❤️
        </button>
      </div>
    </main>
  )
}
