# Mindful Moment — Guided Meditation App

A one-screen mobile meditation app built with React, Vite, and Tailwind CSS v4. Features a working countdown timer with a circular progress ring, procedurally generated ambient sounds via the Web Audio API, and a sound selection screen with scenic photography.

## Preview

The app is designed as a mobile-first experience (390 × 844 px, iPhone 14 proportions) centered on desktop.

### Screens

**Meditation** — animated aurora background, circular SVG progress ring with tick marks, DM Serif Display timer numerals, duration picker (5 / 10 / 15 / 20 min), start / pause / reset controls, and a 4-4-4 breathing guide that appears during a session.

**Sound Selection** — scenic photo cards (Unsplash) for each ambient sound, animated waveform bars, and a "Now Playing" strip.

### Sounds (Web Audio API — no files needed)

| Sound | Technique |
|---|---|
| Ocean Waves | Pink noise → low-pass filter + slow LFO swell |
| Forest Rain | Pink noise → bandpass (200–1800 Hz) |
| Crackling Fire | Brown noise → low-pass + sawtooth crackle LFO |
| Gentle Rain | White noise → high-pass + modulated gain |
| Mountain Wind | White noise → bandpass + very slow amplitude swell |
| Singing Bowls | Four harmonic sine oscillators (220 / 330 / 440 / 660 Hz) with tremolo |
| Pure Silence | Nothing |

## Tech Stack

- **React 19** + TypeScript
- **Vite 8**
- **Tailwind CSS v4** (via `@tailwindcss/vite`)
- **Web Audio API** (built-in browser, no library)
- **Google Fonts** — DM Serif Display + Nunito
- **Unsplash** — sound card photography

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm (or npm / yarn)

### Install & run

```bash
# clone
git clone https://github.com/YOUR_USERNAME/mindful-moment.git
cd mindful-moment

# install
pnpm install        # or: npm install

# dev server
pnpm dev            # or: npm run dev
```

Open `http://localhost:5173` in your browser.

### Build for production

```bash
pnpm build          # or: npm run build
pnpm preview        # or: npm run preview
```

Output is in `dist/`.

## Project Structure

```
mindful-moment/
├── src/
│   ├── App.tsx        # All screens and components
│   ├── index.css      # Tailwind import, Google Fonts, keyframe animations
│   ├── main.tsx       # React entry point
│   └── vite-env.d.ts  # Vite type declarations
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── .gitignore
```

## Customisation

**Durations** — edit the `DURATIONS` array in `App.tsx`.

**Sounds** — add an entry to the `SOUNDS` array. The `generate` function receives an `AudioContext` and returns an `AudioNode` (or `null` for silence).

**Colors** — the aurora background layers are plain `div`s with radial gradients in the `AuroraBackground` component. Adjust `rgba` values and animation durations freely.

**Fonts** — swap the Google Fonts `@import` URLs in `src/index.css`.

## License

MIT
