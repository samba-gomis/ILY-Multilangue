# ILY Multilangue ❤️

Une page où des dizaines de « Je t'aime », dans environ 80 langues, se rassemblent pour former un cœur qui bat. Il y a un prénom au centre, un message et une chanson.

Stack : Vite, React, TypeScript, Canvas 2D, Web Audio API, Vitest. Le site est entièrement statique : pas de backend ni d'API.

## Lancer

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # tests unitaires
npm run build    # génère dist/
```

## Personnaliser

**En ligne (Netlify)** : dans *Site configuration → Environment variables*, définir :

| Variable | Exemple |
|---|---|
| `VITE_LOVE_NAME` | `Diarra Gomis` |
| `VITE_LOVE_MESSAGE` | `Première ligne
Deuxième ligne` (`
` = retour à la ligne) |
| `VITE_SONG_BPM` | `130.5` |
| `VITE_SONG_START_SEC` | `64` |

Puis relancer un déploiement. La chanson est attendue dans `public/music/chanson.mp3` (sans elle, seul le battement synthétisé joue).

**En local** : copier `src/config/config.example.ts` en `src/config/config.local.ts` (ignoré par git) ; ce fichier est prioritaire sur les variables.

## Déployer

Voir `netlify.toml` (build `npm run build`, publication de `dist/`).
