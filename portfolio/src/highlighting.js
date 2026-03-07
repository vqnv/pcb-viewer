export function applyHighlight(componentGroups, baseName) {
  const meshes = componentGroups[baseName];
  if (!meshes) return;

  meshes.forEach(mesh => {
    // Skip PCB meshes - only highlight actual components
    if (mesh.material && mesh.material.color) {
      const hex = mesh.material.color.getHex();
      const r = (hex >> 16) & 0xff;
      const g = (hex >> 8) & 0xff;
      const b = hex & 0xff;
      // If it's greenish, it's PCB - skip it
      if (g > r && g > b && g > 20) {
        return; // Skip this mesh
      }
    }
    
    mesh.material = mesh.material.clone();
    mesh.material.emissive.set(0xffffff); // White highlight so it pops
    mesh.material.emissiveIntensity = 0.45;
    mesh.userData.isHighlighted = true;
  });
}

export function resetHighlight(componentGroups, baseName) {
  const meshes = componentGroups[baseName];
  if (!meshes) return;

  meshes.forEach(mesh => {
    mesh.material = mesh.userData.originalMaterial;
    mesh.userData.isHighlighted = false;
  });
}

export function dimOtherComponents(componentGroups, selectedBaseName) {
  // Subdue (not crush) other components so selected one stands out; keep scene visible
  const dimFactor = 0.35; // Proximity feel: rest of board still visible, not pitch black
  Object.keys(componentGroups).forEach(baseName => {
    if (baseName !== selectedBaseName) {
      const meshes = componentGroups[baseName];
      meshes.forEach(mesh => {
        if (!mesh.userData.isDimmed) {
          const dimmedMat = mesh.material.clone();
          const originalColor = mesh.material.color.getHex();
          const r = ((originalColor >> 16) & 0xff) * dimFactor;
          const g = ((originalColor >> 8) & 0xff) * dimFactor;
          const b = (originalColor & 0xff) * dimFactor;
          dimmedMat.color.setRGB(r / 255, g / 255, b / 255);
          dimmedMat.emissive.set(0x000000);
          mesh.material = dimmedMat;
          mesh.userData.isDimmed = true;
        }
      });
    }
  });
}

export function restoreAllBrightness(componentGroups) {
  // Restore all components to normal brightness
  Object.keys(componentGroups).forEach(baseName => {
    const meshes = componentGroups[baseName];
    meshes.forEach(mesh => {
      if (mesh.userData.isDimmed) {
        mesh.material = mesh.userData.originalMaterial;
        mesh.userData.isDimmed = false;
      }
    });
  });
}

export function applyHoverEffect(componentGroups, baseName) {
  const meshes = componentGroups[baseName];
  if (!meshes) {
    return;
  }

  meshes.forEach(mesh => {
    if (mesh.material && mesh.material.color) {
      const hex = mesh.material.color.getHex();
      const r = (hex >> 16) & 0xff;
      const g = (hex >> 8) & 0xff;
      const b = hex & 0xff;
      if (g > r && g > b && g > 20) {
        return;
      }
    }
    
    // Store current material if not already highlighted
    if (!mesh.userData.isHovered && !mesh.userData.isHighlighted) {
      mesh.userData.hoverMaterial = mesh.material.clone();
      mesh.userData.hoverMaterial.emissive.set(0xffffff); // White hover
      mesh.userData.hoverMaterial.emissiveIntensity = 0.25;
      mesh.material = mesh.userData.hoverMaterial;
      mesh.userData.isHovered = true;
    }
  });
}

export function removeHoverEffect(componentGroups, baseName) {
  const meshes = componentGroups[baseName];
  if (!meshes) return;

  meshes.forEach(mesh => {
    if (mesh.userData.isHovered && !mesh.userData.isHighlighted) {
      mesh.material = mesh.userData.originalMaterial;
      mesh.userData.isHovered = false;
    }
  });
}
