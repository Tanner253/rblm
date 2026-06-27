# RBLM — Meme Depot & Maker

Rabbit behind the lion mask. Browse community memes or make your own.

## Develop

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy (Vercel CLI)

```bash
npm install -g vercel
vercel
```

Or connect the GitHub repo at [vercel.com](https://vercel.com).

## Add memes to the depot

1. Drop an image into `public/memes/`
2. Append an entry to `src/data/memes.ts`

## Pages

- `/` — Home
- `/memes` — Meme catalog with copy & download
- `/create` — Template maker with draggable text layers
