import * as THREE from 'three';
import { scene, camera, renderer } from './sceneSetup.js';
import { controls, resetManualInteraction } from './controls.js';
import { gltfModel, secondaryPCB, componentGroups, isRotating, setIsRotating } from './modelLoader.js';
import { animateCameraToTopDown } from './cameraAnimation.js';
import { applyHighlight, resetHighlight, dimOtherComponents, restoreAllBrightness, applyHoverEffect, removeHoverEffect } from './highlighting.js';
import { showInfoPanel, hideInfoPanel } from './uiPanel.js';
import { getBaseName, getComponentGroup } from './utils.js';
import { aboutCubeGroup } from './aboutCube.js';
import { gearGroup } from './gear.js';
import { porscheGroup } from './porsche.js';
import { musicalNoteGroup } from './musicalNote.js';
import { setAllPCBComponentOutlinesVisible, setPCBComponentOutlinesFor } from './outlineManager.js';

const raycaster = new THREE.Raycaster();
raycaster.layers.set(1);
raycaster.params.Points = { threshold: 0.5 }; // Optimize raycasting

let selectedObject = null;
let hoveredObject = null;
let currentHoverKey = null;
let lastHoverCheck = 0;
const hoverCheckInterval = 75; // Reduced throttle for better hover responsiveness

// Hover speech bubble elements
const hoverBubbleEl = document.getElementById('hover-bubble');
const hoverBubbleTextEl = document.getElementById('hover-bubble-text');

function getHoverLabel(key) {
  const specials = {
    AboutCube: 'About me',
    Gear: 'Skills',
    Porsche: 'RC car story',
    MusicalNote: 'Favourite song',
    MainPCB: 'Mouse HID PCB',
    SecondaryPCB: 'Ambient light PCB'
  };
  if (specials[key]) return specials[key];
  return '';
}

function showHoverBubble(key, clientX, clientY) {
  if (!hoverBubbleEl || !hoverBubbleTextEl) return;
  const label = getHoverLabel(key);
  if (!label) {
    hoverBubbleEl.classList.remove('active');
    return;
  }
  hoverBubbleTextEl.textContent = label;
  hoverBubbleEl.style.left = `${clientX}px`;
  hoverBubbleEl.style.top = `${clientY - 16}px`;
  hoverBubbleEl.classList.add('active');
}

function hideHoverBubble() {
  if (!hoverBubbleEl) return;
  hoverBubbleEl.classList.remove('active');
}

// Cache for raycasting - only check layer 1 objects
let raycastTargets = [];

