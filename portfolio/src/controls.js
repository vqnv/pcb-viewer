import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { camera, renderer } from './sceneSetup.js';
import { setAllPCBComponentOutlinesVisible } from './outlineManager.js';

export const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.enableDamping = false; // Disabled for better performance
controls.autoRotate = false;
controls.autoRotateSpeed = 0.15;

// Track if user is manually interacting (not animation)
let manualInteraction = false;
// Only resume rotation after a real drag (not a tap) — avoids phone tap restarting rotation
let pointerDownX = 0;
let pointerDownY = 0;
const DRAG_THRESHOLD_PX = 6;
let didDrag = false;

export function resetManualInteraction() {
  manualInteraction = false;
}

const el = renderer.domElement;
el.addEventListener('pointerdown', (e) => {
  pointerDownX = e.clientX;
  pointerDownY = e.clientY;
  didDrag = false;
});
el.addEventListener('pointermove', (e) => {
  if (e.buttons === 0) return;
  const dx = e.clientX - pointerDownX;
  const dy = e.clientY - pointerDownY;
  if (dx * dx + dy * dy >= DRAG_THRESHOLD_PX * DRAG_THRESHOLD_PX) {
    didDrag = true;
  }
});

controls.addEventListener('start', () => {
  if (controls.enabled) {
    manualInteraction = true;
  }
});

// Only resume rotation when they actually dragged, not on tap (fixes phone behaviour)
controls.addEventListener('end', () => {
  if (manualInteraction && didDrag) {
    manualInteraction = false;
    import('./modelLoader.js').then(({ setIsRotating }) => {
      setIsRotating(true);
      controls.autoRotate = true;
      // Exit PCB interaction mode when rotation resumes
      setAllPCBComponentOutlinesVisible(false);
    });
  } else if (manualInteraction) {
    manualInteraction = false;
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
      if (next) setAllPCBComponentOutlinesVisible(false);
      console.log('Rotations:', next ? 'ON' : 'OFF');
    });
  }
});
