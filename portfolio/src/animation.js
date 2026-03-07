import { scene, camera, renderer } from './sceneSetup.js';
import { controls } from './controls.js';
import { gltfModel, secondaryPCB, isRotating } from './modelLoader.js';

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
  
  controls.update();
  renderer.render(scene, camera);
}
