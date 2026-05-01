# concept1 → concept · AI Pipeline UI

Design 3 — **Stepper + Detail Panel** — Production React codebase.

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Build for Production

```bash
npm run build
npm run preview
```

---

## Project Structure

```
src/
├── main.jsx                    # Entry point
├── App.jsx                     # Root component
├── index.css                   # Global styles + CSS variables
├── pipelineConfig.js           # ← EDIT THIS to customise stages & data
│
├── hooks/
│   └── usePipeline.js          # All execution state & timer logic
│
└── components/
    ├── PipelineDashboard.jsx   # Layout shell — assembles all pieces
    ├── PipelineDashboard.module.css
    ├── Header.jsx              # Top bar: title, status chip, speed, buttons
    ├── Header.module.css
    ├── ProgressBar.jsx         # Thin bar below header
    ├── ProgressBar.module.css
    ├── Stepper.jsx             # Left sidebar — vertical stage stepper
    ├── Stepper.module.css
    ├── DetailPanel.jsx         # Right panel — output per selected stage
    ├── DetailPanel.module.css
    ├── LogFeed.jsx             # Live agent log stream
    └── LogFeed.module.css
```

---

## Customising the Pipeline

All stage data lives in **`src/pipelineConfig.js`**. Edit it to:

- Change stage names, icons, descriptions
- Set `durationMs` per stage (milliseconds at 1× speed)
- Add/remove log lines per stage
- Edit result table rows and values
- Add `codeSnippet` to any stage to show a syntax-highlighted code block

### Adding a New Stage

```js
{
  id: 'my-new-stage',
  index: 4,
  icon: '🚀',
  iconBg: '#eff6ff',
  name: 'My Stage',
  shortDesc: 'One-liner description',
  fullDesc: 'Longer description shown in the detail panel.',
  durationMs: 1500,
  logLines: [
    { type: 'info', text: 'Starting...' },
    { type: 'ok',   text: 'Done!' },
  ],
  result: {
    label: 'Output',
    rows: [
      { key: 'Records processed', value: '1,000', color: 'green' },
    ],
  },
},
```

Log line types: `info` · `ok` · `warn` · `err`  
Result row colors: `green` · `blue` · `amber` · `''` (default)

---

## Tech Stack

- **React 18** with hooks
- **CSS Modules** — no CSS-in-JS library needed
- **Vite** — instant HMR dev server
- **DM Sans + DM Mono** via Google Fonts

No external UI library dependencies.
