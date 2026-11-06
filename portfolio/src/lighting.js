import * as THREE from 'three';
import { scene } from './sceneSetup.js';

// Sun light – strong directional for shiny highlights (like sunlight)
const sunLight = new THREE.DirectionalLight(0xfff8eb, 2.2);
sunLight.position.set(40, 60, 50);
scene.add(sunLight);

const sunLight2 = new THREE.DirectionalLight(0xfff0d0, 0.8);
sunLight2.position.set(-25, 35, 45);
scene.add(sunLight2);

// Fill – soft so shadows aren’t black
const fillLight = new THREE.DirectionalLight(0xe8f4ff, 0.55);
fillLight.position.set(-20, 20, 30);
scene.add(fillLight);

// Rim / back – gives edge shine
const rimLight = new THREE.DirectionalLight(0xffffff, 0.6);
rimLight.position.set(0, -10, -40);
scene.add(rimLight);

// Ambient – base visibility
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

// Stars - optimized for performance
const starGeometry = new THREE.SphereGeometry(0.25, 6, 4); // Further reduced segments
const starMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff }); // Basic material doesn't need lighting calculations
// Never outline stars
starMaterial.userData.outlineParameters = { visible: false };

// One instanced mesh = one draw call for every star. Layer 0, so the raycaster ignores them.
const STAR_COUNT = 100;
const stars = new THREE.InstancedMesh(starGeometry, starMaterial, STAR_COUNT);
const starMatrix = new THREE.Matrix4();
for (let i = 0; i < STAR_COUNT; i++) {
  const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(100));
  stars.setMatrixAt(i, starMatrix.makeTranslation(x, y, z));
}
scene.add(stars);

// Theme toggle: dark ↔ bright (background + star colour)
let isDark = true; // start dark (black bg, white stars)
const themeBtn = document.getElementById('theme-toggle-btn');
if (themeBtn) {
  themeBtn.addEventListener('click', () => {
    isDark = !isDark;
    if (isDark) {
      scene.background = new THREE.Color(0x000000);
      starMaterial.color.setHex(0xffffff);
      themeBtn.textContent = 'Change to day';
    } else {
      scene.background = new THREE.Color(0xffffff);
      starMaterial.color.setHex(0x000000);
      themeBtn.textContent = 'Change to night';
    }
  });
}
