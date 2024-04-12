import * as THREE from 'three';
import { SPHERE_GEOMETRY } from '../utils/constants';

export const sphereGeometry = new THREE.SphereGeometry(SPHERE_GEOMETRY.small);
export const exemplarGeometry = new THREE.SphereGeometry(SPHERE_GEOMETRY.large);
