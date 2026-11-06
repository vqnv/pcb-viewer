import * as THREE from 'three';
import { scene, renderer } from './sceneSetup.js';
import { gltfLoader } from './loader.js';
import { boards } from './boards.js';

// Baked boards are in millimetres; this is scene units per mm.
const BOARD_SCALE = 0.16;

export const boardGroups = new Map(); // id -> THREE.Group

const proxyMaterial = new THREE.MeshBasicMaterial({ visible: false });
proxyMaterial.userData.outlineParameters = { visible: false };

/** Invisible box for hover/click, so hit-testing costs 12 triangles instead of the full model. */
export function createHitProxy(object, root) {
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(object);
  box.applyMatrix4(root.matrixWorld.clone().invert());
  const size = box.getSize(new THREE.Vector3());
  const proxy = new THREE.Mesh(new THREE.BoxGeometry(size.x, size.y, size.z), proxyMaterial);
  box.getCenter(proxy.position);
  proxy.layers.set(1);
  return proxy;
}

function prepareMaterials(model) {
  model.traverse((child) => {
    if (!child.isMesh) return;
    child.material.metalness = 0.85;
    child.material.roughness = 0.15;
    // Keeps traces crisp at the shallow angles boards spin through
    if (child.material.map) child.material.map.anisotropy = renderer.capabilities.getMaxAnisotropy();
    const { r, g, b } = child.material.color;
    // Only the substrate gets the green outline, matching the other boards.
    const isSubstrate = !child.material.map && g > r * 2 && g > b * 2;
    child.material.userData.outlineParameters = isSubstrate
      ? { visible: true, color: [0, 0.85, 0], thickness: 0.008 }
      : { visible: false };
  });
}

async function loadBoard(board) {
  const { scene: model } = await gltfLoader.loadAsync(`/boards/${board.id}.glb`);
  model.scale.setScalar(BOARD_SCALE);
  prepareMaterials(model);

  const group = new THREE.Group();
  group.name = `Board_${board.id}`;
  group.position.fromArray(board.position);
  group.add(model);

  // Measured while flat, before the display tilt, so the camera can frame it top-down.
  const size = new THREE.Box3().setFromObject(model).getSize(new THREE.Vector3());
  group.userData.fitSize = Math.max(size.x, size.z);
  group.userData.visualCenter = group.position.clone();

  const proxy = createHitProxy(model, group);
  proxy.name = `BoardProxy_${board.id}`;
  proxy.userData.boardId = board.id;
  group.add(proxy);

  group.rotation.set(0.3, 0.3, 0);
  scene.add(group);
  boardGroups.set(board.id, group);
}

// Phones get a smaller tier: 8192 art needs too much graphics memory for them.
const useLargestArt = renderer.capabilities.maxTextureSize >= 8192 && matchMedia('(pointer: fine)').matches;
const artLoader = new THREE.TextureLoader();
const ARRIVAL_MS = 1100; // wait out the camera flight so the upload can't stutter it

let focusedArt = null; // { id, swaps: [{ material, original, texture }] }

function artMaterials(group) {
  const found = {};
  group.traverse((child) => {
    if (child.isMesh && child.material.name.startsWith('art_')) found[child.material.name] = child.material;
  });
  return found;
}

async function loadArt(url) {
  const texture = await artLoader.loadAsync(url);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.flipY = false; // glTF texture convention
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return texture;
}

/** Back to the light art, freeing the full-size textures. */
export function releaseHiResArt() {
  if (!focusedArt) return;
  focusedArt.swaps.forEach(({ material, original, texture }) => {
    material.map = original;
    texture.dispose();
  });
  focusedArt = null;
}

/** Swap a board to its full-size art, keeping only one board's worth in memory. */
export async function loadHiResArt(id) {
  if (focusedArt?.id === id) return;
  releaseHiResArt();
  const materials = artMaterials(boardGroups.get(id));
  if (!materials.art_top) return; // no Gerbers for this board

  const request = { id, swaps: [] };
  focusedArt = request;
  const jobs = [[materials.art_top, `/boards/${id}-top-${useLargestArt ? 8192 : 4096}.webp`]];
  if (useLargestArt) jobs.push([materials.art_bottom, `/boards/${id}-bottom-4096.webp`]);

  const arrived = new Promise((resolve) => setTimeout(resolve, ARRIVAL_MS));
  const textures = await Promise.all(jobs.map(([, url]) => loadArt(url)));
  await arrived;

  if (focusedArt !== request) {
    textures.forEach((texture) => texture.dispose()); // they left before it finished
    return;
  }
  jobs.forEach(([material], i) => {
    request.swaps.push({ material, original: material.map, texture: textures[i] });
    material.map = textures[i];
  });
}

export async function initBoards() {
  const results = await Promise.allSettled(boards.map(loadBoard));
  results
    .filter((result) => result.status === 'rejected')
    .forEach((result) => console.error('Board failed to load', result.reason));
}
