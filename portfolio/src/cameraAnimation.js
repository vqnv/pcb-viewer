import * as THREE from 'three';

export let isAnimatingCamera = false;

export const DEFAULT_NEAR = 0.1;

function setNear(camera, near) {
  camera.near = near;
  camera.updateProjectionMatrix();
}

export function animateCameraToTopDown(camera, controls, targetModel) {
  if (isAnimatingCamera) return;
  isAnimatingCamera = true;
  
  setNear(camera, DEFAULT_NEAR);
  let arrivalNear = DEFAULT_NEAR;

  // Disable controls during animation
  controls.enabled = false;
  
  // Use stored visual center or world position so camera goes to the right place
  const modelCenter = new THREE.Vector3(0, 0, 0);
  if (targetModel) {
    targetModel.updateMatrixWorld(true);
    if (targetModel.name === 'MusicalNoteGroup') {
      const box = new THREE.Box3().setFromObject(targetModel);
      box.getCenter(modelCenter);
    } else if (targetModel.userData?.visualCenter) {
      modelCenter.copy(targetModel.userData.visualCenter);
    } else {
      targetModel.getWorldPosition(modelCenter);
    }
  }
  
  console.log('Animating to target:', targetModel?.name, 'center:', modelCenter);
  
  // Target position: offset from model center. For note, put camera directly in front so note is dead center
  const isNote = targetModel?.name === 'MusicalNoteGroup';
  let targetPosition;
  if (isNote) {
    const dist =25;
    const dir = new THREE.Vector3(0, 0.4, 1).normalize();
    targetPosition = modelCenter.clone().add(dir.multiplyScalar(dist));
  } else {
    // Boards with a known size are framed to fit, including on narrow phone screens
    const fitSize = targetModel?.userData?.fitSize;
    const halfFov = THREE.MathUtils.degToRad(camera.fov / 2);
    const dy = fitSize ? (fitSize * 1.45) / (2 * Math.tan(halfFov) * Math.min(camera.aspect, 1)) : 12;
    const dz = fitSize ? dy * 0.2 : 3;
    if (fitSize) {
      // Slide the view so the board sits clear of the details panel:
      // the panel is on the right on wide screens and along the bottom on phones.
      if (camera.aspect > 1.2) modelCenter.x += fitSize * 0.4;
      else if (camera.aspect < 0.8) modelCenter.z += dy * 0.3;
      // Far-back views can have other objects in front of the board, so clip those out.
      arrivalNear = dy * 0.5;
    }
    targetPosition = new THREE.Vector3(modelCenter.x, modelCenter.y + dy, modelCenter.z + dz);
  }
  const targetLookAt = modelCenter.clone();
  
  // Store starting values
  const startPosition = camera.position.clone();
  const startQuaternion = camera.quaternion.clone();
  
  // Force controls target to the model center immediately
  controls.target.copy(modelCenter);
  
  // Don't rotate the note – keep it in place so it stays centered in frame
  const animateModelRotation = targetModel && targetModel.name !== 'MusicalNoteGroup';
  const startModelRotation = animateModelRotation ? {
    x: targetModel.rotation.x,
    y: targetModel.rotation.y,
    z: targetModel.rotation.z
  } : null;
  const targetModelRotation = { x: 0, y: 0, z: 0 };
  
  // Create target camera orientation
  const tempCamera = camera.clone();
  tempCamera.position.copy(targetPosition);
  tempCamera.up.set(0, 1, 0);
  tempCamera.lookAt(targetLookAt);
  const targetQuaternion = tempCamera.quaternion.clone();
  
  const startTime = Date.now();
  const duration = 1000;
  
  function animateStep() {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Easing function (ease-in-out)
    const eased = progress < 0.5
      ? 2 * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 2) / 2;
    
    // Interpolate camera position
    camera.position.lerpVectors(startPosition, targetPosition, eased);
    
    // Smoothly interpolate camera rotation
    camera.quaternion.slerpQuaternions(startQuaternion, targetQuaternion, eased);
    
    // Smoothly animate model rotation to flat orientation (skip for note so it stays centered)
    if (targetModel && startModelRotation && animateModelRotation) {
      targetModel.rotation.x = startModelRotation.x + (targetModelRotation.x - startModelRotation.x) * eased;
      targetModel.rotation.y = startModelRotation.y + (targetModelRotation.y - startModelRotation.y) * eased;
      targetModel.rotation.z = startModelRotation.z + (targetModelRotation.z - startModelRotation.z) * eased;
    }
    
    // Keep controls target locked to the model center
    controls.target.copy(targetLookAt);
    
    if (progress < 1) {
      requestAnimationFrame(animateStep);
    } else {
      camera.up.set(0, 1, 0);
      setNear(camera, arrivalNear);
      // Small delay before marking animation complete to ensure controls settle
      setTimeout(() => {
        isAnimatingCamera = false;
        controls.enabled = true;
        controls.update();
      }, 50);
    }
  }
  
  animateStep();
}

const HOME_POSITION = new THREE.Vector3(-10, 5, 15);
const HOME_TARGET = new THREE.Vector3(0, 0, 0);

/** Fly back to the opening view. */
export function animateCameraHome(camera, controls) {
  if (isAnimatingCamera) return;
  isAnimatingCamera = true;
  controls.enabled = false;
  setNear(camera, DEFAULT_NEAR);

  const startPosition = camera.position.clone();
  const startTarget = controls.target.clone();
  const startTime = Date.now();
  const duration = 1000;

  function step() {
    const progress = Math.min((Date.now() - startTime) / duration, 1);
    const eased = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
    camera.position.lerpVectors(startPosition, HOME_POSITION, eased);
    controls.target.lerpVectors(startTarget, HOME_TARGET, eased);
    camera.lookAt(controls.target);
    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      isAnimatingCamera = false;
      controls.enabled = true;
      controls.update();
    }
  }
  step();
}
