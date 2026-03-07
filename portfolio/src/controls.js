import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { camera, renderer } from './sceneSetup.js';

export const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.enableDamping = false; // Disabled for better performance
controls.autoRotate = false;
controls.autoRotateSpeed = 0.15;

// Track if user is manually interacting (not animation)
let manualInteraction = false;

// Function to reset manual interaction flag (called when animation starts)
export function resetManualInteraction() {
  manualInteraction = false;
}

// When user starts to manually drag/move camera
controls.addEventListener('start', () => {
  // Only set flag if controls are enabled (i.e., not during programmatic animation)
  if (controls.enabled) {
    manualInteraction = true;
  }
});

// When user finishes manual interaction, resume rotation
controls.addEventListener('end', () => {
  if (manualInteraction) {
    manualInteraction = false;
    import('./modelLoader.js').then(({ setIsRotating }) => {
      setIsRotating(true);
      controls.autoRotate = true;
    });
  }
});

// Scroll handler for camera movement
export function moveCamera() {
  const t = document.body.getBoundingClientRect().top;
  camera.position.z = t * -0.01;
  camera.position.x = t * -0.0002;
  camera.position.y = t * -0.0002;
}

document.body.onscroll = moveCamera;

// Toggle all rotations (camera + scene objects) with spacebar
window.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    e.preventDefault();
    import('./modelLoader.js').then(({ isRotating, setIsRotating }) => {
      const next = !isRotating;
      setIsRotating(next);
      controls.autoRotate = next;
      console.log('Rotations:', next ? 'ON' : 'OFF');
    });
  }
});
