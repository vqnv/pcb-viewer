// Bake a board STEP export into a small, fast GLB for the site. Headless, no GUI.
//   node tools/step-to-glb.mjs <input.step> <output-name> [gerber-folder]
//     -> public/boards/<output-name>.glb
// With a Gerber folder, the real copper, pours, soldermask and silkscreen are rendered
// onto both faces of the board, since STEP exports usually only carry the bare substrate.
// Parts are merged by colour (a board becomes ~10 draw calls instead of hundreds),
// centred on the origin, turned Y-up, kept in millimetres, then meshopt-compressed.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { Document, NodeIO } from '@gltf-transform/core';
import { EXTMeshoptCompression, EXTTextureWebP, KHRMeshQuantization } from '@gltf-transform/extensions';
import { meshopt } from '@gltf-transform/functions';
import { MeshoptEncoder, MeshoptDecoder } from 'meshoptimizer';
import { renderBoardTextures } from './gerber-texture.mjs';

const [input, name, gerberDir] = process.argv.slice(2);
if (!input || !name) {
  console.error('usage: step-to-glb <input.step> <name> [gerber-folder]');
  process.exit(1);
}

const require = createRequire(import.meta.url);
const occt = await require('occt-import-js')();
const step = occt.ReadStepFile(new Uint8Array(fs.readFileSync(input)), {
  linearUnit: 'millimeter',
  linearDeflectionType: 'bounding_box_ratio',
  linearDeflection: 0.0006,
  angularDeflection: 0.3,
});
if (!step.success) throw new Error(`could not read ${input}`);

const DEFAULT_COLOR = [0.55, 0.55, 0.55];
const keyOf = (c) => c.map((v) => Math.round(v * 12) / 12).join(',');
const groups = new Map(); // colour key -> { color, pos, nrm, idx }
const groupFor = (color) => {
  const key = keyOf(color);
  if (!groups.has(key)) groups.set(key, { color, pos: [], nrm: [], idx: [] });
  return groups.get(key);
};

const min = [Infinity, Infinity, Infinity];
const max = [-Infinity, -Infinity, -Infinity];

// The substrate is the largest solid by footprint. Components can overhang it,
// so its bounds (not the whole model's) are what the Gerbers line up with.
function boundsOf(array) {
  const lo = [Infinity, Infinity, Infinity];
  const hi = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < array.length; i += 3) {
    for (let k = 0; k < 3; k++) {
      lo[k] = Math.min(lo[k], array[i + k]);
      hi[k] = Math.max(hi[k], array[i + k]);
    }
  }
  return { lo, hi, area: (hi[0] - lo[0]) * (hi[1] - lo[1]) };
}
const substrate = step.meshes
  .map((m) => boundsOf(m.attributes.position.array))
  .sort((a, b) => b.area - a.area)[0];

for (const m of step.meshes) {
  const p = m.attributes.position.array;
  const n = m.attributes.normal?.array;
  const index = m.index.array;
  for (let i = 0; i < p.length; i += 3) {
    for (let k = 0; k < 3; k++) {
      min[k] = Math.min(min[k], p[i + k]);
      max[k] = Math.max(max[k], p[i + k]);
    }
  }
  // Faces can carry their own colour; fall back to the solid colour, then grey.
  const spans = m.brep_faces?.length
    ? m.brep_faces
    : [{ first: 0, last: index.length / 3 - 1, color: null }];
  for (const face of spans) {
    const g = groupFor(face.color ?? m.color ?? DEFAULT_COLOR);
    const local = new Map();
    for (let t = face.first; t <= face.last; t++) {
      for (let c = 0; c < 3; c++) {
        const v = index[t * 3 + c];
        let out = local.get(v);
        if (out === undefined) {
          out = g.pos.length / 3;
          local.set(v, out);
          g.pos.push(p[v * 3], p[v * 3 + 1], p[v * 3 + 2]);
          g.nrm.push(n ? n[v * 3] : 0, n ? n[v * 3 + 1] : 0, n ? n[v * 3 + 2] : 1);
        }
        g.idx.push(out);
      }
    }
  }
}

const centre = min.map((v, i) => (v + max[i]) / 2);
const doc = new Document();
const buffer = doc.createBuffer();
const root = doc.createNode(name);
doc.createScene(name).addChild(root);
let tris = 0;

