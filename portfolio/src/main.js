// Main entry point - orchestrates all modules
import './style.css';

// Initialize scene, camera, renderer
import './sceneSetup.js';

// Load model
import { loadModel, loadAdditionalComponent, loadSecondaryPCB } from './modelLoader.js';

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

// About cube and gear – add to scene and refresh raycast when ready
import { initAboutCube } from './aboutCube.js';
import { initGear } from './gear.js';
import { initPorsche } from './porsche.js';
import { initMusicalNote } from './musicalNote.js';
initAboutCube().then(() => updateRaycastTargets());
initGear().then(() => updateRaycastTargets());
initPorsche().then(() => updateRaycastTargets());
initMusicalNote().then(() => updateRaycastTargets());

// Load the 3D model
loadModel('usbmouseconnectorgeneric.glb').then(() => {
  console.log('PCB loaded, now loading additional components...');
  
  // Update raycast targets after main model loads for optimization
  setTimeout(() => updateRaycastTargets(), 100);
  
  // Load the second PCB at a different position
  loadSecondaryPCB('project.glb', 20);
  
  
  // USB-C Receptacle
  loadAdditionalComponent(
    'USB-C.glb',
    { x: 0.14, y: 0.003, z: 0.035 },
    { x: 0.001, y: 0.001, z: 0.001 },
    { x: 0, y: 0, z: 0 },
    0xcccccc,
    'USB_C_Receptacle_001'
  );
  
  // Microswitch 1 (black)
  loadAdditionalComponent(
    'Microswitch.glb',
    { x: 0.155, y: 0.005, z: 0.047 },  // Near center, visible
    { x: 0.001, y: 0.001, z: 0.001 },  // Small scale
    { x: 0, y: 1.57, z: 0 },  
    0x000000,  // Black
    'Microswitch_Left_001'
  );
  
  // Microswitch 2 (black)
  loadAdditionalComponent(
    'Microswitch.glb',
    { x: 0.121, y: 0.005, z: 0.047 },  // Near center, visible
    { x: 0.001, y: 0.001, z: 0.001 },  // Small scale
    { x: 0, y: 1.57, z: 0 },  
    0x000000,  // Black
    'Microswitch_Right_001'
  );
  
  // PMW3389 Sensor (dark gray)
  loadAdditionalComponent(
    'pmw3389.glb',
    { x: 0.14, y: 0.005, z: 0.096 },  // Center - adjust position
    { x: 0.001, y: 0.001, z: 0.001 },  // Scale - adjust as needed
    { x: -1.57, y: 0, z: 0 },  
    0x333333,  // Dark gray
    'PMW3389_Sensor_001'
  );

  // Encoder (rotary encoder)
  loadAdditionalComponent(
    'encoder.glb',
    { x: 0.139, y: 0, z: 0.0533 },  // Center - adjust position
    { x: 0.00083, y: 0.00083, z: 0.00083 },  // Scale - adjust as needed
    { x: -1.57, y: 0, z: 1.57 },  
    0x555555,  // Gray
    'Encoder_001'
  );
});

// Start rendering
animate();
