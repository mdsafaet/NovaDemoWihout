# NOVA – React (Vite) 

```bash
npm install
npm run dev
```

## Structure
```
src/
  assets/images/        images (+ index.js barrel)
  components/
    common/             Button, TextLink, Flag, Tabs, Dialog, DetailDialog, ProjectCard, NewsCard,
                        SectionHeading, Header, Footer, SmoothScroll, WebGLScene
    home/               Hero, MarketStrip, Intro, Portfolio, Presence, Investors,
                        Responsibility, Journal, Contact
  data/                 markets / projects / news / navigation / responsibility content
  layouts/MainLayouts.jsx
  lib/                  utils, ticker, lenis, gl-state
  pages/Home.jsx
  routes/AppRoutes.jsx
  styles/index.css      same design CSS as the original
```

## Hero video
1. Put your file at `public/videos/hero.mp4`
2. In `src/components/home/Hero.jsx` set `const HERO_VIDEO = "/videos/hero.mp4";`
   (or `<Hero videoSrc="/videos/hero.mp4" />` in `pages/Home.jsx`)

## Flags
`country-flag-icons` – see `components/common/Flag.jsx` and the `flag` field in `data/markets.js`.
