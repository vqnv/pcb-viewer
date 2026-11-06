import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

// One loader for every model: the GLBs in public/ are meshopt-compressed.
export const gltfLoader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
