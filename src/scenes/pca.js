// Example in src/scenes/dbscan.js
import * as THREE from "three";
import { createBackgroundParticles } from "../components/particles";
import {
  createGraniteMaterial,
} from "../components/materials";

let dataPoints = [];

async function fetchPCAModel() {
  try {
    const response = await fetch("./api/pca/data-model.json");
    const modelData = await response.json();
    return modelData;
  } catch (error) {
    console.error("Failed to fetch PCA model data:", error);
  }
}

function visualizePCAModel(scene, modelData) {
  createBackgroundParticles(scene);

  const geometry = new THREE.SphereGeometry(0.3, 16, 16);

  modelData.forEach((point) => {
    const material = createGraniteMaterial(point.group);
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.set(point.x, point.y, point.z);
    sphere.userData.target = new THREE.Vector3(point.PC1, point.PC2, 0);
    scene.add(sphere);
    dataPoints.push(sphere);
  });
  
  const axesHelper = new THREE.AxesHelper(20);
  scene.add(axesHelper);
}

export async function initPCAScene(renderer, controls, camera, audioLoader, sound) {
  const properties = {
    name: "PCA",
    description: "Visualization of the PCA algorithm.",
  };
  const scene = new THREE.Scene();

  const modelData = await fetchPCAModel();

  visualizePCAModel(scene, modelData);

  // Example animation function
  function animate() {
    camera.lookAt(scene.position);
    renderer.render(scene, camera);
    dataPoints.forEach(point => {
      point.position.lerp(point.userData.target, 0.005);
      if (point.position.distanceTo(point.userData.target) < 0.3) {
        point.position.copy(point.userData.target);
      }
      if (point.position.equals(point.userData.target)) {
        point.material.emissive.set(0x111111);
      }
  });
  }

  return { properties, scene, animate };
}
