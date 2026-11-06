// Print size / draw-call / triangle counts for every GLB in public/.
import fs from 'node:fs';
import path from 'node:path';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';

const pub = path.resolve(import.meta.dirname, '../public');
await MeshoptDecoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder });
const files = fs.readdirSync(pub, { recursive: true }).filter((f) => f.endsWith('.glb'));
for (const f of files) {
  const full = path.join(pub, f);
  const root = (await io.read(full)).getRoot();
  let prims = 0;
  let tris = 0;
  for (const m of root.listMeshes()) {
    for (const p of m.listPrimitives()) {
      prims++;
      tris += (p.getIndices()?.getCount() ?? p.getAttribute('POSITION').getCount()) / 3;
    }
  }
  const tex = root.listTextures().reduce((a, t) => a + (t.getImage()?.byteLength || 0), 0);
  console.log(
    f.padEnd(34),
    `${(fs.statSync(full).size / 1048576).toFixed(2)}MB`.padStart(8),
    `nodes ${root.listNodes().length}`.padEnd(12),
    `prims ${prims}`.padEnd(12),
    `tris ${Math.round(tris)}`.padEnd(14),
    `tex ${root.listTextures().length} (${(tex / 1048576).toFixed(1)}MB)`,
  );
}
