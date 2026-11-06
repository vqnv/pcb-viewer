// One-off optimiser for the older GLBs in public/. Headless, no GUI.
//   node tools/bake-legacy.mjs <source-dir>
// Reads originals from <source-dir> and writes optimised copies into public/.
//
//  board : keeps one node per component (so components stay clickable), merges each
//          component's primitives per material, and merges copper/pads/vias into a
//          single "tracks" node. Component names go in node extras for the site.
//  solid : a part the site recolours anyway, so it collapses to a single mesh.
//  car   : flatten + join by material, simplify, resize textures.
import fs from 'node:fs';
import path from 'node:path';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import {
  dedup, flatten, join, joinPrimitives, meshopt, prune, simplify, textureCompress,
  transformPrimitive, weld,
} from '@gltf-transform/functions';
import { MeshoptDecoder, MeshoptEncoder, MeshoptSimplifier } from 'meshoptimizer';
import sharp from 'sharp';

const src = path.resolve(process.argv[2]);
const pub = path.resolve(import.meta.dirname, '../public');

await Promise.all([MeshoptDecoder.ready, MeshoptEncoder.ready, MeshoptSimplifier.ready]);
const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ 'meshopt.decoder': MeshoptDecoder, 'meshopt.encoder': MeshoptEncoder });

// Must match THREE.PropertyBinding.sanitizeNodeName: the site's component keys use this form.
const sanitize = (name) => name.replace(/\s/g, '_').replace(/[[\].:/]/g, '');

const isTrack = (name) => /_(copper|pad|via)$/i.test(name);

function mergeByMaterial(doc, mesh) {
  const byMaterial = new Map();
  for (const prim of mesh.listPrimitives()) {
    const mat = prim.getMaterial();
    if (!byMaterial.has(mat)) byMaterial.set(mat, []);
    byMaterial.get(mat).push(prim);
  }
  for (const prims of byMaterial.values()) {
    if (prims.length < 2) continue;
    const merged = joinPrimitives(prims);
    prims.forEach((p) => mesh.removePrimitive(p));
    mesh.addPrimitive(merged);
  }
}

async function bakeBoard(file) {
  const doc = await io.read(path.join(src, file));
  await doc.transform(dedup());
  const root = doc.getRoot();
  const tracks = [];
  for (const node of root.listNodes()) {
    const mesh = node.getMesh();
    if (!mesh) continue;
    if (isTrack(mesh.getName())) {
      tracks.push(node);
      continue;
    }
    mergeByMaterial(doc, mesh);
    node.setExtras({ component: sanitize(mesh.getName()) });
  }

  // Copper, pads and vias render as one gold mesh (same as the site did at runtime, but free).
  const material = tracks[0].getMesh().listPrimitives()[0].getMaterial();
  const prims = [];
  for (const node of tracks) {
    for (const prim of node.getMesh().listPrimitives()) {
      const copy = prim.clone();
      transformPrimitive(copy, node.getWorldMatrix());
      copy.setMaterial(material);
      prims.push(copy);
    }
  }
  const merged = joinPrimitives(prims);
  const mergedMesh = doc.createMesh('tracks').addPrimitive(merged);
  const parent = tracks[0].getParentNode();
  const mergedNode = doc.createNode('tracks').setMesh(mergedMesh).setExtras({ component: 'MergedTracks' });
  if (parent) parent.addChild(mergedNode);
  else root.listScenes()[0].addChild(mergedNode);
  tracks.forEach((node) => node.dispose());

  await doc.transform(prune(), meshopt({ encoder: MeshoptEncoder, level: 'medium', quantizePosition: 16, quantizeNormal: 12 }));
  await io.write(path.join(pub, file), doc);
}