// Update raycast targets when models load (exclude merged zone meshes to reduce lag)
export function updateRaycastTargets() {
  raycastTargets = [];
  scene.children.forEach(obj => {
    obj.traverse(child => {
      if (!child.isMesh || !child.layers.test(camera.layers)) return;
      const name = (child.name || '').toLowerCase();
      if (name.includes('mergedtracks')) return; // skip big zone mesh(es)
      raycastTargets.push(child);
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
  const intersections = raycastTargets.length > 0
    ? raycaster.intersectObjects(raycastTargets, false)
    : raycaster.intersectObjects(scene.children, true);

  if (intersections.length > 0) {
    const clickedMesh = intersections[0].object;
    const name = getBaseName(clickedMesh.name) || clickedMesh.name || '';

    // About cube: animate to cube then open About Me panel
    if ((name === 'AboutCube' || clickedMesh.name === 'AboutCube') && aboutCubeGroup) {
      setIsRotating(false);
      controls.autoRotate = false;
      resetManualInteraction();
      if (selectedObject) {
        resetHighlight(componentGroups, selectedObject);
        restoreAllBrightness(componentGroups);
      }
      if (hoveredObject) {
        removeHoverEffect(componentGroups, hoveredObject);
        hoveredObject = null;
      }
      selectedObject = 'AboutCube';
      applyHighlight(componentGroups, 'AboutCube');
      dimOtherComponents(componentGroups, 'AboutCube');
      hideInfoPanel();
      animateCameraToTopDown(camera, controls, aboutCubeGroup);
      setTimeout(() => {
        document.getElementById('about-panel').classList.add('active');
      }, 900);
      return;
    }

    // Gear: animate to gear then open Skills panel
    if ((name === 'Gear' || clickedMesh.name === 'Gear') && gearGroup) {
      setIsRotating(false);
      controls.autoRotate = false;
      resetManualInteraction();
      if (selectedObject) {
        resetHighlight(componentGroups, selectedObject);
        restoreAllBrightness(componentGroups);
      }
      if (hoveredObject) {
        removeHoverEffect(componentGroups, hoveredObject);
        hoveredObject = null;
      }
      selectedObject = 'Gear';
      applyHighlight(componentGroups, 'Gear');
      dimOtherComponents(componentGroups, 'Gear');
      hideInfoPanel();
      animateCameraToTopDown(camera, controls, gearGroup);
      setTimeout(() => {
        document.getElementById('skills-panel').classList.add('active');
      }, 900);
      return;
    }

    // Porsche: animate to car then open RC car story panel
    if ((name === 'Porsche' || clickedMesh.name === 'Porsche') && porscheGroup) {
      setIsRotating(false);
      controls.autoRotate = false;
      resetManualInteraction();
      if (selectedObject) {
        resetHighlight(componentGroups, selectedObject);
        restoreAllBrightness(componentGroups);
      }
      if (hoveredObject) {
        removeHoverEffect(componentGroups, hoveredObject);
        hoveredObject = null;
      }
      selectedObject = 'Porsche';
      applyHighlight(componentGroups, 'Porsche');
      dimOtherComponents(componentGroups, 'Porsche');
      hideInfoPanel();
      animateCameraToTopDown(camera, controls, porscheGroup);
      setTimeout(() => {
        document.getElementById('story-panel').classList.add('active');
      }, 900);
      return;
    }

    // Musical note: animate to note then open Music panel (play favourite song)
    function isPartOfNote(obj) {
      let o = obj;
      while (o) {
        if (o === musicalNoteGroup || o.userData?.isMusicalNote) return true;
        o = o.parent;
      }
      return false;
    }
    const noteIsFirstHit = musicalNoteGroup && intersections.length > 0 && isPartOfNote(intersections[0].object);
    if (noteIsFirstHit) {
      setIsRotating(false);
      controls.autoRotate = false;
      resetManualInteraction();
      if (selectedObject) {
        resetHighlight(componentGroups, selectedObject);
        restoreAllBrightness(componentGroups);
      }
      if (hoveredObject) {
        removeHoverEffect(componentGroups, hoveredObject);
        hoveredObject = null;
      }
      selectedObject = 'MusicalNote';
      applyHighlight(componentGroups, 'MusicalNote');
      dimOtherComponents(componentGroups, 'MusicalNote');
      hideInfoPanel();
      animateCameraToTopDown(camera, controls, musicalNoteGroup);
      setTimeout(() => {
        document.getElementById('music-panel').classList.add('active');
      }, 900);
      return;
    }

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
    
    const clickedObject = getComponentGroup(clickedMesh, targetPCB);
    
    // Check if clicked object is the PCB (greenish) or yellow zones (tracks/pads)
    let isPCB = false;
    let isZone = false;

    // Yellow zones / merged tracks - unclickable
    if (name === 'MergedTracks' || name.includes('MergedTracks')) {
      isZone = true;
    }
    if (!isZone && clickedMesh.material && clickedMesh.material.color) {
      const hex = clickedMesh.material.color.getHex();
      const r = (hex >> 16) & 0xff;
      const g = (hex >> 8) & 0xff;
      const b = hex & 0xff;
      // Gold/yellow zone color (e.g. 0xFFD700)
      if (r > 200 && g > 150 && b < 100) isZone = true;
    }

    // Check by name for PCB
    if (name.includes('PCB') || name.includes('pcb')) {
      isPCB = true;
    }
    // Also check by color (greenish)
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
    // Enter PCB interaction mode: show component outlines for that PCB
    setPCBComponentOutlinesFor(targetPCB, true);
    animateCameraToTopDown(camera, controls, targetPCB);
    
    // Only highlight and dim if it's NOT the PCB and NOT yellow zones
    if (!isPCB && !isZone) {
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
      // Clicked PCB or zone - clear selection, animation only
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
    // Clicked empty space → deselect and resume rotation
    if (selectedObject) {
      resetHighlight(componentGroups, selectedObject);
      restoreAllBrightness(componentGroups);
      selectedObject = null;
    }
    if (hoveredObject) {
      removeHoverEffect(componentGroups, hoveredObject);
      hoveredObject = null;
    }
    hideInfoPanel();
    setIsRotating(true);
    controls.autoRotate = true;
    // Exit PCB interaction mode: hide component outlines again
    setAllPCBComponentOutlinesVisible(false);
  }
}

document.addEventListener('mousedown', onMouseDown);

// Hover detection (throttled for performance)
function onMouseMove(event) {
  // Throttle hover checks
  const now = Date.now();
  // Always keep bubble following the cursor for smoother motion while hovered
  if (currentHoverKey) {
    showHoverBubble(currentHoverKey, event.clientX, event.clientY);
  }
  if (now - lastHoverCheck < hoverCheckInterval) return;
  lastHoverCheck = now;

  // When we're zoomed in / rotating is paused, don't show high-level labels
  if (!isRotating) {
    hideHoverBubble();
    // Still let hover highlight logic run when clicking components, so continue
  }
  const coords = new THREE.Vector2(
    (event.clientX / renderer.domElement.clientWidth) * 2 - 1,
    -((event.clientY / renderer.domElement.clientHeight) * 2 - 1)
  );

  raycaster.setFromCamera(coords, camera);
  const intersections = raycastTargets.length > 0
    ? raycaster.intersectObjects(raycastTargets, false)
    : raycaster.intersectObjects(scene.children, true);

  if (intersections.length > 0) {
    let name = getBaseName(intersections[0].object.name);
    const clickedMesh = intersections[0].object;
    
    // Check if it's PCB or yellow zone (unclickable)
    let isPCB = false;
    let isZone = false;
    if (name === 'MergedTracks' || name.includes('MergedTracks')) {
      isZone = true;
    }
    if (!isZone && clickedMesh.material && clickedMesh.material.color) {
      const hex = clickedMesh.material.color.getHex();
      const r = (hex >> 16) & 0xff;
      const g = (hex >> 8) & 0xff;
      const b = hex & 0xff;
      if (r > 200 && g > 150 && b < 100) isZone = true;
    }
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

    // Highlight hover state for components only (same as before)
    if (!isPCB && !isZone && name !== selectedObject) {
      if (hoveredObject !== name) {
        // Remove previous hover
        if (hoveredObject) {
          removeHoverEffect(componentGroups, hoveredObject);
        }
        // Apply new hover
        hoveredObject = name;
        applyHoverEffect(componentGroups, hoveredObject);
      }
    } else {
      // Remove hover highlight if over PCB/zone/selected
      if (hoveredObject) {
        removeHoverEffect(componentGroups, hoveredObject);
        hoveredObject = null;
      }
    }

    // Decide which high-level object this hover should label (if any)
    let hoverKey = null;
    let current = clickedMesh;
    while (current) {
      if (current === aboutCubeGroup) { hoverKey = 'AboutCube'; break; }
      if (current === gearGroup) { hoverKey = 'Gear'; break; }
      if (current === porscheGroup) { hoverKey = 'Porsche'; break; }
      if (current === musicalNoteGroup || current.userData?.isMusicalNote) { hoverKey = 'MusicalNote'; break; }
      if (current === secondaryPCB) { hoverKey = 'SecondaryPCB'; break; }
      if (current === gltfModel) { hoverKey = 'MainPCB'; break; }
      current = current.parent;
    }

    if (isRotating && hoverKey) {
      document.body.style.cursor = 'pointer';
      currentHoverKey = hoverKey;
      showHoverBubble(hoverKey, event.clientX, event.clientY);
    } else {
      document.body.style.cursor = 'default';
      currentHoverKey = null;
      hideHoverBubble();
    }
  } else {
    // No intersection - remove hover
    if (hoveredObject) {
      removeHoverEffect(componentGroups, hoveredObject);
      hoveredObject = null;
    }
    document.body.style.cursor = 'default';
    currentHoverKey = null;
    hideHoverBubble();
  }
}

document.addEventListener('mousemove', onMouseMove);
