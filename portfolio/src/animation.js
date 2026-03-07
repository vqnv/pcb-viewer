import { scene, camera, renderer } from './sceneSetup.js';
import { controls } from './controls.js';
import { gltfModel, secondaryPCB, isRotating } from './modelLoader.js';

export function animate() {
  requestAnimationFrame(animate);
  
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
