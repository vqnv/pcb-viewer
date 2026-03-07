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
    mesh.material.emissive.set(0xcccccc); // Subtle white/grey outline
    mesh.material.emissiveIntensity = 0.15; // Very subtle glow
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
  // Go through all component groups
  Object.keys(componentGroups).forEach(baseName => {
    if (baseName !== selectedBaseName) {
      const meshes = componentGroups[baseName];
      meshes.forEach(mesh => {
        // Clone and darken the material heavily
        if (!mesh.userData.isDimmed) {
          const dimmedMat = mesh.material.clone();
          // Make it very dark by multiplying color by 0.02
          const originalColor = mesh.material.color.getHex();
          const r = ((originalColor >> 16) & 0xff) * 0.02;
          const g = ((originalColor >> 8) & 0xff) * 0.02;
          const b = (originalColor & 0xff) * 0.02;
          dimmedMat.color.setRGB(r / 255, g / 255, b / 255);
          dimmedMat.emissive.set(0x000000); // No glow
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
      mesh.userData.hoverMaterial.emissive.set(0xffeb3b); // Subtle yellow glow
      mesh.userData.hoverMaterial.emissiveIntensity = 0.15; // Subtle intensity
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
