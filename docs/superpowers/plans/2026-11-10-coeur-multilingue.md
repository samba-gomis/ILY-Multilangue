# Cœur multilingue « Je t'aime » — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Une page statique où ~80 « Je t'aime » convergent en un cœur battant, avec prénom, message et chanson, déployable par dépôt manuel sur Netlify.

**Architecture:** Vite + React pour trois écrans pilotés par une machine à états dans `App.tsx`. Toute la géométrie, la disposition, la chronologie et la physique des particules sont des modules TypeScript purs testés avec Vitest ; `HeartCanvas` ne fait que les brancher sur un `<canvas>` et `requestAnimationFrame`. L'audio (battement synthétisé + MP3) est isolé dans `src/audio/` et piloté par `App` via les changements de phase.

**Tech Stack:** Vite (template `react-ts`), React, TypeScript, Vitest + jsdom + @testing-library/react + @testing-library/user-event, Canvas 2D, Web Audio API, Google Fonts (Noto + Dancing Script), Playwright MCP pour la vérification visuelle.

**Spec:** `docs/superpowers/specs/2026-11-10-coeur-multilingue-design.md`

## Global Constraints

- Aucun backend, aucune API de traduction, aucun export vidéo.
- Textes exacts : titre `Dis-moi que tu m’aimes 🥺 !` ; champ prérempli `Je t'aime ❤️` ; bouton `Dis-le dans toutes les langues →` ; chargement `Je cherche toutes les façons de te le dire… 💕`.
- Durées : chargement 2500 ms ; apparition 800 ms ; convergence 3000 ms ; message 3000 ms après le début de la phase finale.
- Lerp de convergence `0.035` par frame de 16,67 ms, normalisé par dt : `k = 1 - (1 - 0.035) ** (dt / 16.67)`. dt plafonné à 50 ms.
- `devicePixelRatio` plafonné à 2. Réduction de police max d'un mot : jusqu'à 70 % de la taille de base.
- Battement synthétisé : 60 bpm au chargement, 80 bpm pendant la convergence, fondu de sortie 2000 ms quand la chanson démarre. Chanson : fondu d'entrée 2000 ms, `loop = true`. Pulsation du cœur au BPM de la chanson, ou BPM/2 si BPM > 100.
- Wolof : deux entrées, `Damala beug` et `Dama la nob`. Pas d'emoji drapeau. Entrées incertaines marquées `// À VÉRIFIER`.
- `.gitignore` contient `src/config/config.local.ts`, `public/music/*.mp3`, `node_modules`, `dist`. (La spec écrit `src/config.local.ts` ; le plan regroupe la config dans `src/config/` — même rôle, chemin ajusté.)
- Champ de saisie : `maxLength={40}` ; bouton désactivé si `phrase.trim() === ""`.
- Commits : messages en français, **sans** ligne `Co-Authored-By` (préférence de Samba). Aucun `git push` ni déploiement Netlify sans son accord explicite.

## Review Focus

1. **Double tap / ↺ martelé** — taper deux fois le bouton ou ↺ ne doit lancer qu'un chargement, une boucle rAF, une piste audio. → tests Task 6 (`double submit ne lance qu'un chargement`) et Task 7 (`unmount annule la boucle`).
2. **Phrase longue saisie** (40 caractères) — elle doit rester entièrement dans le cœur, réduite ou ignorée, jamais débordante. → test Task 3 (`un mot trop large n'est jamais placé hors du cœur`).
3. **Phrase vide ou espaces seuls** — bouton désactivé. → test Task 6.
4. **Téléphone en paysage** (667×375) — cœur et zone du prénom tiennent dans l'écran. → test Task 3 (`tient en 667×375`).
5. **Retour sur l'onglet après un long moment** (dt énorme) — pas de saut au-delà de la cible ni de NaN. → test Task 4 (`dt énorme ne dépasse pas la cible`).

---

### Task 1: Scaffold, configuration perso et outillage de tests

