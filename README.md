# Chaman S — Portfolio Website

A modern, responsive portfolio website for **Chaman S** focused on clean presentation, strong accessibility, and smooth interactions.

## Live Site

- **GitHub Pages:** https://chaman2003.github.io/

## Highlights

- Professional, responsive layout (desktop/tablet/mobile)
- Dark/Light theme toggle with preference persistence
- WCAG-conscious contrast and readable typography
- Interactive UI polish (subtle motion, hover depth, progress bar)
- Dynamic GitHub snapshot section (filtered to show:
  - repos with descriptions only
  - repos not duplicated in Featured Builds)
- Sections for About, Featured Builds, Profiles, Timeline, Skills, and Contact

## Tech Stack

- **HTML5**
- **CSS3**
- **Vanilla JavaScript**
- **GSAP + ScrollTrigger** (CDN)
- **GitHub REST API** (for live repository snapshot)

## Project Structure

```text
portfolio-futuristic/
├─ index.html
├─ styles.css
├─ script.js
└─ README.md
```

## Run Locally

### Option 1: Python server

```bash
cd portfolio-futuristic
python -m http.server 8080
```

Open: `http://localhost:8080`

### Option 2: VS Code Live Server

Open the folder and run **Live Server** on `index.html`.

## Customization

Update these places for your own profile:

- `index.html`
  - Name, tagline, project cards, profile links
- `script.js`
  - GitHub username in API calls
  - Featured repo exclusion list
- `styles.css`
  - Theme colors and layout tuning

## Deployment

This site is deployed to GitHub Pages via the user-site repository:

- Repository: `chaman2003/chaman2003.github.io`
- Branch: `main`
- Path: root (`/`)

## Contact

- GitHub: https://github.com/chaman2003
- LinkedIn: https://linkedin.com/in/chaman2003
- LeetCode: https://leetcode.com/chaman_2003/
- Email: chamans7952@gmail.com
