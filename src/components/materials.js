import * as THREE from 'three';
import { getParticleColor, SHININESS, LINE_WIDTH, SPECULAR_COLOR } from '../utils/constants';
const baseColorTextureGranite = new THREE.TextureLoader().load('/textures/granite/Granite06large_1K_BaseColor.png');
const heightTextureGranite = new THREE.TextureLoader().load('/textures/granite/Granite06large_1K_Height.png');
const normalTextureGranite = new THREE.TextureLoader().load('/textures/granite/Granite06large_1K_Normal.png');
const roughnessTextureGranite = new THREE.TextureLoader().load('/textures/granite/Granite06large_1K_Roughness.png');

const baseColorTextureBrick = new THREE.TextureLoader().load('/textures/brick/BrickWall04_1K_BaseColor.png');
const heightTextureBrick = new THREE.TextureLoader().load('/textures/brick/BrickWall04_1K_Height.png');
const normalTextureBrick = new THREE.TextureLoader().load('/textures/brick/BrickWall04_1K_Normal.png');
const roughnessTextureBrick = new THREE.TextureLoader().load('/textures/brick/BrickWall04_1K_Roughness.png');

export function createPhongMaterial(color) {
  return new THREE.MeshPhongMaterial({
    color: getParticleColor(color),
    shininess: SHININESS,
    specular: SPECULAR_COLOR
  });
}

export function createBasicMaterial(color) {
  return new THREE.LineBasicMaterial({
    color: getParticleColor(color),
    linewidth: LINE_WIDTH
  });
}

export function createGraniteMaterial(color) {
  return new THREE.MeshStandardMaterial({
    color: getParticleColor(color),
    map: baseColorTextureGranite,
    displacementMap: heightTextureGranite,
    displacementScale: 0.1,
    normalMap: normalTextureGranite,
    roughnessMap: roughnessTextureGranite,
    metalness: 0.5,
    fog: true
  });
}

export function createBrickMaterial(color) {
  return new THREE.MeshStandardMaterial({
    color: getParticleColor(color),
    map: baseColorTextureBrick,
    displacementMap: heightTextureBrick,
    displacementScale: 0.1,
    normalMap: normalTextureBrick,
    roughnessMap: roughnessTextureBrick,
    metalness: 0.5,
    fog: true
  });
}
