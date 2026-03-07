import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { scene } from './sceneSetup.js';
import { getBaseName } from './utils.js';

export let gltfModel = null;
export let secondaryPCB = null;
export let componentGroups = {};
export let isRotating = true;

// Material cache for performance - reuse materials instead of creating new ones
const materialCache = new Map();

/** Returns true if mesh looks like a track/zone/pad (by name or copper/yellow color). */
function isTrackOrZoneMesh(child) {
  const meshName = child.name.toLowerCase();
  const nameMatch = meshName.includes('track') || meshName.includes('zone') ||
    meshName.includes('pad') || meshName.includes('via') || meshName.includes('trace') ||
    meshName.includes('copper') || meshName.includes('fill') || meshName.includes('polygon') ||
    meshName.includes('pour') || meshName.includes('signal') || meshName.includes('plane') ||
    meshName.includes('pad_') || meshName.includes('track_');
  if (nameMatch) return true;
  // Fallback: merge by color (gold/copper/yellow) so unnamed zone meshes get merged
  if (!child.material || !child.material.color) return false;
  const hex = child.material.color.getHex();
  const r = (hex >> 16) & 0xff, g = (hex >> 8) & 0xff, b = hex & 0xff;
  return r > 180 && g > 140 && b < 120;
}

export function setIsRotating(value) {
  isRotating = value;
}

export function loadModel(modelPath) {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    
    loader.load(
      modelPath,
      function (glb) {
        console.log('GLB model loaded successfully:', glb);
        const model = glb.scene;
        
        // Collect track/zone/pad meshes for merging (by name or copper/yellow color)
        const trackGeometries = [];
        const trackMeshesToRemove = [];
        let trackColor = null; // We'll use the first track's color
        
        model.traverse((child) => {
          if (child.isMesh) {
            const baseName = getBaseName(child.name);

            if (isTrackOrZoneMesh(child)) {
              if (!trackColor && child.material && child.material.color) {
                trackColor = child.material.color.getHex();
              }
              const geometry = child.geometry.clone();
              child.updateWorldMatrix(true, false);
              geometry.applyMatrix4(child.matrixWorld);
              trackGeometries.push(geometry);
              trackMeshesToRemove.push(child);
            } else {
              // Not a track - keep it separate
              child.layers.set(1);
              
              // Get the original color
              let materialColor;
              
              // If it has a texture map, skip it
              if (child.material.map) {
                if (!componentGroups[baseName]) {
                  componentGroups[baseName] = [];
                }
                componentGroups[baseName].push(child);
                return;
              }
              
              if (child.material.color) {
                const hex = child.material.color.getHex();
                
                // Check if it's greenish (likely the PCB substrate)
                const r = (hex >> 16) & 0xff;
                const g = (hex >> 8) & 0xff;
                const b = hex & 0xff;
                
                if (g > r && g > b && g > 100) {
                  // It's green - make it dark PCB green
                  materialColor = 0x1a5c1a;
                } else {
                  // Keep original color for components
                  materialColor = hex;
                }
              } else {
                materialColor = 0x888888; // Default grey
              }
              
              // Reuse materials from cache for better performance
              const materialKey = `${materialColor}_0.85_0.15`;
              let material = materialCache.get(materialKey);
              if (!material) {
                material = new THREE.MeshStandardMaterial({
                  color: materialColor,
                  metalness: 0.85,
                  roughness: 0.15
                });
                materialCache.set(materialKey, material);
              }
              child.material = material;
              
              // Save THIS material as the original for reset
              child.userData.originalMaterial = child.material;
              
              if (!componentGroups[baseName]) {
                componentGroups[baseName] = [];
              }
              componentGroups[baseName].push(child);
            }
          }
        });
        
        // Merge all track geometries into one mesh with their original color
        if (trackGeometries.length > 0) {
          console.log(`Merging ${trackGeometries.length} track/zone/pad meshes into one...`);
          
          const mergedGeometry = mergeGeometries(trackGeometries, false);
          
          const mergedMesh = new THREE.Mesh(
            mergedGeometry,
            new THREE.MeshStandardMaterial({
              color: trackColor || 0xFFD700,
              metalness: 0.85,
              roughness: 0.15
            })
          );
          
          mergedMesh.layers.set(1);
          mergedMesh.name = 'MergedTracks';
          mergedMesh.userData.originalMaterial = mergedMesh.material;
          
          // Remove old track meshes
          trackMeshesToRemove.forEach(mesh => {
            if (mesh.parent) {
              mesh.parent.remove(mesh);
            }
          });
          
          model.add(mergedMesh);
          componentGroups['MergedTracks'] = [mergedMesh];
          
          console.log(`Track merging complete! Reduced ${trackGeometries.length} meshes to 1, keeping original color`);
        }
        
        // Make model larger and more visible first
        model.scale.set(200, 200, 200);
        model.position.set(0, 0, 0);
        
        // Center the model more precisely
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        console.log('Scaled model bounding box center:', center);
        
        // Center the model by moving it so its center is at origin
        model.position.copy(center.negate());
        
        // Store the visual center for camera animation
        model.userData.visualCenter = new THREE.Vector3(0, 0, 0);
        
        // Add some rotation so it's easier to see
        model.rotation.x = 0.3;
        model.rotation.y = 0.3;
        
        // Store model globally
        gltfModel = model;
        
        scene.add(model);
        console.log('Model repositioned to center it at origin');
        
        resolve(model);
      },
      function(progress) {
        console.log('Loading progress:', progress);
      },
      function (error) {
        console.error('Error loading GLB model:', error);
        reject(error);
      }
    );
  });
}