**Files:**
- Create: projet Vite `react-ts` à la racine du repo (`package.json`, `index.html`, `vite.config.ts`, `tsconfig*.json`, `src/main.tsx`, `src/App.tsx`)
- Create: `src/config/types.ts`, `src/config/resolveConfig.ts`, `src/config/config.example.ts`, `src/config/index.ts`
- Create: `src/test/setup.ts`, `.gitignore` (fusion), `README.md`, `public/music/.gitkeep`
- Test: `src/config/resolveConfig.test.ts`

**Interfaces:**
- Produces: `type AppConfig = { name: string; message: string; songUrl: string; songBpm: number; songStartSec: number }` ; `resolveConfig(localModules: Record<string, { default: AppConfig }>, fallback: AppConfig): AppConfig` ; `export const config: AppConfig` depuis `src/config/index.ts`.

- [ ] **Step 1: Scaffold** — le dossier n'est pas vide (LICENSE, docs, .git), donc générer dans un dossier frère puis déplacer :
  `cd ..; npm create vite@latest ily-tmp -- --template react-ts`, copier le contenu de `ily-tmp` dans le repo (fusionner `.gitignore`), supprimer `ily-tmp`. Puis `npm install` et `npm i -D vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event`. Supprimer le contenu de démo (`src/assets`, `App.css`, logos) et laisser un `App` qui affiche le titre.
- [ ] **Step 2: Vitest** — dans `vite.config.ts` : `test: { environment: "jsdom", setupFiles: "./src/test/setup.ts", globals: true }` (référence `/// <reference types="vitest/config" />`). `setup.ts` importe `@testing-library/jest-dom/vitest`. Scripts `package.json` : `"test": "vitest run"`, `"test:watch": "vitest"`.
- [ ] **Step 3: Écrire le test qui échoue**

```ts
// src/config/resolveConfig.test.ts
const example: AppConfig = { name: "Ma chérie", message: "Message d'exemple", songUrl: "/music/chanson.mp3", songBpm: 72, songStartSec: 0 };
test("retombe sur l'exemple sans config locale", () => {
  expect(resolveConfig({}, example)).toEqual(example);
});
test("utilise la config locale si présente", () => {
  const local = { ...example, name: "Aïda" };
  expect(resolveConfig({ "./config.local.ts": { default: local } }, example).name).toBe("Aïda");
});
```

- [ ] **Step 4:** `npm test` → FAIL (`resolveConfig` introuvable).
- [ ] **Step 5: Implémenter** `resolveConfig` (premier module trouvé sinon fallback) ; `config.example.ts` exporte par défaut les valeurs d'exemple ci-dessus ; `index.ts` : `resolveConfig(import.meta.glob<{ default: AppConfig }>("./config.local.ts", { eager: true }), example)`.
- [ ] **Step 6:** `npm test` → PASS ; `npm run build` → succès **sans** `config.local.ts` présent.
- [ ] **Step 7: `.gitignore` + README** — lignes de Global Constraints ; README court : lancer, tester, personnaliser (copier `config.example.ts` en `config.local.ts`, déposer `public/music/chanson.mp3`), builder, déployer `dist/`.
- [ ] **Step 8: Commit** — `git add -A && git commit -m "chore: scaffold Vite React TS, config perso et Vitest"` (vérifier avec `git status` qu'aucun `config.local.ts` ni `.mp3` n'est suivi).

---

### Task 2: Données de traduction

**Files:**
- Create: `src/data/translations.ts`
- Test: `src/data/translations.test.ts`

**Interfaces:**
- Produces: `type Translation = { lang: string; label: string; text: string; dir?: "rtl" }` ; `export const translations: Translation[]`.

- [ ] **Step 1: Écrire les tests**

