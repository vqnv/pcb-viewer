import * as THREE from 'three';
import { scene } from './sceneSetup.js';

// Key light
const keyLight = new THREE.PointLight(0xffffff);
keyLight.position.set(20, 20, 30);
keyLight.intensity = 500; // Reduced for performance

// Fill light
const fillLight = new THREE.PointLight(0xffffff);
fillLight.position.set(-20, 10, 30);
fillLight.intensity = 500; // Reduced for performance

// Back light
const backLight = new THREE.PointLight(0xffffff);
backLight.position.set(0, -20, -20);
backLight.intensity = 500; // Reduced for performance

// Ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.1); // Increased to compensate

// Add all lights to scene
scene.add(keyLight, fillLight, backLight, ambientLight);

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
