import * as THREE from 'three';
import { scene } from './sceneSetup.js';

// Key light
const keyLight = new THREE.PointLight(0xffffff);
keyLight.position.set(20, 20, 30);
keyLight.intensity = 80;

// Fill light
const fillLight = new THREE.PointLight(0xffffff);
fillLight.position.set(-20, 10, 30);
fillLight.intensity = 40;

// Back light
const backLight = new THREE.PointLight(0xffffff);
backLight.position.set(0, -20, -20);
backLight.intensity = 30;

// Ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.05);

// Add all lights to scene
scene.add(keyLight, fillLight, backLight, ambientLight);

// Stars
function addStar() {
  const geometry = new THREE.SphereGeometry(0.25, 24, 24);
  const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const star = new THREE.Mesh(geometry, material);

  const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(100));
  star.position.set(x, y, z);
  scene.add(star);
}

Array(200).fill().forEach(addStar);