[...groups.values()].forEach((g, i) => {
  // STEP is Z-up, the scene is Y-up: (x, y, z) -> (x, z, -y), about the board centre.
  const pos = new Float32Array(g.pos.length);
  const nrm = new Float32Array(g.nrm.length);
  for (let v = 0; v < g.pos.length; v += 3) {
    const x = g.pos[v] - centre[0];
    const y = g.pos[v + 1] - centre[1];
    const z = g.pos[v + 2] - centre[2];
    pos.set([x, z, -y], v);
    nrm.set([g.nrm[v], g.nrm[v + 2], -g.nrm[v + 1]], v);
  }
  tris += g.idx.length / 3;
  const material = doc.createMaterial(`${name}_${i}`)
    .setBaseColorFactor([...g.color, 1])
    .setMetallicFactor(0.3)
    .setRoughnessFactor(0.5);
  const prim = doc.createPrimitive()
    .setAttribute('POSITION', doc.createAccessor().setType('VEC3').setArray(pos).setBuffer(buffer))
    .setAttribute('NORMAL', doc.createAccessor().setType('VEC3').setArray(nrm).setBuffer(buffer))
    .setIndices(doc.createAccessor().setType('SCALAR').setArray(new Uint32Array(g.idx)).setBuffer(buffer))
    .setMaterial(material);
  root.addChild(doc.createNode(`${name}_${i}`).setMesh(doc.createMesh(`${name}_${i}`).addPrimitive(prim)));
});

if (gerberDir) {
  const art = await renderBoardTextures(gerberDir);
  const { lo, hi } = substrate;
  console.log(`gerbers: ${art.layers.join(', ')}`);
  console.log(`outline ${art.widthMm.toFixed(2)} x ${art.heightMm.toFixed(2)} mm, substrate ${(hi[0] - lo[0]).toFixed(2)} x ${(hi[1] - lo[1]).toFixed(2)} mm`);
  doc.createExtension(EXTTextureWebP).setRequired(true);
  const LIFT = 0.05; // mm above the substrate, enough to avoid z-fighting

  const addFace = (faceName, image, z, flip) => {
    const texture = doc.createTexture(faceName).setImage(image).setMimeType('image/webp');
    const material = doc.createMaterial(faceName)
      .setBaseColorTexture(texture)
      .setAlphaMode('MASK')
      .setAlphaCutoff(0.5)
      .setMetallicFactor(0.15)
      .setRoughnessFactor(0.55);
    const corners = [[lo[0], lo[1]], [hi[0], lo[1]], [hi[0], hi[1]], [lo[0], hi[1]]];
    const pos = new Float32Array(12);
    const nrm = new Float32Array(12);
    const uv = new Float32Array(8);
    corners.forEach(([x, y], i) => {
      pos.set([x - centre[0], z - centre[2], -(y - centre[1])], i * 3);
      nrm.set([0, flip ? -1 : 1, 0], i * 3);
      // Image top is +Y. The bottom image is drawn as seen from below, so X is mirrored.
      const u = (x - lo[0]) / (hi[0] - lo[0]);
      uv.set([flip ? 1 - u : u, (hi[1] - y) / (hi[1] - lo[1])], i * 2);
    });
    const prim = doc.createPrimitive()
      .setAttribute('POSITION', doc.createAccessor().setType('VEC3').setArray(pos).setBuffer(buffer))
      .setAttribute('NORMAL', doc.createAccessor().setType('VEC3').setArray(nrm).setBuffer(buffer))
      .setAttribute('TEXCOORD_0', doc.createAccessor().setType('VEC2').setArray(uv).setBuffer(buffer))
      .setIndices(doc.createAccessor().setType('SCALAR').setArray(new Uint16Array(flip ? [0, 2, 1, 0, 3, 2] : [0, 1, 2, 0, 2, 3])).setBuffer(buffer))
      .setMaterial(material);
    root.addChild(doc.createNode(faceName).setMesh(doc.createMesh(faceName).addPrimitive(prim)));
  };
  addFace('art_top', art.top[2048], hi[2] + LIFT, false);
  addFace('art_bottom', art.bottom[2048], lo[2] - LIFT, true);

  // Full-size art is only fetched when someone clicks into the board (see boardScene.js).
  const artDir = path.resolve(import.meta.dirname, '../public/boards');
  fs.mkdirSync(artDir, { recursive: true });
  const artFiles = { 'top-8192': art.top[8192], 'top-4096': art.top[4096], 'bottom-4096': art.bottom[4096] };
  for (const [suffix, data] of Object.entries(artFiles)) {
    fs.writeFileSync(path.join(artDir, `${name}-${suffix}.webp`), data);
    console.log(`  ${suffix}: ${(data.length / 1024).toFixed(0)} KB`);
  }
}

await MeshoptEncoder.ready;
await doc.transform(meshopt({ encoder: MeshoptEncoder, level: 'medium', quantizePosition: 16, quantizeNormal: 12, quantizeTexcoord: 14 }));

const outDir = path.resolve(import.meta.dirname, '../public/boards');
fs.mkdirSync(outDir, { recursive: true });
const out = path.join(outDir, `${name}.glb`);
const io = new NodeIO()
  .registerExtensions([EXTMeshoptCompression, EXTTextureWebP, KHRMeshQuantization])
  .registerDependencies({ 'meshopt.encoder': MeshoptEncoder, 'meshopt.decoder': MeshoptDecoder });
await io.write(out, doc);

const size = max.map((v, i) => +(v - min[i]).toFixed(1));
console.log(`${name}: ${step.meshes.length} solids -> ${groups.size} draw calls, ${tris} tris, ${size.join(' x ')} mm, ${(fs.statSync(out).size / 1024).toFixed(0)} KB`);
