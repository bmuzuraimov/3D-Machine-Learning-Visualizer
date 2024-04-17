import * as THREE from 'three';
import { PARTICLE_COLOR } from '../utils/constants';

export function createBackgroundParticles(scene) {
  const geometry = new THREE.BufferGeometry();
  const vertices = [];
  for (let i = 0; i < 10000; i++) {
    vertices.push(
      THREE.MathUtils.randFloatSpread(2000),
      THREE.MathUtils.randFloatSpread(2000),
      THREE.MathUtils.randFloatSpread(2000)
    );
  }
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  scene.add(new THREE.Points(geometry, new THREE.PointsMaterial({ color: PARTICLE_COLOR })));
}
