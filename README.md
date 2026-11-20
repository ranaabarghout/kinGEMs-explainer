# kinGEMs — explainer site

An interactive explainer for *kinGEMs: A robust and scalable framework for resource-constraint models through stochastic tuning of deep learning-predicted kinetic parameters* (PLOS Comput Biol 22(11): e1014881, 2026). The site is plain static HTML, CSS and JS with no build step.

## Deploy on GitHub Pages
1. Push the contents of this folder to a repo (e.g. `kingems-explainer`), or to a `docs/` folder in an existing repo.
2. In the repo, go to **Settings → Pages → Build and deployment → Deploy from a branch**, then pick `main` and `/ (root)` (or `/docs`).
3. The site appears at `https://<user>.github.io/<repo>/`.

## Preview locally
```bash
python3 -m http.server 8000
```

## Structure
- `index.html`: page content (hero, five-scale atlas, annealing demo, findings, figures, citation)
- `assets/style.css`: theme. Colors are taken from the paper's figures. Fonts are Roboto and Roboto Mono.
- `assets/main.js`: atlas navigation, simulated-annealing toy, charts, lightbox
- `assets/figs/`: paper figures (CC BY 4.0)