// Load additional components (USB-C, encoders, etc.)
export function loadAdditionalComponent(componentPath, position, scale, rotation, color = 0xcccccc, componentName = 'Component') {
  const loader = new GLTFLoader();
  
  loader.load(
    componentPath,
    function (glb) {
      console.log('Additional component loaded:', componentPath);
      const component = glb.scene;
      
      // Apply scale, position, and rotation
      component.scale.set(scale.x, scale.y, scale.z);
      component.position.set(position.x, position.y, position.z);
      component.rotation.set(rotation.x, rotation.y, rotation.z);
      
      // Apply material to all meshes and set up for interactions
      component.traverse((child) => {
        if (child.isMesh) {
          // Set name for identification
          child.name = componentName;
          
          // Reuse material from cache (shinier)
          const materialKey = `${color}_0.85_0.15`;
          let material = materialCache.get(materialKey);
          if (!material) {
            material = new THREE.MeshStandardMaterial({
              color: color,
              metalness: 0.85,
              roughness: 0.15
            });
            materialCache.set(materialKey, material);
          }
          child.material = material;
          
          // Save original material for reset
          child.userData.originalMaterial = child.material;
          
          // Set layer for raycasting
          child.layers.set(1);
          
          // Add to component groups for interactions
          // Use base name without _001 suffix for consistency with getBaseName()
          const baseName = getBaseName(componentName);
          if (!componentGroups[baseName]) {
            componentGroups[baseName] = [];
          }
          componentGroups[baseName].push(child);
        }
      });
      
      // Add to PCB model so it rotates with it
      if (gltfModel) {
        gltfModel.add(component);
        console.log('Component added to PCB at position:', position);
      } else {
        console.error('PCB model not available!');
      }
    },
    function(progress) {
      console.log('Loading component progress:', progress);
    },
    function (error) {
      console.error('Error loading component:', error);
    }
  );
}