```ts
test("entre 75 et 90 entrées", () => { expect(translations.length).toBeGreaterThanOrEqual(75); expect(translations.length).toBeLessThanOrEqual(90); });
test("aucun texte vide", () => { for (const t of translations) expect(t.text.trim()).not.toBe(""); });
test("pas de doublon de texte", () => { expect(new Set(translations.map(t => t.text)).size).toBe(translations.length); });
test("rtl pour ar, he, fa, ur", () => {
  for (const lang of ["ar", "he", "fa", "ur"]) {
    const e = translations.filter(t => t.lang === lang);
    expect(e.length).toBeGreaterThan(0);
    for (const t of e) expect(t.dir).toBe("rtl");
  }
});
test("wolof présent sous les deux formes", () => {
  const wo = translations.filter(t => t.lang === "wo").map(t => t.text);
  expect(wo).toEqual(expect.arrayContaining(["Damala beug", "Dama la nob"]));
});
test("formes romantiques imposées", () => {
  const byLang = (l: string) => translations.find(t => t.lang === l)?.text;
  expect(byLang("es")).toBe("Te amo"); expect(byLang("it")).toBe("Ti amo");
  expect(byLang("ja")).toBe("愛してる"); expect(byLang("ko")).toBe("사랑해"); expect(byLang("zh")).toBe("我爱你");
});
test("le français est présent", () => { expect(translations.some(t => t.lang === "fr" && t.text === "Je t'aime")).toBe(true); });
```

- [ ] **Step 2:** `npm test -- translations` → FAIL.
- [ ] **Step 3: Écrire la liste** — couvrir les écritures listées en spec §6 (latine, arabe, hébreu, cyrillique, grec, devanagari, bengali, tamoul, thaï, géorgien, arménien, éthiopien, CJK) et les langues africaines/créoles (wolof ×2, peul, sérère, bambara, lingala, swahili, créoles). Pour une langue à genre (hindi, hébreu…), une seule forme, avec commentaire indiquant laquelle. `// À VÉRIFIER` sur toute entrée non certaine.
- [ ] **Step 4:** `npm test -- translations` → PASS.
- [ ] **Step 5: Commit** — `git commit -m "feat: liste vérifiée de « Je t'aime » en ~80 langues"`. Noter la liste des entrées `À VÉRIFIER` pour le rapport final à Samba.

---

### Task 3: Forme du cœur et disposition des mots

**Files:**
- Create: `src/animation/types.ts`, `src/animation/heartShape.ts`, `src/animation/layout.ts`
- Test: `src/animation/heartShape.test.ts`, `src/animation/layout.test.ts`

