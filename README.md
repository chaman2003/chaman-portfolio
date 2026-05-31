# Chaman Portfolio (Native React + Vite)

This is now a **native React implementation** with visual parity to the previous HTML/CSS/JS version.
No legacy public asset references are used.

## Stack
- React 18
- Vite
- CSS imported in React
- Env-based config for Gemini + GitHub

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
VITE_GEMINI_API_KEY=...
VITE_GEMINI_MODEL=gemini-2.5-flash-lite
VITE_GITHUB_USERNAME=chaman2003
```

## Deploy
### Vercel
- Root Directory: `portfolio-futuristic`
- Framework: `Vite`
- Build: `npm run build`
- Output: `dist`
