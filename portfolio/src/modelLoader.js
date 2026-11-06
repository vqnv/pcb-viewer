import * as THREE from 'three';
import { scene } from './sceneSetup.js';
import { gltfLoader } from './loader.js';

export let gltfModel = null;
export let secondaryPCB = null;
export let componentGroups = {};
export let isRotating = true;

const PCB_GREEN = 0x1a5c1a;
const KICAD_BOARD_SCALE = 200; // KiCad exports are in metres

// Reuse materials instead of creating one per mesh
const materialCache = new Map();

function shinyMaterial(color) {
  let material = materialCache.get(color);
  if (!material) {
    material = new THREE.MeshStandardMaterial({ color, metalness: 0.85, roughness: 0.15 });
    material.userData.outlineParameters = color === PCB_GREEN
      ? { visible: true, color: [0, 0.85, 0], thickness: 0.008 }
      : { visible: false };
    materialCache.set(color, material);
  }
  return material;
}

function register(mesh, baseName) {
  mesh.layers.set(1);
  mesh.userData.originalMaterial = mesh.material;
  (componentGroups[baseName] ||= []).push(mesh);
}

export function setIsRotating(value) {
  isRotating = value;
}

/** Baked boards carry their component name in node extras (see tools/bake-legacy.mjs). */
function prepareBoard(model, tracksKey) {
  let index = 0;
  model.traverse((child) => {
    if (!child.isMesh) return;
    const component = child.userData.component ?? child.parent?.userData.component ?? 'Unknown';
    const baseName = component === 'MergedTracks' ? tracksKey : component;
    child.name = `${baseName}_${index++}`;

    const hex = child.material.color.getHex();
    const r = (hex >> 16) & 0xff;
    const g = (hex >> 8) & 0xff;
    const b = hex & 0xff;
    const isGreen = g > r && g > b && g > 100;
    child.material = shinyMaterial(isGreen ? PCB_GREEN : hex);
    register(child, baseName);
  });
  model.scale.setScalar(KICAD_BOARD_SCALE);
}

export async function loadModel(modelPath) {
  const { scene: model } = await gltfLoader.loadAsync(modelPath);
  prepareBoard(model, 'MergedTracks');

  // Move the model so its centre sits on the origin
  const center = new THREE.Box3().setFromObject(model).getCenter(new THREE.Vector3());
  model.position.copy(center.negate());
  model.userData.visualCenter = new THREE.Vector3(0, 0, 0);
  model.rotation.set(0.3, 0.3, 0);

  gltfModel = model;
  scene.add(model);
  return model;
}

/** Load a second PCB inside a group so it rotates around its own centre. */
export async function loadSecondaryPCB(modelPath, offsetX = 300) {
  const { scene: model } = await gltfLoader.loadAsync(modelPath);
  prepareBoard(model, 'MergedSecondaryTracks');

  const center = new THREE.Box3().setFromObject(model).getCenter(new THREE.Vector3());
  model.position.copy(center.negate());

  const pcbGroup = new THREE.Group();
  pcbGroup.add(model);
  pcbGroup.position.set(offsetX, 0, 0);
  pcbGroup.userData.visualCenter = new THREE.Vector3(offsetX, 0, 0);
  pcbGroup.rotation.set(0.3, 0.3, 0);

  secondaryPCB = pcbGroup;
  scene.add(pcbGroup);
  return model;
}

async function attachPart(target, path, position, scale, rotation, color, componentName) {
  const { scene: part } = await gltfLoader.loadAsync(path);
  part.scale.set(scale.x, scale.y, scale.z);
  part.position.set(position.x, position.y, position.z);
  part.rotation.set(rotation.x, rotation.y, rotation.z);
  const baseName = componentName.replace(/_\d+$/, '');
  part.traverse((child) => {
    if (!child.isMesh) return;
    child.name = componentName;
    child.material = shinyMaterial(color);
    register(child, baseName);
  });
  target.add(part);
}

/** Add a part (USB-C, encoder, etc.) to the main PCB so it rotates with it. */
export function loadAdditionalComponent(path, position, scale, rotation, color = 0xcccccc, name = 'Component') {
  return attachPart(gltfModel, path, position, scale, rotation, color, name);
}

/** Add a part (Arduino Nano, relay) to the second PCB. */
export function loadComponentOntoSecondaryPCB(path, position, scale, rotation, color = 0xcccccc, name = 'Component') {
  return attachPart(secondaryPCB.children[0], path, position, scale, rotation, color, name);
}
