// Renders a Gerber folder into realistic top/bottom board images (copper, pours,
// soldermask, silkscreen, holes). Headless, no GUI.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import sharp from 'sharp';

const require = createRequire(import.meta.url);
const pcbStackup = require('pcb-stackup');

// Altium X2 names, Altium/Protel extensions and KiCad names.
const RULES = [
  [/copper_signal_top|\.gtl$|f[._]cu/i, 'top', 'copper'],
  [/copper_signal_bot|\.gbl$|b[._]cu/i, 'bottom', 'copper'],
  [/soldermask_top|\.gts$|f[._]mask/i, 'top', 'soldermask'],
  [/soldermask_bot|\.gbs$|b[._]mask/i, 'bottom', 'soldermask'],
  [/legend_top|\.gto$|f[._]silk/i, 'top', 'silkscreen'],
  [/legend_bot|\.gbo$|b[._]silk/i, 'bottom', 'silkscreen'],
  [/profile|\.gko$|\.gm1$|edge[._]cuts/i, 'all', 'outline'],
  [/_n?pth_drill\.gbr$/i, 'all', 'drill'],
  [/\.(txt|drl|xln)$/i, 'all', 'drill'],
];

function classify(filename) {
  const rule = RULES.find(([pattern]) => pattern.test(filename));
  return rule ? { side: rule[1], type: rule[2] } : null;
}

const COLORS = {
  fr4: '#3d3a22',
  cu: '#c9a24a',
  cf: '#e0b84f',
  sm: 'rgba(8, 92, 34, 0.80)',
  ss: '#f4f4ee',
  sp: 'rgba(0, 0, 0, 0)',
  out: '#000000',
};

// Lossless: board art is flat colour, and lossy WebP smears gold-on-green edges.
async function rasterize(side, sizes) {
  const longest = Math.max(...sizes);
  const longestMm = Math.max(side.width, side.height) * (side.units === 'in' ? 25.4 : 1);
  const density = (longest / longestMm) * 25.4;
  const master = await sharp(Buffer.from(side.svg), { density, limitInputPixels: false, unlimited: true })
    .resize(longest, longest, { fit: 'inside' })
    .png({ compressionLevel: 1 })
    .toBuffer();
  const out = {};
  for (const size of sizes) {
    out[size] = await sharp(master, { limitInputPixels: false })
      .resize(size, size, { fit: 'inside', kernel: 'lanczos3' })
      .webp({ lossless: true, effort: 4 })
      .toBuffer();
  }
  return out;
}

export async function renderBoardTextures(dir) {
  // Altium output folders can hold both an X2 and a classic set, plus text reports.
  const files = fs.readdirSync(dir).filter((f) => !/status report/i.test(f));
  const hasX2 = files.some((f) => /copper_signal_top/i.test(f));
  // Drill Gerbers share the copper's coordinates. NC drill files can be offset from them.
  const hasDrillGerber = files.some((f) => /_pth_drill\.gbr$/i.test(f));
  const layers = files
    .filter((f) => !(hasX2 && /\.(gtl|gbl|gts|gbs|gto|gbo|gko|gm1)$/i.test(f)))
    .filter((f) => !(hasDrillGerber && /\.(txt|drl|xln)$/i.test(f)))
    .map((filename) => ({ filename, match: classify(filename) }))
    .filter(({ match }) => match)
    .map(({ filename, match }) => ({
      filename,
      gerber: fs.createReadStream(path.join(dir, filename)),
      ...match,
    }));
  const found = layers.map((l) => `${l.side}/${l.type}`);
  if (!found.includes('top/copper') || !found.includes('all/outline')) {
    throw new Error(`need at least top copper and an outline, found: ${found.join(', ')}`);
  }
  const stackup = await pcbStackup(layers, { color: COLORS, useOutline: true });
  const units = stackup.top.units === 'in' ? 25.4 : 1;
  return {
    top: await rasterize(stackup.top, [2048, 4096, 8192]),
    bottom: await rasterize(stackup.bottom, [2048, 4096]),
    widthMm: stackup.top.width * units,
    heightMm: stackup.top.height * units,
    layers: found,
  };
}
