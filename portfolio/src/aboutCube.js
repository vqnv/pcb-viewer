import * as THREE from 'three';
import { scene } from './sceneSetup.js';
import { componentGroups } from './modelLoader.js';

export let aboutCubeGroup = null;

const CUBE_SIZE = 4;
const CUBE_POSITION = new THREE.Vector3(-15, -1, -3);

/** Creates the about cube (same PNG on each face), adds to scene, runs callback when ready. */
export function initAboutCube() {
  return new Promise((resolve) => {
    const loader = new THREE.TextureLoader();
    loader.load(
      '/about-cube.jpg',
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.flipY = false;
        // Use a square PNG so it doesn't stretch on cube faces

        const geometry = new THREE.BoxGeometry(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE);
        const material = new THREE.MeshStandardMaterial({
          map: texture,
          metalness: 0.2,
          roughness: 0.4
        });
        material.userData.outlineParameters = { visible: true, color: [0, 0.6, 0], thickness: 0.004 };
        const cube = new THREE.Mesh(geometry, material);
        cube.name = 'AboutCube';
        cube.layers.set(1);
        cube.userData.originalMaterial = material;

        const group = new THREE.Group();
        group.name = 'AboutCubeGroup';
        group.position.copy(CUBE_POSITION);
        group.userData.visualCenter = CUBE_POSITION.clone();
        group.add(cube);

        scene.add(group);
        componentGroups['AboutCube'] = [cube];
        aboutCubeGroup = group;
        resolve();
      },
      undefined,
      () => {
        // Fallback if texture fails: plain colored cube so something is visible
        const geometry = new THREE.BoxGeometry(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE);
        const material = new THREE.MeshStandardMaterial({ color: 0x4488ff });
        material.userData.outlineParameters = { visible: true, color: [0, 0.6, 0], thickness: 0.004 };
        const cube = new THREE.Mesh(geometry, material);
        cube.name = 'AboutCube';
        cube.layers.set(1);
        cube.userData.originalMaterial = material;
        const group = new THREE.Group();
        group.name = 'AboutCubeGroup';
        group.position.copy(CUBE_POSITION);
        group.userData.visualCenter = CUBE_POSITION.clone();
        group.add(cube);
        scene.add(group);
        componentGroups['AboutCube'] = [cube];
        aboutCubeGroup = group;
        resolve();
      }
    );
  });
}