// Load a secondary PCB model (for displaying multiple PCBs)
export function loadSecondaryPCB(modelPath, offsetX = 300) {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    
    loader.load(
      modelPath,
      function (glb) {
        console.log('Secondary PCB loaded:', modelPath);
        const model = glb.scene;
        
        // Collect track/zone/pad meshes for merging (by name or copper/yellow color)
        const trackGeometries = [];
        const trackMeshesToRemove = [];
        let trackColor = null;
        
        model.traverse((child) => {
          if (child.isMesh) {
            const baseName = getBaseName(child.name);

            if (isTrackOrZoneMesh(child)) {
              if (!trackColor && child.material && child.material.color) {
                trackColor = child.material.color.getHex();
              }
              const geometry = child.geometry.clone();
              child.updateWorldMatrix(true, false);
              geometry.applyMatrix4(child.matrixWorld);
              trackGeometries.push(geometry);
              trackMeshesToRemove.push(child);
            } else {
              // Keep everything else separate
              child.layers.set(1);
              
              // Get the original color
              let materialColor;
              
              // If it has a texture map, skip it
              if (child.material.map) {
                if (!componentGroups[baseName]) {
                  componentGroups[baseName] = [];
                }
                componentGroups[baseName].push(child);
                return;
              }
              
              if (child.material.color) {
                const hex = child.material.color.getHex();
                
                // Check if it's greenish (likely the PCB substrate)
                const r = (hex >> 16) & 0xff;
                const g = (hex >> 8) & 0xff;
                const b = hex & 0xff;
                
                if (g > r && g > b && g > 100) {
                  // It's green - make it dark PCB green
                  materialColor = 0x1a5c1a;
                } else {
                  // Keep original color for components
                  materialColor = hex;
                }
              } else {
                materialColor = 0x888888; // Default grey
              }
              
              // Reuse materials from cache for better performance
              const materialKey = `${materialColor}_0.85_0.15`;
              let material = materialCache.get(materialKey);
              if (!material) {
                material = new THREE.MeshStandardMaterial({
                  color: materialColor,
                  metalness: 0.85,
                  roughness: 0.15
                });
                materialCache.set(materialKey, material);
              }
              child.material = material;
              
              // Save THIS material as the original for reset
              child.userData.originalMaterial = child.material;
              
              if (!componentGroups[baseName]) {
                componentGroups[baseName] = [];
              }
              componentGroups[baseName].push(child);
            }
          }
        });
        
        // Merge track geometries
        if (trackGeometries.length > 0) {
          console.log(`Merging ${trackGeometries.length} secondary PCB track meshes...`);
          
          const mergedGeometry = mergeGeometries(trackGeometries, false);
          
          const mergedMesh = new THREE.Mesh(
            mergedGeometry,
new THREE.MeshStandardMaterial({
              color: trackColor || 0xFFD700,
              metalness: 0.85,
              roughness: 0.15
            })
          );

          mergedMesh.layers.set(1);
          mergedMesh.name = 'MergedSecondaryTracks';
          mergedMesh.userData.originalMaterial = mergedMesh.material;
          
          trackMeshesToRemove.forEach(mesh => {
            if (mesh.parent) {
              mesh.parent.remove(mesh);
            }
          });
          
          model.add(mergedMesh);
          componentGroups['MergedSecondaryTracks'] = [mergedMesh];
          
          console.log('Secondary track merging complete!');
        }
        
        // Make model larger and more visible
        model.scale.set(200, 200, 200);
        
        // Center the model within a container group so it rotates around its center
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        
        // Center the model at its local origin
        model.position.copy(center.negate());
        
        // Create a group container and add the model to it
        const pcbGroup = new THREE.Group();
        pcbGroup.add(model);
        
        // Position the entire group at the offset location
        pcbGroup.position.set(offsetX, 0, 0);
        
        // Store the visual center for camera animation
        pcbGroup.userData.visualCenter = new THREE.Vector3(offsetX, 0, 0);
        
        // Add some rotation so it's easier to see
        pcbGroup.rotation.x = 0.3;
        pcbGroup.rotation.y = 0.3;
        
        // Store as secondary PCB for animation
        secondaryPCB = pcbGroup;
        console.log('Secondary PCB stored for rotation:', secondaryPCB);
        
        scene.add(pcbGroup);
        console.log('Secondary PCB added at offset:', offsetX);
        
        resolve(model);
      },
      function(progress) {
        console.log('Loading secondary PCB:', progress);
      },
      function (error) {
        console.error('Error loading secondary PCB:', error);
        reject(error);
      }
    );
  });
}