// Parts in these files have mismatched attributes, so merge raw triangles by hand.
function mergeRaw(root) {
  const pos = [];
  const nrm = [];
  const idx = [];
  const a = [0, 0, 0];
  const b = [0, 0, 0];
  for (const node of root.listNodes()) {
    const mesh = node.getMesh();
    if (!mesh) continue;
    const m = node.getWorldMatrix();
    const det = m[0] * (m[5] * m[10] - m[6] * m[9]) - m[4] * (m[1] * m[10] - m[2] * m[9]) + m[8] * (m[1] * m[6] - m[2] * m[5]);
    for (const prim of mesh.listPrimitives()) {
      if (prim.getMode() !== 4) continue;
      const P = prim.getAttribute('POSITION');
      const N = prim.getAttribute('NORMAL');
      const I = prim.getIndices();
      const base = pos.length / 3;
      for (let i = 0; i < P.getCount(); i++) {
        P.getElement(i, a);
        pos.push(
          m[0] * a[0] + m[4] * a[1] + m[8] * a[2] + m[12],
          m[1] * a[0] + m[5] * a[1] + m[9] * a[2] + m[13],
          m[2] * a[0] + m[6] * a[1] + m[10] * a[2] + m[14],
        );
        if (N) N.getElement(i, b);
        else b.fill(0);
        const x = m[0] * b[0] + m[4] * b[1] + m[8] * b[2];
        const y = m[1] * b[0] + m[5] * b[1] + m[9] * b[2];
        const z = m[2] * b[0] + m[6] * b[1] + m[10] * b[2];
        const len = Math.hypot(x, y, z) || 1;
        nrm.push(x / len, y / len, z / len);
      }
      const count = I ? I.getCount() : P.getCount();
      for (let t = 0; t < count; t += 3) {
        const i0 = base + (I ? I.getScalar(t) : t);
        const i1 = base + (I ? I.getScalar(t + 1) : t + 1);
        const i2 = base + (I ? I.getScalar(t + 2) : t + 2);
        if (det < 0) idx.push(i0, i2, i1);
        else idx.push(i0, i1, i2);
      }
    }
  }
  // Parts exported without normals get a face normal so they still shade.
  for (let t = 0; t < idx.length; t += 3) {
    const [i0, i1, i2] = [idx[t], idx[t + 1], idx[t + 2]];
    if (nrm[i0 * 3] || nrm[i0 * 3 + 1] || nrm[i0 * 3 + 2]) continue;
    const u = [0, 1, 2].map((k) => pos[i1 * 3 + k] - pos[i0 * 3 + k]);
    const v = [0, 1, 2].map((k) => pos[i2 * 3 + k] - pos[i0 * 3 + k]);
    const c = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
    const len = Math.hypot(...c) || 1;
    for (const i of [i0, i1, i2]) nrm.splice(i * 3, 3, c[0] / len, c[1] / len, c[2] / len);
  }
  return { pos, nrm, idx };
}

async function bakeSolid(file, ratio) {
  const doc = await io.read(path.join(src, file));
  const root = doc.getRoot();
  const { pos, nrm, idx } = mergeRaw(root);
  const scene = root.listScenes()[0];
  scene.listChildren().forEach((child) => scene.removeChild(child));
  root.listNodes().forEach((node) => node.dispose());
  root.listMeshes().forEach((mesh) => mesh.dispose());
  const buffer = root.listBuffers()[0] ?? doc.createBuffer();
  const prim = doc.createPrimitive()
    .setAttribute('POSITION', doc.createAccessor().setType('VEC3').setArray(new Float32Array(pos)).setBuffer(buffer))
    .setAttribute('NORMAL', doc.createAccessor().setType('VEC3').setArray(new Float32Array(nrm)).setBuffer(buffer))
    .setIndices(doc.createAccessor().setType('SCALAR').setArray(new Uint32Array(idx)).setBuffer(buffer))
    .setMaterial(doc.createMaterial('solid'));
  scene.addChild(doc.createNode('solid').setMesh(doc.createMesh('solid').addPrimitive(prim)));
  await doc.transform(
    prune(),
    weld(),
    simplify({ simplifier: MeshoptSimplifier, ratio, error: 0.002 }),
    meshopt({ encoder: MeshoptEncoder, level: 'medium', quantizePosition: 16, quantizeNormal: 12 }),
  );
  await io.write(path.join(pub, file), doc);
}

async function bakeCar(file) {
  const doc = await io.read(path.join(src, file));
  await doc.transform(
    dedup(),
    flatten(),
    join(),
    weld(),
    simplify({ simplifier: MeshoptSimplifier, ratio: 0.4, error: 0.001 }),
    prune(),
    textureCompress({ encoder: sharp, targetFormat: 'webp', resize: [1024, 1024] }),
    meshopt({ encoder: MeshoptEncoder, level: 'medium', quantizePosition: 16, quantizeNormal: 12 }),
  );
  await io.write(path.join(pub, file), doc);
}

const jobs = [
  ['usbmouseconnectorgeneric.glb', bakeBoard],
  ['project.glb', bakeBoard],
  ['nano.glb', (f) => bakeSolid(f, 0.7)],
  ['USB-C.glb', (f) => bakeSolid(f, 0.9)],
  ['relay.glb', (f) => bakeSolid(f, 0.9)],
  ['encoder.glb', (f) => bakeSolid(f, 0.9)],
  ['Microswitch.glb', (f) => bakeSolid(f, 1)],
  ['pmw3389.glb', (f) => bakeSolid(f, 1)],
  ['porsche_gt3_rs.glb', bakeCar],
];

for (const [file, bake] of jobs) {
  const before = fs.statSync(path.join(src, file)).size;
  await bake(file);
  const after = fs.statSync(path.join(pub, file)).size;
  console.log(`${file.padEnd(32)} ${(before / 1048576).toFixed(2)}MB -> ${(after / 1048576).toFixed(2)}MB`);
}
