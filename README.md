# PCB Viewer / Portfolio

The app lives in the **`portfolio`** folder. Open that folder in your file explorer or expand it in Cursor to see all the code and assets.

## Quick start

```bash
cd portfolio
npm install
npm run dev
```

Then open the URL Vite prints (usually http://localhost:5173).

## Project layout

```
pcb-viewer/
├── portfolio/          ← main app (open this)
│   ├── src/            ← JS, CSS, logic
│   ├── public/         ← 3D models (.glb), images
│   ├── index.html
│   └── package.json
├── package.json        ← root (just three.js)
└── README.md
```

**Don’t** open `index.html` directly in the browser (file://). Use `npm run dev` from inside `portfolio` so the app and assets load correctly.
