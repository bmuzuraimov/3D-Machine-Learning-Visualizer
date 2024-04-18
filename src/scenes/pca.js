// Example in src/scenes/dbscan.js
import * as THREE from "three";
import { createBackgroundParticles } from "../components/particles";
import { createGraniteMaterial } from "../components/materials";
import { data } from "autoprefixer";

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

export async function initPCAScene(
  renderer,
  controls,
  camera,
  audioLoader,
  sound,
  gui
) {
  const properties = {
    name: "PCA 3D -> 2D",
    description: "Visualization of the PCA algorithm.",
  };
  const gui_properties = {
    animate: false,
    animationSpeed: 0.005,
  };
  gui.add(gui_properties, "animationSpeed", 0.001, 0.01, 0.001).name("Animation Speed");
  gui.add(gui_properties, "animate").name("Animate")

  const scene = new THREE.Scene();
  
  const modelData = await fetchPCAModel();

  visualizePCAModel(scene, modelData);
  camera.lookAt(scene.position);
  // Example animation function
  function animate() {
    camera.lookAt(scene.position);
    renderer.render(scene, camera);
    if (gui_properties.animate) {
      dataPoints.forEach((point) => {
        point.position.lerp(point.userData.target, gui_properties.animationSpeed);
        if (point.position.distanceTo(point.userData.target) < 0.3) {
          point.position.copy(point.userData.target);
        }
        if (point.position.equals(point.userData.target)) {
          point.material.emissive.set(0x111111);
        }
      });
    }
  }

  return { properties, scene, animate };
}