**Interfaces:**
- Produces:
  - `type Point = { x: number; y: number }` ; `type Box = { width: number; height: number }`
  - `heartOutline(steps: number): Point[]` (coordonnées brutes de la formule, y inversé : `y = -(13cos t − 5cos2t − 2cos3t − cos4t)`)
  - `fitToBox(points: Point[], box: Box, margin: number): Point[]` (mise à l'échelle uniforme, centrage)
  - `isInsideHeart(p: Point, outline: Point[]): boolean` (ray casting)
  - `type Measure = (text: string, size: number) => number`
  - `type WordInput = { text: string; dir?: "rtl"; highlight?: boolean }`
  - `type Placement = { text: string; x: number; y: number; size: number; dir?: "rtl"; highlight: boolean }` — `x` = bord gauche, `y` = ligne de base ; la boîte du mot va de `y - size` à `y`.
  - `type Layout = { placements: Placement[]; outline: Point[]; center: Point; nameZone: { x: number; y: number; width: number; height: number }; baseSize: number }`
  - `layoutWords(words: WordInput[], box: Box, measure: Measure, seed?: number): Layout`

- [ ] **Step 1: Tests `heartShape`**
  - `heartOutline(200)` : pour chaque point `(x, y)` il existe un point à `(-x, y)` à 1e-6 près (symétrie).
  - `fitToBox(outline, {width: 400, height: 400}, 20)` : tous les points dans `[20, 380]` sur les deux axes, et la largeur ou la hauteur couvre ≥ 359 px.
  - `isInsideHeart` : centre de la boîte → `true` ; `(0, 0)` → `false` ; point juste sous la pointe → `false`.
- [ ] **Step 2:** `npm test -- heartShape` → FAIL ; **Step 3:** implémenter ; **Step 4:** PASS.
- [ ] **Step 5: Tests `layout`** — mesure factice `const measure: Measure = (t, s) => [...t].length * s * 0.6;` et les vraies `translations` + `{ text: "Je t'aime ❤️", highlight: true }`.
  - `chaque mot placé est entièrement dans le cœur` : les 4 coins de chaque boîte satisfont `isInsideHeart(…, layout.outline)`.
  - `aucun chevauchement` : aucune paire de boîtes ne s'intersecte.
  - `zone du prénom libre` : aucune boîte n'intersecte `nameZone`.
  - `la phrase saisie est placée et mise en valeur` : exactement un placement avec `highlight: true`.
  - `au moins 60 placements` en 390×844, 1440×900 et `tient en 667×375`.
  - `un mot trop large n'est jamais placé hors du cœur` : avec un mot de 40 caractères en `highlight`, tests de bornes inchangés, et sa `size` ≥ `0.7 * baseSize` s'il est placé.
  - `déterministe` : deux appels avec le même seed → résultats identiques.
- [ ] **Step 6:** `npm test -- layout` → FAIL.
- [ ] **Step 7: Implémenter `layoutWords`** — algorithme (non déterminé par les tests) :
  1. `outline = fitToBox(heartOutline(240), box, min(box) * 0.06)` ; `center` = centre de la boîte englobante, légèrement remonté (y à 45 % de la hauteur du cœur).
  2. `nameZone` : rectangle centré sur `center`, 46 % de la largeur du cœur × 16 % de sa hauteur.
  3. `baseSize` initial = hauteur du cœur / 22. Mots mélangés avec un PRNG à seed (mulberry32), la phrase en `highlight` insérée vers le milieu de la liste pour atterrir près du centre.
  4. Lignes de `y = top + baseSize * 1.25` à `bottom`, pas de `baseSize * 1.25`. Pour chaque ligne, intersecter les **deux** lignes horizontales `y - size` et `y` avec le polygone (toutes les intersections, triées, regroupées par paires → intervalles ; les lobes du haut donnent deux intervalles), intersecter les intervalles des deux lignes, puis soustraire `nameZone`.
  5. Remplir chaque intervalle de gauche à droite avec un espacement `0.5 * size` ; un mot trop large est réduit jusqu'à `0.7 * size`, sinon on passe au mot suivant (on le réessaie sur la ligne d'après).
  6. Recycler la liste tant qu'il reste de la place ; si moins de 90 % des mots uniques sont placés, `baseSize *= 0.92` et recommencer (8 tentatives max).
- [ ] **Step 8:** `npm test -- layout` → PASS.
- [ ] **Step 9: Commit** — `git commit -m "feat: géométrie du cœur et placement des mots"`.

---

### Task 4: Chronologie et particules

**Files:**
- Create: `src/animation/timeline.ts`, `src/animation/particles.ts`
- Test: `src/animation/timeline.test.ts`, `src/animation/particles.test.ts`

**Interfaces:**
- Consumes: `Placement`, `Point`, `Box` (Task 3).
- Produces:
  - `type Phase = "appear" | "converge" | "final"` ; `type Durations = { appear: number; converge: number }` ; `export const DURATIONS: Durations = { appear: 800, converge: 3000 }`
  - `getPhase(elapsedMs: number, d?: Durations): { phase: Phase; progress: number; phaseElapsed: number }` (`progress` = 1 en phase finale)
  - `type TextParticle = Placement & { targetX: number; targetY: number; opacity: number; phaseOffset: number }` (x/y = position courante)
  - `createParticles(placements: Placement[], viewport: Box, rng: () => number): TextParticle[]`
  - `updateParticles(ps: TextParticle[], phase: Phase, progress: number, dtMs: number, reducedMotion: boolean): void`
  - `pulseScale(timeMs: number, songBpm: number): number` — 1 au repos, pic 1.045 sur chaque battement ; utilise BPM/2 si BPM > 100.
  - `floatOffset(timeMs: number, phaseOffset: number): Point` — amplitude ≤ 1,5 px.

