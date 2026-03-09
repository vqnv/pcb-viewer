import * as THREE from 'three';
import { gltfModel, secondaryPCB } from './modelLoader.js';

const OUTLINE_COLOR = [0, 0.6, 0];
const OUTLINE_THICKNESS = 0.004;

function setMaterialOutline(material, visible) {
  if (!material) return;
  material.userData = material.userData || {};
  material.userData.outlineParameters = visible
    ? { visible: true, color: OUTLINE_COLOR, thickness: OUTLINE_THICKNESS }
    : { visible: false };
}

function setMeshOutline(mesh, visible) {
  const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
  mats.forEach((m) => setMaterialOutline(m, visible));
}

function isZoneMesh(mesh) {
  const name = (mesh.name || '').toLowerCase();
  if (name.includes('mergedtracks')) return true;
  if (mesh.material && mesh.material.color) {
    const hex = mesh.material.color.getHex();
    const r = (hex >> 16) & 0xff;
    const g = (hex >> 8) & 0xff;
    const b = hex & 0xff;
    // Gold/yellow zones/tracks
    if (r > 200 && g > 150 && b < 100) return true;
  }
  return false;
}

function isPCBMesh(mesh) {
  const name = (mesh.name || '').toLowerCase();
  if (name.includes('pcb')) return true;
  if (mesh.material && mesh.material.color) {
    const hex = mesh.material.color.getHex();
    const r = (hex >> 16) & 0xff;
    const g = (hex >> 8) & 0xff;
    const b = hex & 0xff;
    return g > r && g > b && g > 20;
  }
  return false;
}

export function setPCBComponentOutlinesFor(targetPCB, visible) {
  if (!targetPCB) return;

  // Normalize to the object that contains the actual meshes
  const root = targetPCB;

  root.traverse((obj) => {
    if (!obj.isMesh) return;
    if (isZoneMesh(obj)) {
      setMeshOutline(obj, false);
      return;
    }
    if (isPCBMesh(obj)) {
      // PCB substrate stays outlined all the time
      setMeshOutline(obj, true);
      return;
    }
    // Everything else on the PCB is treated as "component"
    setMeshOutline(obj, visible);
  });
}

export function setAllPCBComponentOutlinesVisible(visible) {
  setPCBComponentOutlinesFor(gltfModel, visible);
  setPCBComponentOutlinesFor(secondaryPCB, visible);
}

