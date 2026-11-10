# Cœur multilingue « Je t'aime » — Design

Date : 2026-11-10
Source : `guide_coeur_multilingue.docx` (guide pratique), adapté par les décisions ci-dessous.

## 1. Intention

Un cadeau : une page web que Samba envoie à sa copine par lien. Elle l'ouvre (probablement sur téléphone), clique, et voit des dizaines de « Je t'aime » dans toutes les langues converger pour former un cœur qui bat, avec son prénom au centre, un message personnel et sa chanson préférée.

**Critères de réussite**
- Fonctionne et est beau sur mobile (prioritaire) et ordinateur.
- Toutes les écritures s'affichent correctement (aucun carré « tofu »).
- Le cœur est reconnaissable, l'animation reste fluide (~60 fps sur un téléphone récent).
- Rejouer plusieurs fois ne crée jamais plusieurs boucles d'animation ni plusieurs pistes audio.
- Ouverture instantanée : aucun backend, aucune attente réseau autre que les fichiers statiques.
- Rien de personnel (prénom, message, MP3) dans le repo GitHub public.

**Hors périmètre (YAGNI)** : API de traduction, backend Node/Express, export MP4/FFmpeg, détection de beats par analyse audio, traduction de phrases libres.

## 2. Décisions prises

| Sujet | Décision | Raison |
|---|---|---|
| Traductions | Liste statique vérifiée à la main (~80 entrées) | Pas de serveur, pas de clé, formulations romantiques correctes |
| Stack | Vite + React + TypeScript, Vitest | Conforme au guide, valeur portfolio |
| Rendu | Canvas 2D | Suffisant pour du texte animé |
| Personnalisation | Prénom au centre + message en fondu | Valeurs fournies plus tard ; placeholders d'ici là |
| Musique | « Peace of Me » — Dip Doundou Guiss, MP3 fourni par Samba | Sa chanson préférée ; BPM mesuré à réception du fichier |
| Second son | Battement de cœur « lub-dub » synthétisé (Web Audio) | Aucun fichier, aucun droit, synchro parfaite avec l'animation |
| Repo | Public ; config perso + MP3 dans `.gitignore` | Vitrine portfolio sans exposer la vie privée ni redistribuer la chanson |
| Déploiement | Netlify, dépôt manuel de `dist/` | Le build local inclut la config perso ; jamais déployé sans accord |

## 3. Parcours utilisateur

