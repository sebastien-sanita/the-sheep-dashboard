# The Sheep Dashboard

Dashboard de gestion et d'analyse pour The Sheep — plateforme de marketing digital.

## Stack technique

- **Next.js 16** (App Router, Turbopack)
- **React 19**
- **Tailwind CSS v4**
- **Zustand** (state management)
- **React Query** (data fetching)
- **Recharts** (graphiques)
- **Framer Motion** (animations)

## Lancer en local

```bash
pnpm install
cp .env.example .env.local   # puis éditer les valeurs si nécessaire
pnpm dev
```

L'app sera disponible sur `http://localhost:3000`.

## Variables d'environnement

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | URL du backend API (ex: `https://api.the-sheep.fr`) |

## Déploiement sur Railway

1. Connecter le repo GitHub à Railway
2. Railway détecte automatiquement le `Dockerfile` via `railway.json`
3. Configurer les variables d'environnement dans le dashboard Railway :
   - `NEXT_PUBLIC_API_URL=https://api.the-sheep.fr`
4. Configurer le domaine custom (ex: `app.the-sheep.fr`)
5. Le build et le déploiement sont automatiques à chaque push

### Architecture réseau

Le frontend fait des appels vers `/api/*` (URL relative). Next.js rewrites ces requêtes vers `https://api.the-sheep.fr/api/*` côté serveur, ce qui évite les problèmes CORS.
