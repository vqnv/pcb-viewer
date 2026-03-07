import * as THREE from 'three';

export let isAnimatingCamera = false;

export function animateCameraToTopDown(camera, controls, targetModel) {
  if (isAnimatingCamera) return;
  isAnimatingCamera = true;
  
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
    const dy = 12, dz = 3;
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