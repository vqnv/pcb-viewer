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

function addStar() {
  const star = new THREE.Mesh(starGeometry, starMaterial);
  const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(100));
  star.position.set(x, y, z);
  star.layers.set(0); // Put stars on layer 0 so raycaster ignores them
  scene.add(star);
}

Array(100).fill().forEach(addStar); // Further reduced count for better performance

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
