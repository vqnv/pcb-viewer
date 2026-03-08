import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

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

// Use full device pixel ratio for maximum sharpness on phone (2x–3x); cap at 3 to avoid extreme GPU load
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 3));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = false; // Disable shadows for performance

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

const spaceTexture = new THREE.TextureLoader().load('space (1).jpg');
scene.background = spaceTexture;

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 3));
  renderer.setSize(window.innerWidth, window.innerHeight);
});
