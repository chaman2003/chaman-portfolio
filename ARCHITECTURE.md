# Architecture

This portfolio uses a **hybrid** setup: most of the page is static HTML, while React adds a few interactive layers on top.

## Request flow

```
index.html
  └── main.jsx
        └── app/App.jsx
              ├── content/portfolio.html   (parsed into the DOM)
              ├── components/              (React overlays)
              └── features/portfolio/      (vanilla JS after mount)
```

## Folder map

| Path                           | Purpose                                                        |
| ------------------------------ | -------------------------------------------------------------- |
| `src/app/App.jsx`              | Root React component: renders HTML shell + portals             |
| `src/content/portfolio.html`   | Full page markup (sections, header, lab, GitHub area)          |
| `src/components/`              | React UI: theme toggler, smooth cursor                         |
| `src/features/portfolio/`      | Post-mount effects (nav, motion, lab, GitHub, GSAP, etc.)      |
| `src/hooks/`                   | React hooks (`useTheme`, portal mount targets)                 |
| `src/services/rag.js`          | Gemini + RAG helper for the lab terminal                       |
| `src/config/lab-commands.js`   | Lab command text and RAG seed chunks                           |
| `src/data/`                    | Profile copy and RAG document chunks                           |
| `src/styles/`                  | `global.css` (base + view transitions), `legacy.css` (main UI) |

## How a feature is wired

1. **HTML** — Add markup and IDs in `src/content/portfolio.html`.
2. **Styles** — Add rules in `src/styles/legacy.css`.
3. **Behavior** — Add or extend a module under `src/features/portfolio/`, then register it in `src/features/portfolio/index.js`.
4. **React-only UI** — Add a component under `src/components/` and mount it from `App.jsx` (directly or via a portal target in the HTML).

## Theme toggle

- Controlled in React (`hooks/useTheme.js`).
- DOM `data-theme` on `<body>` is updated inside the view transition in `AnimatedThemeToggler`.
- React state updates **after** the animation finishes (avoids double flash).

## Lab terminal

- Commands and canned responses: `src/config/lab-commands.js`
- AI path: `src/features/portfolio/lab-terminal.js` → `src/services/rag.js`
- RAG context includes resume chunks + live GitHub repo descriptions from `github.js`

## Scripts

```bash
npm run dev      # nodemon → vite
npm run dev:vite # vite only
npm run build
npm run preview
```
