import * as THREE from 'three';
import { scene, camera, renderer } from './sceneSetup.js';
import { controls, resetManualInteraction } from './controls.js';
import { gltfModel, secondaryPCB, componentGroups, setIsRotating } from './modelLoader.js';
import { animateCameraToTopDown } from './cameraAnimation.js';
import { applyHighlight, resetHighlight, dimOtherComponents, restoreAllBrightness, applyHoverEffect, removeHoverEffect } from './highlighting.js';
import { showInfoPanel, hideInfoPanel } from './uiPanel.js';
import { getBaseName, getComponentGroup } from './utils.js';

const raycaster = new THREE.Raycaster();
raycaster.layers.set(1);
raycaster.params.Points = { threshold: 0.5 }; // Optimize raycasting

let selectedObject = null;
let hoveredObject = null;
let lastHoverCheck = 0;
const hoverCheckInterval = 75; // Reduced throttle for better hover responsiveness

// Cache for raycasting - only check layer 1 objects
let raycastTargets = [];

// Update raycast targets when models load
export function updateRaycastTargets() {
  raycastTargets = [];
  scene.children.forEach(obj => {
    obj.traverse(child => {
      if (child.isMesh && child.layers.test(camera.layers)) {
        raycastTargets.push(child);
      }
    });
  });
  console.log(`Raycast optimization: ${raycastTargets.length} targets cached`);
}

function onMouseDown(event) {
  const coords = new THREE.Vector2(
    (event.clientX / renderer.domElement.clientWidth) * 2 - 1,
    -((event.clientY / renderer.domElement.clientHeight) * 2 - 1)
  );

  raycaster.setFromCamera(coords, camera);
  const intersections = raycaster.intersectObjects(scene.children, true);

  if (intersections.length > 0) {
    const clickedMesh = intersections[0].object;
    
    // Determine which PCB was clicked
    let targetPCB = gltfModel;
    let current = clickedMesh;
    while (current.parent) {
      if (current === secondaryPCB) {
        targetPCB = secondaryPCB;
        break;
      }
      if (current === gltfModel) {
        targetPCB = gltfModel;
        break;
      }
      current = current.parent;
    }
    console.log('Clicked PCB:', targetPCB === gltfModel ? 'Main PCB' : 'Secondary PCB', 'Position:', targetPCB.position);
    
    let name = getBaseName(clickedMesh.name);   
    const clickedObject = getComponentGroup(clickedMesh, targetPCB);
    
    // Check if clicked object is the PCB (greenish color or name contains PCB)
    let isPCB = false;
    
    // Check by name first (most reliable)
    if (name.includes('PCB') || name.includes('pcb')) {
      isPCB = true;
    }
    
    // Also check by color
    if (!isPCB && clickedMesh.material && clickedMesh.material.color) {
      const hex = clickedMesh.material.color.getHex();
      const r = (hex >> 16) & 0xff;
      const g = (hex >> 8) & 0xff;
      const b = hex & 0xff;
      isPCB = (g > r && g > b && g > 20);
    }
    
    // Always do animation when clicking anywhere on the model
    setIsRotating(false);
    controls.autoRotate = false;
    resetManualInteraction(); // Clear any manual interaction flag before animation
    animateCameraToTopDown(camera, controls, targetPCB);
    
    // Only highlight and dim if it's NOT the PCB
    if (!isPCB) {
      if (selectedObject === name) return;
      if (selectedObject) {
        resetHighlight(componentGroups, selectedObject);
        restoreAllBrightness(componentGroups);
      }
      // Remove hover effect before applying selection
      if (hoveredObject === name) {
        removeHoverEffect(componentGroups, hoveredObject);
        hoveredObject = null;
      }
      selectedObject = name;
      applyHighlight(componentGroups, name);
      dimOtherComponents(componentGroups, name);
      showInfoPanel(name);
      console.log("Selected:", name);
    } else {
      // Clicked PCB - clear selection
      if (selectedObject) {
        resetHighlight(componentGroups, selectedObject);
        restoreAllBrightness(componentGroups);
        selectedObject = null;
      }
      // Clear hover too
      if (hoveredObject) {
        removeHoverEffect(componentGroups, hoveredObject);
        hoveredObject = null;
      }
      hideInfoPanel();
      console.log("Clicked PCB - animation only");
    }
  } else {
    // Clicked empty space → deselect
    if (selectedObject) {
      resetHighlight(componentGroups, selectedObject);
      restoreAllBrightness(componentGroups);
      selectedObject = null;
    }
    // Clear hover too
    if (hoveredObject) {
      removeHoverEffect(componentGroups, hoveredObject);
      hoveredObject = null;
    }
    hideInfoPanel();
  }
}

document.addEventListener('mousedown', onMouseDown);

// Hover detection (throttled for performance)
function onMouseMove(event) {
  // Throttle hover checks
  const now = Date.now();
  if (now - lastHoverCheck < hoverCheckInterval) return;
  lastHoverCheck = now;
  
  const coords = new THREE.Vector2(
    (event.clientX / renderer.domElement.clientWidth) * 2 - 1,
    -((event.clientY / renderer.domElement.clientHeight) * 2 - 1)
  );

  raycaster.setFromCamera(coords, camera);
  // Use recursive raycasting to detect nested meshes
  const intersections = raycaster.intersectObjects(scene.children, true);

  if (intersections.length > 0) {
    let name = getBaseName(intersections[0].object.name);
    const clickedMesh = intersections[0].object;
    
    // Check if it's PCB
    let isPCB = false;
    if (name.includes('PCB') || name.includes('pcb')) {
      isPCB = true;
    }
    if (!isPCB && clickedMesh.material && clickedMesh.material.color) {
      const hex = clickedMesh.material.color.getHex();
      const r = (hex >> 16) & 0xff;
      const g = (hex >> 8) & 0xff;
      const b = hex & 0xff;
      isPCB = (g > r && g > b && g > 20);
    }

    // Only hover if not PCB and not already selected
    if (!isPCB && name !== selectedObject) {
      if (hoveredObject !== name) {
        // Remove previous hover
        if (hoveredObject) {
          removeHoverEffect(componentGroups, hoveredObject);
        }
        // Apply new hover
        hoveredObject = name;
        applyHoverEffect(componentGroups, hoveredObject);
        document.body.style.cursor = 'pointer';
      }
    } else {
      // Remove hover if over PCB or selected object
      if (hoveredObject) {
        removeHoverEffect(componentGroups, hoveredObject);
        hoveredObject = null;
      }
      document.body.style.cursor = 'default';
    }
  } else {
    // No intersection - remove hover
    if (hoveredObject) {
      removeHoverEffect(componentGroups, hoveredObject);
      hoveredObject = null;
    }
    document.body.style.cursor = 'default';
  }
}

document.addEventListener('mousemove', onMouseMove);
