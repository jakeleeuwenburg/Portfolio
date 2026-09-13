# Portfolio Website

A static portfolio site with an interactive side-scroller landing page and a polished portfolio page. No build step, no dependencies. Deploys free on GitHub Pages, Netlify, or Vercel.

```
index.html          Landing page: runs the active intro + persistent "Skip intro" button
portfolio.html      The portfolio (projects, skills, experience, resume, contact)
css/                base.css (tokens/shared), landing.css, portfolio.css
js/content.js       <-- EDIT THIS. All text, projects, skills, contact, resume path.
js/intro-config.js  <-- One string chooses which intro runs.
js/intro-loader.js  Loads the chosen intro and handles skip/fallback.
js/intros/          One file per intro style (sidescroller.js today).
js/shared.js        Project modal + placeholder thumbnails (used by both pages).
js/portfolio.js     Renders portfolio.html from content.js.
assets/resume.pdf   <-- Replace with your real resume (keep the filename, or change resumeUrl).
assets/img/         Put project images here and reference them in content.js.
```

## Editing content

Everything lives in `js/content.js`. Search for `PLACEHOLDER` and `REPLACE_ME`.

- **Add a project:** copy one object in the `projects` array. `id` must be unique (it becomes the `#project-<id>` link). `icon` picks the in-game glyph (`stapler`, `pump`, `bone`, `rig`, `bracket`, `gear`, `cad`, `chip`). Set `image` to e.g. `"assets/img/my-project.jpg"` (16:9 works best) or leave `""` for the auto placeholder.
- **Order matters:** projects appear left-to-right in the game and top-to-bottom in the portfolio in array order. Put your strongest first.
- **Resume:** drop your PDF at `assets/resume.pdf`. Both the download buttons and the embedded viewer read `resumeUrl`.
- **Contact:** fill `contact.email` and `contact.linkedin`. Leave `github`/`phone` as `""` to hide them.
- **Contact form (optional):** there's a commented-out Formspree form in `portfolio.html`.

## Changing the interactive landing page

Open `js/intro-config.js` and change `window.INTRO`. To write a new intro style, create `js/intros/<name>.js` that sets:

```js
window.Intro = {
  start(container, content, onFinish) { /* render into container; call onFinish() when done */ },
  stop() { /* clean up listeners / animation */ },
};
```

`content` is the `CONTENT` object; `onFinish` navigates to the portfolio. The skip button and Esc key are handled outside the module, so they always work. If the module fails to load, the loader shows a plain fallback with a link to the portfolio.

## Run locally

Double-clicking `index.html` works. For a proper server:

```
cd PortfolioWebsite
python -m http.server 8080
```

Then open http://localhost:8080.

## Deploy (free)

- **GitHub Pages:** create a repo, push this folder's contents to the root of the `main` branch, then Settings → Pages → Source: `main` / root. Site appears at `https://<user>.github.io/<repo>/`.
- **Netlify:** go to app.netlify.com → "Add new site" → drag and drop this folder. Done.
- **Vercel:** `npx vercel` inside this folder, or import the GitHub repo.

## Tips for recruiters' phones

The game shows on-screen buttons on touch devices, and a tap anywhere on the game jumps. The "Skip intro → Portfolio" button is always visible top-right. The PDF viewer is hidden on phones (mobile browsers handle embedded PDFs poorly) and replaced with an "Open in new tab" prompt.
