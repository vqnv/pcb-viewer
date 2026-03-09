import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { scene } from './sceneSetup.js';
import { componentGroups } from './modelLoader.js';

export let porscheGroup = null;

const PORSCHE_POSITION = new THREE.Vector3(-5, 7, 0);
const PORSCHE_SCALE = 1.5; // Car model is big – change this to resize (e.g. 0.02 = smaller)

export function initPorsche() {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    loader.load(
      '/porsche_gt3_rs.glb',
      (glb) => {
        const model = glb.scene;
        model.scale.setScalar(PORSCHE_SCALE);
        const meshes = [];
        model.traverse((child) => {
          if (child.isMesh) {
            child.name = 'Porsche';
            child.layers.set(1);
            if (child.material) child.userData.originalMaterial = child.material;
            meshes.push(child);
            // Screen-space green outline (OutlineEffect) – only visible edges, no back outline
            const mats = Array.isArray(child.material) ? child.material : [child.material];
            mats.forEach((m) => {
              if (m && !m.userData.outlineParameters) {
                m.userData.outlineParameters = { visible: true, color: [0, 0.6, 0], thickness: 0.004 };
              }
            });
          }
        });

        const group = new THREE.Group();
        group.name = 'PorscheGroup';
        group.position.copy(PORSCHE_POSITION);
        group.userData.visualCenter = PORSCHE_POSITION.clone();
        group.add(model);

        scene.add(group);
        componentGroups['Porsche'] = meshes;
        porscheGroup = group;
        resolve();
      },
      undefined,
      (err) => {
        console.error('Error loading porsche_gt3_rs.glb', err);
        reject(err);
      }
    );
  });
}
