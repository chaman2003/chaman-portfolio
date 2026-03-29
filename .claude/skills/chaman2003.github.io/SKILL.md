```markdown
# chaman2003.github.io Development Patterns

> Auto-generated skill from repository analysis

## Overview

This skill documents the development patterns, coding conventions, and common workflows used in the `chaman2003.github.io` repository. The project is a JavaScript-based website with no detected framework, focusing on direct manipulation of HTML, CSS, and JS files. The repository emphasizes clear structure, maintainable code, and collaborative feature development.

## Coding Conventions

- **File Naming:**  
  Use camelCase for file names.  
  _Example:_  
  ```
  script.js
  styles.css
  index.html
  ```

- **Import Style:**  
  Use relative imports when importing modules or assets.  
  _Example:_  
  ```js
  import { myFunction } from './utils.js';
  ```

- **Export Style:**  
  Use named exports for JavaScript modules.  
  _Example:_  
  ```js
  // utils.js
  export function myFunction() { ... }
  ```

- **Commit Messages:**  
  Freeform style, typically around 65 characters.  
  _Example:_  
  ```
  Add smooth scroll to top button and update styles for header
  ```

## Workflows

### Feature Implementation with Style and Logic
**Trigger:** When adding a significant new feature or overhauling an existing section.  
**Command:** `/new-feature`

1. **Edit or add elements in `index.html`**  
   Add new HTML structure or content as needed for the feature.
   ```html
   <!-- Example: Adding a new section -->
   <section id="gallery"></section>
   ```
2. **Update `script.js`**  
   Implement or modify interactive logic related to the new feature.
   ```js
   // Example: Add event listeners for the new section
   document.getElementById('gallery').addEventListener('click', handleGalleryClick);
   ```
3. **Update `styles.css`**  
   Style the new or changed elements and their interactions.
   ```css
   /* Example: Style for the new gallery section */
   #gallery {
     display: flex;
     gap: 1rem;
   }
   ```

---

### UI Layout or Style Polish
**Trigger:** When refining the visual appearance, layout, or consistency of the site.  
**Command:** `/ui-polish`

1. **Edit `index.html`**  
   Adjust structure or class names to improve layout.
   ```html
   <!-- Example: Add a class for spacing -->
   <div class="content-section spaced"></div>
   ```
2. **Update `styles.css`**  
   Refine spacing, colors, or responsive behavior.
   ```css
   .spaced {
     margin-bottom: 2rem;
   }
   ```
3. **Optionally, tweak `script.js`**  
   Make minor logic adjustments if needed for layout changes.

---

### Logic and Style Tweak
**Trigger:** When fixing bugs or enhancing the behavior and appearance of existing features (without changing HTML structure).  
**Command:** `/logic-style-tweak`

1. **Update `script.js`**  
   Fix or enhance interactive logic.
   ```js
   // Example: Fix debounce timing on scroll event
   window.addEventListener('scroll', debounce(handleScroll, 100));
   ```
2. **Update `styles.css`**  
   Adjust styles to match the new or fixed behaviors.
   ```css
   /* Example: Highlight active section */
   .active-section {
     background-color: #f0f0f0;
   }
   ```

---

## Testing Patterns

- **Framework:** Unknown (no specific testing framework detected).
- **File Pattern:** Test files are named with the pattern `*.test.*`.
- **Example:**  
  ```
  script.test.js
  ```
- **Note:** Testing conventions are not fully established; consider using a standard JavaScript testing framework (e.g., Jest) for future tests.

## Commands

| Command              | Purpose                                                        |
|----------------------|----------------------------------------------------------------|
| /new-feature         | Start a new feature or major enhancement (HTML, JS, CSS)       |
| /ui-polish           | Refine UI layout, spacing, or visual consistency               |
| /logic-style-tweak   | Fix or enhance logic and corresponding styles                  |
```
