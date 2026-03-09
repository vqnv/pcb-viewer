import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { scene } from './sceneSetup.js';
import { componentGroups } from './modelLoader.js';

export let musicalNoteGroup = null;

const NOTE_POSITION = new THREE.Vector3(0, -10, -10); // High and in front so it's the first hit when you click it
const NOTE_SCALE = 3; // Bigger = easier to click and camera zooms to it

export function initMusicalNote() {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    loader.load(
      '/musical_note.glb',
      (glb) => {
        const model = glb.scene;
        model.scale.setScalar(NOTE_SCALE);
        const DARK_RED = 0x6b0000;
        const meshes = [];
        model.traverse((child) => {
          if (child.isMesh) {
            child.name = 'MusicalNote';
            child.layers.set(1);
            const mat = new THREE.MeshStandardMaterial({
              color: DARK_RED,
              metalness: 0.4,
              roughness: 0.5
            });
            mat.userData.outlineParameters = { visible: true, color: [0, 0.6, 0], thickness: 0.004 };
            child.userData.originalMaterial = mat;
            child.material = mat;
            meshes.push(child);
          }
        });

        // Orient so the wide face of the note faces the camera (camera is at +Y, +Z from center)
        model.rotation.x = -0.55; // tilt so wide side faces up–forward (not the thin edge)
        model.rotation.y = 0;
        model.rotation.z = 0;

        const group = new THREE.Group();
        group.name = 'MusicalNoteGroup';
        group.position.copy(NOTE_POSITION);
        group.userData.visualCenter = NOTE_POSITION.clone();
        group.userData.isMusicalNote = true; // so we can detect click even if mesh name is wrong
        group.add(model);

        scene.add(group);
        componentGroups['MusicalNote'] = meshes;
        musicalNoteGroup = group;
        resolve();
      },
      undefined,
      (err) => {
        console.error('Error loading musical_note.glb', err);
        reject(err);
      }
    );
  });
}
