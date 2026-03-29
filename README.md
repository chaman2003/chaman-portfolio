# Chaman Portfolio (Native React + Vite)

This is now a **native React implementation** with visual parity to the previous HTML/CSS/JS version.
No legacy public asset references are used.

## Stack
- React 18
- Vite
- CSS imported in React
- Env-based config for Groq + GitHub

## Run
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```

## Env
Use `.env`:
```env
VITE_GROQ_API_KEY=...
VITE_GROQ_MODEL=llama-3.3-70b-versatile
VITE_GITHUB_USERNAME=chaman2003
```

## Deploy
### Vercel
- Root Directory: `portfolio-futuristic`
- Framework: `Vite`
- Build: `npm run build`
- Output: `dist`
