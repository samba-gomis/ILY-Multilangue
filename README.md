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

1. Copier `src/config/config.example.ts` en `src/config/config.local.ts`, puis y mettre le prénom, le message, le BPM de la chanson et la seconde de départ.
2. Déposer la chanson dans `public/music/chanson.mp3`.

Ces deux fichiers sont dans le `.gitignore` : ils ne partent jamais sur GitHub. Sans eux, le site utilise les valeurs d'exemple et un battement de cœur synthétisé.

## Déployer

`npm run build`, puis glisser le dossier `dist/` sur Netlify (dépôt manuel).
