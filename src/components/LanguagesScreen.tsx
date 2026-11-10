/** Écran 2 : elle tape le bouton pour faire apparaître le cœur (et lancer la chanson). */
export function LanguagesScreen({ onNext }: { onNext: () => void }) {
  return (
    <main className="screen loading">
      <div className="loading-heart" aria-hidden="true">
        ❤
      </div>
      <button className="cta" type="button" onClick={onNext}>
        Dis-le-moi dans plusieurs langues…{' '}💕
      </button>
    </main>
  )
}
