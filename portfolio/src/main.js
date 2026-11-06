// Main entry point - orchestrates all modules
import './style.css';

// Initialize scene, camera, renderer
import './sceneSetup.js';

// Load model
import { loadModel, loadAdditionalComponent, loadSecondaryPCB, loadComponentOntoSecondaryPCB } from './modelLoader.js';

// Initialize lighting and stars
import './lighting.js';

// Initialize controls
import './controls.js';

// Initialize UI panel
import './uiPanel.js';

// Initialize interactions (click handlers)
import { updateRaycastTargets } from './interactions.js';

// Initialize name animation
import './nameAnimation.js';

// Initialize navigation handlers
import './navigation.js';

// Start animation loop
import { animate } from './animation.js';

import { initAboutCube } from './aboutCube.js';
import { initGear } from './gear.js';
import { initPorsche } from './porsche.js';
import { initMusicalNote } from './musicalNote.js';
import { initBoards } from './boardScene.js';

const loadingEl = document.getElementById('loading');

function loadMainPCBParts() {
  const noRotation = { x: 0, y: 0, z: 0 };
  const scale = { x: 0.001, y: 0.001, z: 0.001 };
  const sideways = { x: 0, y: 1.57, z: 0 };
  const flipped = { x: -1.57, y: 0, z: 0 };
  return Promise.all([
    loadAdditionalComponent('USB-C.glb', { x: 0.14, y: 0.003, z: 0.035 }, scale, noRotation, 0xcccccc, 'USB_C_Receptacle_001'),
    loadAdditionalComponent('Microswitch.glb', { x: 0.121, y: 0.005, z: 0.047 }, scale, sideways, 0x000000, 'Microswitch_Left_001'),
    loadAdditionalComponent('Microswitch.glb', { x: 0.155, y: 0.005, z: 0.047 }, scale, sideways, 0x000000, 'Microswitch_Right_001'),
    loadAdditionalComponent('pmw3389.glb', { x: 0.14, y: 0.005, z: 0.096 }, scale, flipped, 0x333333, 'PMW3389_Sensor_001'),
    loadAdditionalComponent(
      'encoder.glb',
      { x: 0.139, y: 0, z: 0.0533 },
      { x: 0.00083, y: 0.00083, z: 0.00083 },
      { x: -1.57, y: 0, z: 1.57 },
      0x555555,
      'Encoder_001'
    ),
  ]);
}

async function loadSecondPCB() {
  await loadSecondaryPCB('project.glb', 20);
  await Promise.all([
    loadComponentOntoSecondaryPCB(
      'nano.glb',
      { x: 0.167, y: 0.005, z: 0.1085 },
      { x: 0.001, y: 0.001, z: 0.001 },
      { x: 0, y: -1.57, z: 0 },
      0x000000,
      'Arduino_Nano_001'
    ),
    loadComponentOntoSecondaryPCB(
      'relay.glb',
      { x: 0.15, y: 0, z: 0.109 },
      { x: 0.0011, y: 0.0011, z: 0.0011 },
      { x: -1.57, y: 0, z: 0 },
      0x333333,
      'Relay_001'
    ),
  ]);
}

// Load in order of importance so the page is usable as early as possible:
// main board first, then everything small, and the heavy car last.
async function loadScene() {
  const small = [initAboutCube(), initGear(), initMusicalNote()].map((p) => p.then(updateRaycastTargets));
  await loadModel('usbmouseconnectorgeneric.glb');
  updateRaycastTargets();
  loadingEl.classList.add('done');

  await Promise.allSettled([loadMainPCBParts(), loadSecondPCB(), initBoards(), ...small]);
  updateRaycastTargets();

  await initPorsche();
  updateRaycastTargets();
}

loadScene().catch((error) => {
  console.error('Scene failed to load', error);
  loadingEl.textContent = 'Some 3D models failed to load. The menus still work.';
  loadingEl.classList.remove('done');
});

// Start rendering
animate();
