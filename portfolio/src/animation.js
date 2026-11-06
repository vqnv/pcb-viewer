import { scene, camera, renderer, outlineEffect } from './sceneSetup.js';
import { DEFAULT_NEAR } from './cameraAnimation.js';
import { controls } from './controls.js';
import { gltfModel, secondaryPCB, isRotating } from './modelLoader.js';
import { aboutCubeGroup } from './aboutCube.js';
import { gearGroup } from './gear.js';
import { porscheGroup } from './porsche.js';
import { musicalNoteGroup } from './musicalNote.js';
import { boardGroups } from './boardScene.js';

function spin(object, x, y, z, step) {
  if (!object) return;
  object.rotation.x += x * step;
  object.rotation.y += y * step;
  object.rotation.z += z * step;
}

// Only trade sharpness for speed on devices that really can't keep up, and never
// go below one render pixel per screen pixel.
const SAMPLE_FRAMES = 90;
const SLOW_FRAME_SECONDS = 1 / 20;
const MIN_PIXEL_RATIO = 1;
let sampleTime = 0;
let sampleCount = 0;

function adaptQuality(delta) {
  if (delta > 0.25) return; // a stall (model upload, tab switch), not steady-state speed
  sampleTime += delta;
  sampleCount += 1;
  if (sampleCount < SAMPLE_FRAMES) return;
  const average = sampleTime / sampleCount;
  sampleTime = 0;
  sampleCount = 0;
  const ratio = renderer.getPixelRatio();
  if (average > SLOW_FRAME_SECONDS && ratio > MIN_PIXEL_RATIO) {
    renderer.setPixelRatio(Math.max(MIN_PIXEL_RATIO, ratio - 0.25));
  }
}

let lastTime = 0;

export function animate(time = 0) {
  requestAnimationFrame(animate);
  const delta = (time - lastTime) / 1000;
  lastTime = time;
  adaptQuality(delta);

  if (isRotating) {
    // Speeds are per 60fps frame, so motion looks the same on any refresh rate
    const step = Math.min(delta, 0.1) * 60;
    spin(gltfModel, 0.002, 0.0018, 0.0015, step);
    spin(secondaryPCB, 0.0022, 0.002, 0.0018, step);
    spin(aboutCubeGroup, 0.002, 0.0022, 0.0018, step);
    spin(gearGroup, 0.002, 0.0022, 0.0018, step);
    spin(porscheGroup, 0.002, 0.0022, 0.0018, step);
    spin(musicalNoteGroup, 0.0006, 0.0007, 0.0005, step);
    boardGroups.forEach((group) => spin(group, 0.0018, 0.002, 0.0016, step));
  }

  controls.update();

  // The near plane is raised after flying to a board; keep it clear of the board when zooming in.
  if (camera.near > DEFAULT_NEAR) {
    const allowed = Math.max(DEFAULT_NEAR, camera.position.distanceTo(controls.target) * 0.5);
    if (allowed < camera.near) {
      camera.near = allowed;
      camera.updateProjectionMatrix();
    }
  }

  outlineEffect.render(scene, camera);
}