| Phase | Ce qu'elle voit / entend | Durée |
|---|---|---|
| Accueil | Fond nuit (dégradé bordeaux → prune, quelques lueurs). Titre « Dis-moi que tu m'aimes 🥺 ! », champ prérempli « Je t'aime ❤️ », bouton « Dis-le dans toutes les langues → » (désactivé si le champ est vide après trim). Le clic crée/débloque l'`AudioContext`. | Jusqu'au clic |
| Chargement | « Je cherche toutes les façons de te le dire… 💕 ». Le battement synthétisé démarre, lent (~60 bpm). Mise en scène : rien n'est réellement chargé. | 2,5 s |
| Apparition | ~80 « Je t'aime » apparaissent en fondu à des positions aléatoires. La phrase tapée par elle fait partie des mots, mise en valeur (blanc plus lumineux, un peu plus grande). | 0,8 s |
| Convergence | Les mots glissent vers leur cible dans le cœur (lerp). Le battement accélère légèrement ; la chanson démarre en fondu entrant à la fin de la phase. Le battement s'éteint en fondu quand la chanson est audible. | 3 s |
| Cœur final | Prénom au centre. Le cœur pulse au tempo de la chanson (ou un battement sur deux si BPM > 100) et flotte doucement. Le message apparaît en fondu 3 s après le début de la phase. Boutons discrets 🔇 (mute global) et ↺ (retour à l'accueil). | Boucle |

**Comportements de repli**
- MP3 introuvable ou lecture refusée : l'animation continue ; le battement synthétisé reste actif à la place de la chanson. Aucun message d'erreur affiché.
- Web Audio indisponible : expérience silencieuse, rien ne casse.
- `prefers-reduced-motion: reduce` : pas de phase de convergence ; les mots apparaissent en fondu directement à leur place ; pulsation réduite à une variation d'opacité.
- Rotation / redimensionnement : la disposition est recalculée ; les mots reprennent leur trajet vers les nouvelles cibles.

## 4. Architecture

Principe : React ne gère que les écrans ; toute la logique graphique est en TypeScript pur, testable sans DOM.

```
src/
  config.example.ts      versionné — valeurs d'exemple (prénom, message, BPM, chemin MP3)
  config.local.ts        ignoré par git — vraies valeurs ; chargé s'il existe
  config.ts              exporte la config (local si présent, sinon example)
  data/translations.ts   liste { lang, label, text, dir? }
  App.tsx                machine à états : "welcome" | "loading" | "heart"
  components/
    WelcomeScreen.tsx    titre, champ, bouton → onSubmit(phrase)
    LoadingScreen.tsx    message + timer 2,5 s → onDone()
    HeartCanvas.tsx      <canvas>, boucle rAF, resize, nettoyage au démontage
    Controls.tsx         🔇 et ↺
  animation/
    heartShape.ts        contour paramétrique + points intérieurs
    layout.ts            attribution des cibles selon la largeur mesurée
    particles.ts         création et mise à jour des particules
    timeline.ts          temps écoulé → { phase, progress }
  audio/
    heartbeat.ts         lub-dub synthétisé, tempo réglable, start/stop/fade
    music.ts             HTMLAudioElement, fade-in, mute, échec silencieux
public/music/chanson.mp3 ignoré par git — fourni par Samba
```

### Unités et interfaces

- **`config`** : `{ name: string; message: string; songUrl: string; songBpm: number }`. Le chargement de `config.local.ts` se fait via `import.meta.glob("./config.local.ts", { eager: true })` : si le fichier n'existe pas, on retombe sur `config.example.ts` sans erreur de build.
- **`translations`** : `type Translation = { lang: string; label: string; text: string; dir?: "rtl" }`. Une langue peut avoir plusieurs entrées (ex. wolof). Les entrées douteuses sont signalées par un commentaire `// À VÉRIFIER` dans le fichier, jamais inventées en silence.
- **`heartShape.ts`**
  - `heartOutline(steps: number): Point[]` — x = 16 sin³t, y = 13 cos t − 5 cos 2t − 2 cos 3t − cos 4t, y inversé pour l'écran.
  - `isInsideHeart(p: Point, outline: Point[]): boolean` — test point-dans-polygone (ray casting).
  - `fitToBox(points, width, height, margin)` — mise à l'échelle et centrage.
- **`layout.ts`** — `layoutWords(words, box, measure): Placement[]`
  - `measure(text: string, size: number) => number` est injecté (en prod : `ctx.measureText` ; en test : fonction factice).
  - Algorithme : lignes horizontales balayant le cœur de haut en bas ; pour chaque ligne, l'intervalle intérieur au cœur est calculé ; les mots y sont placés de gauche à droite avec un espacement minimal ; une zone centrale est réservée au prénom. Taille de police de base proportionnelle à la taille du cœur ; un mot trop large pour l'intervalle est réduit (jusqu'à 70 %) ou passé à la ligne suivante. Les mots sont mélangés (seed fixe) pour éviter de regrouper les écritures. S'il reste des places, les mots sont réutilisés ; s'il manque des places, la taille de base diminue et on recommence.
  - Retour : `{ text, x, y, size, dir, highlight }` par mot.
- **`particles.ts`** — `TextParticle = { text, x, y, targetX, targetY, size, opacity, dir, highlight, phaseOffset }`. `createParticles(placements, viewport, rng)` positionne aléatoirement ; `updateParticles(particles, phaseState, t)` applique : fondu (apparition), lerp `0.035` vers la cible normalisé par dt (convergence), oscillation sinusoïdale + échelle de pulsation autour du centre du cœur (final).
- **`timeline.ts`** — `getPhase(elapsedMs, durations): { phase: "appear" | "converge" | "final"; progress: number }`. Pur, sans état.
- **`HeartCanvas.tsx`** — props `{ phrase, translations, config, onPhaseChange, reducedMotion }`. Attend `document.fonts.ready`, puis calcule la disposition, lance la boucle dans un `ref`, `cancelAnimationFrame` + retrait du listener resize au démontage. Le canvas est dimensionné à `devicePixelRatio` plafonné à 2. Pour les mots `dir: "rtl"`, `ctx.direction = "rtl"`.
- **`heartbeat.ts`** — `createHeartbeat(ctx: AudioContext)` → `{ start(bpm), setBpm(bpm), fadeOut(ms), stop() }`. Chaque battement = deux impulsions courtes (oscillateur sinus ~50–60 Hz, enveloppe gain rapide), la seconde plus faible, ~0,25 s d'écart.
- **`music.ts`** — `createMusic(url)` → `{ play(fadeMs), setMuted(bool), stop() }` ; les erreurs de chargement/lecture sont capturées et signalées via un booléen `failed`.
- **`App.tsx`** — détient l'écran courant, la phrase, l'`AudioContext`, l'état mute. Réagit à `onPhaseChange` : `converge` → `heartbeat.setBpm(80)` ; fin de convergence → `music.play(2000)` puis `heartbeat.fadeOut(2000)` (sauf si `music.failed`). ↺ arrête l'audio, remet l'écran à `welcome` ; `HeartCanvas` est démonté puis remonté avec une nouvelle `key`.

## 5. Typographie

- Google Fonts, `display=swap` : Noto Sans + Noto Sans Arabic, Hebrew, Devanagari, Bengali, Tamil, Thai, Georgian, Armenian, Ethiopic, JP, KR, SC. Pile `font-family` dans le canvas avec ces familles puis `sans-serif`.
- Titre et prénom : une police d'affichage manuscrite élégante (choisie à l'implémentation), avec repli.
- La disposition n'est calculée qu'après `document.fonts.ready` ; sinon les mesures sont fausses.

## 6. Traductions

- ~80 entrées, forme romantique privilégiée : « Te amo » (es, pt), « Ti amo » (it), « Ich liebe dich », « I love you », « 我爱你 », « 愛してる », « 사랑해 », « أحبك », « אני אוהב אותך », « Я тебя люблю », « Σ'αγαπώ », « मैं तुमसे प्यार करता हूँ », etc.
- Couverture d'écritures : latine, arabe, hébreu, cyrillique, grec, devanagari, bengali, tamoul, thaï, géorgien, arménien, éthiopien, CJK.
- Langues africaines et proches du couple : **wolof — « Damala beug » (graphie demandée par Samba) et « Dama la nob »**, peul, sérère, bambara, lingala, swahili, créoles. Les entrées non certaines sont marquées `// À VÉRIFIER` et listées à Samba.
- Pas d'emoji drapeau.

## 7. Tests

**Vitest (logique pure)**
- `heartShape` : contour symétrique (x ↔ −x) ; points générés tous intérieurs ; `fitToBox` respecte les marges.
- `layout` : chaque mot placé est entièrement dans le cœur ; aucun chevauchement de boîtes (mesure factice) ; zone du prénom libre ; résultat cohérent pour 375×667 et 1440×900.
- `timeline` : phase correcte à 0, 0,5, 1, 4 et 10 s ; `progress` dans [0, 1].
- `translations` : aucun texte vide ; pas de doublon de `text` ; `dir: "rtl"` présent pour ar, he, fa, ur.
- `particles` : après assez d'itérations de convergence, les particules sont à < 1 px de leur cible.

**Vérification visuelle** : `npm run dev` + Playwright, captures en viewport iPhone (390×844) et desktop (1440×900) à chaque phase ; contrôle manuel du rendu des écritures et de la lisibilité. Contrôle qu'un double ↺ ne laisse qu'une boucle rAF.

## 8. Déploiement et vie privée

- `.gitignore` : `src/config.local.ts`, `public/music/*.mp3`, `node_modules`, `dist`.
- Le repo public ne contient que le code, `config.example.ts` et un README expliquant comment personnaliser.
- Build local (`npm run build`) avec la vraie config + MP3, puis dépôt manuel de `dist/` sur Netlify. Nom du site choisi par Samba. Aucun déploiement ni push sans son accord explicite.
- Ne pas faire de `git push` des commits sans accord.

## 9. Informations attendues de Samba

- Prénom/surnom à afficher et message personnel.
- Fichier MP3 de « Peace of Me » (et éventuellement le point de départ souhaité, ex. refrain).
- Nom souhaité pour le site Netlify.
