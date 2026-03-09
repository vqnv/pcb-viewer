import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { OutlineEffect } from 'three/examples/jsm/effects/OutlineEffect.js';

export const scene = new THREE.Scene();

export const camera = new THREE.PerspectiveCamera(
  75, 
  window.innerWidth / window.innerHeight, 
  0.1, 
  1000
);

export const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
  antialias: true, // Smoother edges on all devices including phone
  powerPreference: 'high-performance'
});

// Sharp on phone; cap at 2 for good balance of quality vs perf
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = false; // Disable shadows for performance

// Screen-space outline (only objects with material.userData.outlineParameters.visible === true get outlined)
export const outlineEffect = new OutlineEffect(renderer, {
  defaultThickness: 0.004,
  defaultColor: [0, 0.6, 0],
  defaultAlpha: 1
});

const pmremGenerator = new THREE.PMREMGenerator(renderer);
const roomEnvironment = new RoomEnvironment();
pmremGenerator.compileEquirectangularShader(); // Precompile shaders
scene.environment = pmremGenerator.fromScene(roomEnvironment).texture;
scene.environmentIntensity = 0.1; // Reduced even more for better performance
pmremGenerator.dispose(); // Clean up after generating
roomEnvironment.dispose(); // Clean up environment

camera.position.set(-10, 5, 15);
camera.layers.enable(1);
camera.lookAt(0, 0, 0);

scene.background = new THREE.Color(0x000000);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
});
