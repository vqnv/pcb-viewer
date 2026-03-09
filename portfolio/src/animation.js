import { scene, camera, outlineEffect } from './sceneSetup.js';
import { controls } from './controls.js';
import { gltfModel, secondaryPCB, isRotating } from './modelLoader.js';
import { aboutCubeGroup } from './aboutCube.js';
import { gearGroup } from './gear.js';
import { porscheGroup } from './porsche.js';
import { musicalNoteGroup } from './musicalNote.js';

// FPS limiting for better performance
const targetFPS = 60;
const frameDelay = 1000 / targetFPS;
let lastFrameTime = 0;

export function animate(currentTime = 0) {
  requestAnimationFrame(animate);
  
  // Limit to target FPS
  const elapsed = currentTime - lastFrameTime;
  if (elapsed < frameDelay) return;
  lastFrameTime = currentTime - (elapsed % frameDelay);
  
  // Rotate the main PCB if it's loaded and rotation is enabled
  if (gltfModel && isRotating) {
    gltfModel.rotation.x += 0.002;
    gltfModel.rotation.y += 0.0018;
    gltfModel.rotation.z += 0.0015;
  }
  
  // Rotate the secondary PCB with different speeds for variety
  if (secondaryPCB && isRotating) {
    secondaryPCB.rotation.x += 0.0022;
    secondaryPCB.rotation.y += 0.002;
    secondaryPCB.rotation.z += 0.0018;
  }

  // Rotate the about cube so it has the same cool spin
  if (aboutCubeGroup && isRotating) {
    aboutCubeGroup.rotation.x += 0.002;
    aboutCubeGroup.rotation.y += 0.0022;
    aboutCubeGroup.rotation.z += 0.0018;
  }

  // Rotate the gear
  if (gearGroup && isRotating) {
    gearGroup.rotation.x += 0.002;
    gearGroup.rotation.y += 0.0022;
    gearGroup.rotation.z += 0.0018;
  }

  // Rotate the Porsche
  if (porscheGroup && isRotating) {
    porscheGroup.rotation.x += 0.002;
    porscheGroup.rotation.y += 0.0022;
    porscheGroup.rotation.z += 0.0018;
  }

  // Rotate the musical note
  if (musicalNoteGroup && isRotating) {
    musicalNoteGroup.rotation.x += 0.0006;
    musicalNoteGroup.rotation.y += 0.0007;
    musicalNoteGroup.rotation.z += 0.0005;
  }
  
  controls.update();
  outlineEffect.render(scene, camera);
}
