# Chaman Portfolio

Personal portfolio built with **React + Vite**, using a hybrid model: HTML content shell + React enhancements + modular vanilla JS effects.

## Quick start

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

## Project structure (simplified)

```
src/
├── app/App.jsx              # Entry React component
├── content/portfolio.html   # Page sections (edit content here)
├── components/              # Theme toggler, smooth cursor
├── features/portfolio/      # Nav, motion, lab, GitHub, animations
├── hooks/                   # Theme + portal helpers
├── services/rag.js        # Gemini API for lab terminal
├── config/lab-commands.js   # Lab command definitions
├── data/                    # Profile + RAG text
└── styles/                  # global.css + legacy.css
```

See **[ARCHITECTURE.md](./ARCHITECTURE.md)** for how everything connects.

## Environment

Create `.env` from `.env.example`:

```env
VITE_GEMINI_API_KEY=...
VITE_GEMINI_MODEL=gemini-2.5-flash-lite
VITE_GITHUB_USERNAME=chaman2003
```

## Common tasks

| Task                 | Where to edit                                       |
| -------------------- | --------------------------------------------------- |
| Page copy / sections | `src/content/portfolio.html`                        |
| Colors / layout      | `src/styles/legacy.css`                             |
| Mobile nav / motion  | `src/features/portfolio/navigation.js`, `motion.js` |
| Lab commands         | `src/config/lab-commands.js`                        |
| GitHub cards         | `src/features/portfolio/github.js`                  |
| Theme animation      | `src/components/AnimatedThemeToggler/`              |

## Build & deploy

```bash
npm run build
```

Output: `dist/` — deploy as a static Vite site (e.g. Vercel, Render static site).

- **Build command:** `npm run build`
- **Output directory:** `dist`

## Stack

- React 18, Vite 5
- View Transitions API (theme toggle)
- Optional GSAP (loaded externally if present on page)
- Gemini API + local RAG for lab terminal