- [ ] **Step 1: Tests `timeline`** — `getPhase(0)` → appear, 0 ; `getPhase(400)` → appear, 0.5 ; `getPhase(1000)` → converge, ≈ 0.0667 ; `getPhase(4000)` → final, 1 ; `getPhase(10000)` → final, `phaseElapsed` 6200 ; `progress` toujours dans [0, 1] (boucle 0…12000 pas 50).
- [ ] **Step 2: Tests `particles`**
  - `createParticles` : opacité 0, cible = placement, position de départ dans le viewport.
  - `après assez de convergence les particules sont à moins d'1 px de leur cible` : 300 appels `updateParticles(ps, "converge", p, 16.67, false)`.
  - `dt énorme ne dépasse pas la cible` : un seul appel avec `dtMs = 5000` → distance à la cible ≤ distance initiale, aucune coordonnée NaN.
  - `apparition` : en phase appear, l'opacité augmente avec `progress` et atteint 1 à `progress = 1`.
  - `reducedMotion` : un appel en appear place x/y exactement sur la cible.
  - `pulseScale` : valeur dans [1, 1.045] ; avec BPM 140, la période mesurée = 60000/70 ms.
- [ ] **Step 3:** `npm test -- timeline particles` → FAIL ; **Step 4:** implémenter (lerp et plafond de dt : Global Constraints) ; **Step 5:** PASS.
- [ ] **Step 6: Commit** — `git commit -m "feat: chronologie des phases et physique des particules"`.

---

### Task 5: Audio — battement synthétisé et chanson

**Files:**
- Create: `src/audio/heartbeat.ts`, `src/audio/music.ts`
- Test: `src/audio/heartbeat.test.ts`, `src/audio/music.test.ts`

