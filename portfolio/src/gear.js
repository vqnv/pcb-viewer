import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { scene } from './sceneSetup.js';
import { componentGroups } from './modelLoader.js';

export let gearGroup = null;

const GEAR_POSITION = new THREE.Vector3(0, -4, 10);
const GEAR_SCALE = 0.1; // Change this to resize the gear (e.g. 0.25 = smaller, 1 = original)

export function initGear() {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    loader.load(
      '/gear.glb',
      (glb) => {
        const model = glb.scene;
        model.scale.setScalar(GEAR_SCALE);
        const meshes = [];
        model.traverse((child) => {
          if (child.isMesh) {
            child.name = 'Gear';
            child.layers.set(1);
            if (child.material) {
              child.userData.originalMaterial = child.material;
              const mats = Array.isArray(child.material) ? child.material : [child.material];
              mats.forEach((m) => {
                if (!m) return;
                m.userData.outlineParameters = { visible: true, color: [0, 0.6, 0], thickness: 0.004 };
              });
            }
            meshes.push(child);
          }
        });

        const group = new THREE.Group();
        group.name = 'GearGroup';
        group.position.copy(GEAR_POSITION);
        group.userData.visualCenter = GEAR_POSITION.clone();
        group.add(model);

        scene.add(group);
        componentGroups['Gear'] = meshes;
        gearGroup = group;
        resolve();
      },
      undefined,
      (err) => {
        console.error('Error loading gear.glb', err);
        reject(err);
      }
    );
  });
}
