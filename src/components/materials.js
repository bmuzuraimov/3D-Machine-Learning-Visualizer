import * as THREE from 'three';
import { getParticleColor, SHININESS, LINE_WIDTH, SPECULAR_COLOR } from '../utils/constants';

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