**Interfaces:**
- Produces:
  - `beatTimes(bpm: number, fromSec: number, toSec: number, firstBeatSec: number): { time: number; kind: "lub" | "dub" }[]` — pur ; « lub » sur chaque battement, « dub » 0,25 s après.
  - `createHeartbeat(ctx: AudioContext): { start(bpm: number): void; setBpm(bpm: number): void; fadeOut(ms: number): void; stop(): void; setMuted(m: boolean): void }` — ordonnancement par anticipation (`setInterval` 25 ms, 100 ms d'avance) avec `beatTimes` ; chaque impulsion = `OscillatorNode` sinus (lub 55 Hz, dub 48 Hz, dub à 60 % du gain), enveloppe ~120 ms, via un `GainNode` maître.
  - `createMusic(url: string, startSec: number, AudioCtor?: typeof Audio): { play(fadeMs: number): Promise<void>; setMuted(m: boolean): void; stop(): void; readonly failed: boolean }`

- [ ] **Step 1: Tests**
  - `beatTimes(60, 0, 3, 0)` → lub à 0, 1, 2 et dub à 0.25, 1.25, 2.25 (6 événements, triés) ; `beatTimes(80, …)` → intervalle 0,75 s.
  - `createMusic` avec un faux `Audio` (classe dont `play()` résout) : `loop === true`, `currentTime === startSec`, après `play(2000)` + timers simulés le volume atteint 1.
  - `failed devient vrai si play() rejette`, sans exception propagée.
  - `setMuted(true)` met `muted` à true.
  - `createHeartbeat` avec un faux `AudioContext` (vi.fn pour `createOscillator`/`createGain`) : `start(60)` puis 1 s de timers simulés → au moins 2 oscillateurs créés ; `stop()` → plus aucun oscillateur créé ensuite.
- [ ] **Step 2:** `npm test -- audio` → FAIL ; **Step 3:** implémenter ; **Step 4:** PASS.
- [ ] **Step 5: Commit** — `git commit -m "feat: battement de cœur synthétisé et lecture de la chanson"`.

---

### Task 6: Écrans, contrôles et machine à états

**Files:**
- Create: `src/components/WelcomeScreen.tsx`, `src/components/LoadingScreen.tsx`, `src/components/Controls.tsx`, `src/styles.css`
- Modify: `src/App.tsx`, `src/main.tsx`, `index.html`
- Test: `src/components/WelcomeScreen.test.tsx`, `src/components/LoadingScreen.test.tsx`, `src/App.test.tsx`

**Interfaces:**
- Consumes: `config` (Task 1), `createHeartbeat`, `createMusic` (Task 5), `Phase` (Task 4).
- Produces:
  - `WelcomeScreen({ onSubmit }: { onSubmit: (phrase: string) => void })`
  - `LoadingScreen({ onDone, durationMs = 2500 }: { onDone: () => void; durationMs?: number })`
  - `Controls({ muted, onToggleMute, onReplay })` — boutons avec `aria-label="Couper le son"` / `"Remettre le son"` et `"Rejouer"`.
  - `App` : état `screen: "welcome" | "loading" | "heart"`, `phrase`, `muted`, `runId: number` ; transmet à `HeartCanvas` (Task 7) `key={runId}` et `onPhaseChange(phase: Phase)`. En attendant Task 7, `screen === "heart"` affiche un `<div data-testid="heart-placeholder" />`.

- [ ] **Step 1: Tests**
  - `WelcomeScreen` : titre et texte du bouton exacts (Global Constraints) ; champ prérempli `Je t'aime ❤️` ; `bouton désactivé si espaces seuls` ; `maxLength` = 40 ; clic → `onSubmit` appelé avec la phrase.
  - `LoadingScreen` : message exact ; `onDone` appelé une fois à 2500 ms (timers simulés), pas avant ; pas d'appel après démontage.
  - `App` (modules audio mockés avec `vi.mock`) : clic → écran de chargement puis cœur après 2500 ms ; `double submit ne lance qu'un chargement` (deux clics rapides → `createHeartbeat(...).start` appelé une fois) ; Rejouer → retour à l'accueil, `stop()` appelé sur heartbeat et music ; mute → `setMuted(true)` sur les deux.
- [ ] **Step 2:** `npm test -- components App` → FAIL.
- [ ] **Step 3: Implémenter.** Au submit : créer l'`AudioContext` (dans le gestionnaire de clic, pour le déverrouillage iOS), `heartbeat.start(60)`, passer à `loading`. `onPhaseChange` : `"converge"` → `heartbeat.setBpm(80)` ; `"final"` → `music.play(2000)` puis, si `!music.failed`, `heartbeat.fadeOut(2000)`. Rejouer → `stop()` sur les deux, `runId + 1`, `screen = "welcome"`. Si `AudioContext` (ou `webkitAudioContext`) n'existe pas, l'expérience continue sans son, sans erreur.
- [ ] **Step 4: Style** — `styles.css` : fond `radial-gradient` bordeaux (#3a0a1f) → prune (#1a0820), lueurs douces en CSS, texte crème (#fdeef4), accent rose (#ff6b9a) ; titre en `Dancing Script` ; mise en page mobile d'abord ; boutons `Controls` discrets en bas à droite, cible tactile ≥ 44 px. `index.html` : `lang="fr"`, titre de l'onglet `Pour toi ❤️`, viewport, `<link>` Google Fonts (`display=swap`) : Dancing Script, Noto Sans, Noto Sans Arabic, Hebrew, Devanagari, Bengali, Tamil, Thai, Georgian, Armenian, Ethiopic, JP, KR, SC.
- [ ] **Step 5:** `npm test` → PASS.
- [ ] **Step 6: Commit** — `git commit -m "feat: écrans d'accueil et de chargement, contrôles et orchestration audio"`.

---

### Task 7: HeartCanvas — rendu, intégration et vérification visuelle

**Files:**
- Create: `src/components/HeartCanvas.tsx`, `src/animation/fonts.ts`
- Modify: `src/App.tsx` (remplacer le placeholder)
- Test: `src/components/HeartCanvas.test.tsx`

**Interfaces:**
- Consumes: `translations` (Task 2), `layoutWords`, `Layout` (Task 3), `getPhase`, `createParticles`, `updateParticles`, `pulseScale`, `floatOffset` (Task 4), `config` (Task 1).
- Produces: `HeartCanvas({ phrase, songBpm, name, message, reducedMotion, onPhaseChange }: { phrase: string; songBpm: number; name: string; message: string; reducedMotion: boolean; onPhaseChange: (p: Phase) => void })` ; `FONT_STACK: string` et `waitForFonts(): Promise<void>` dans `fonts.ts` (résout sur `document.fonts.ready`, ou immédiatement si indisponible).

- [ ] **Step 1: Tests** (jsdom : `HTMLCanvasElement.prototype.getContext` mocké pour renvoyer un faux contexte 2D, `requestAnimationFrame`/`cancelAnimationFrame` espionnés, `document.fonts` absent)
  - `unmount annule la boucle` : après montage + résolution des polices, démonter → `cancelAnimationFrame` appelé avec le dernier id ; listener `resize` retiré.
  - `onPhaseChange` est appelé avec `"converge"` puis `"final"` une seule fois chacun (horloge rAF simulée sur 5 s).
  - Le message est rendu dans le DOM (overlay `<p>`) avec `opacity` 0 avant 3 s de phase finale, et une classe visible ensuite.
- [ ] **Step 2:** `npm test -- HeartCanvas` → FAIL.
- [ ] **Step 3: Implémenter.** Après `waitForFonts()` : dimensionner le canvas (CSS = viewport, pixels = × `min(devicePixelRatio, 2)`, `ctx.setTransform`), `layoutWords([...translations, { text: phrase, highlight: true }], box, (t, s) => { ctx.font = \`${s}px ${FONT_STACK}\`; return ctx.measureText(t).width; })`, puis `createParticles`. Boucle rAF dans un `ref` : `getPhase` → `updateParticles` → effacer → dessiner. En phase finale, appliquer `pulseScale` autour de `layout.center` via `ctx.translate/scale` et `floatOffset` par particule. Mots `highlight` en blanc pur avec une ombre rose ; les autres en crème, opacité 0,85. `ctx.direction = "rtl"` pour `dir: "rtl"` (puis remettre `"ltr"`). Prénom dessiné en `Dancing Script` au centre de `nameZone`, taille ajustée à sa largeur. Le message est un overlay DOM sous le cœur (texte qui passe à la ligne, plus simple qu'en canvas). Resize (debounce 150 ms) : recalculer la disposition et réassigner les cibles aux particules existantes (même ordre). `reducedMotion` vient de `matchMedia("(prefers-reduced-motion: reduce)")` dans `App` ; dans ce cas, pas de `pulseScale` ni de `floatOffset` : la pulsation devient une variation d'opacité globale (0,85 ↔ 1) au même tempo.
- [ ] **Step 4:** `npm test` → toute la suite PASS.
- [ ] **Step 5: Vérification visuelle** — `npm run dev`, puis avec Playwright MCP, en 390×844 et en 1440×900 : captures de l'accueil, du chargement, de la convergence (~1,5 s) et du cœur final (~8 s). Critères : cœur reconnaissable, aucun carré vide dans les écritures (arabe, CJK, éthiopien, géorgien…), prénom lisible, message visible, `browser_console_messages` sans erreur. Taper ↺ trois fois de suite, puis relancer : une seule boucle (vérifier via `browser_evaluate` que l'animation n'accélère pas et que la console est propre). Corriger, re-capturer.
- [ ] **Step 6: Commit** — `git commit -m "feat: rendu canvas du cœur multilingue"`.

---

### Task 8: Build de production et remise à Samba

**Files:**
- Modify: `README.md` (si besoin)

- [ ] **Step 1:** `npm test && npm run build` → tous les tests verts, build OK sans `config.local.ts`.
- [ ] **Step 2:** `git status` / `git ls-files` → ni `config.local.ts` ni `.mp3` suivis ; `git log --format=%B | grep -c Co-Authored-By` → 0.
- [ ] **Step 3: Rapport à Samba** : liste des entrées `// À VÉRIFIER` ; les infos encore attendues (prénom, message, MP3 et éventuellement `songStartSec`, nom du site Netlify) ; dès réception du MP3, mesurer son BPM et le mettre dans `config.local.ts`.
- [ ] **Step 4: Arrêt** — pas de `git push` ni de déploiement Netlify sans son « oui » explicite. Après accord : `npm run build` avec la vraie config, vérification `npx vite preview` (prénom, chanson), puis dépôt manuel de `dist/` sur Netlify.
