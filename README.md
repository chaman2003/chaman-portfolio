# Chaman Portfolio (React + Vite)

Simple React portfolio codebase with component folders (`jsx + css` together).

## Stack
- React 18
- Vite
- Vercel-ready config

## Project structure

```txt
src/
  components/
    Header/
    Hero/
    Sections/
    Skills/
    LabConsole/
  data/
  utils/
  styles/
```

## Environment variables

Create `.env` (already prepared locally) with:

```env
VITE_GROQ_API_KEY=...
VITE_GROQ_MODEL=llama-3.3-70b-versatile
VITE_GITHUB_USERNAME=chaman2003
```

## Run

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Deploy (Vercel)

```bash
vercel --prod
```

`vercel.json` is included.
