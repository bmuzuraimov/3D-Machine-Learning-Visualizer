<<<<<<< HEAD
import { initAPScene } from './src/scenes/aprop.js';
import { initSVMScene } from './src/scenes/svm.js';
import { initKMeansScene } from './src/scenes/kmeans.js';
import { initKNNScene } from './src/scenes/knn.js';
import { initPCAScene } from './src/scenes/pca.js';
=======
import { initAPScene } from "./src/scenes/aprop.js";
import { initSVMScene } from "./src/scenes/svm.js";
import { initKMeansScene } from "./src/scenes/kmeans.js";
import { initKNNScene } from "./src/scenes/knn.js";
import { initPCA } from "./src/scenes/pca.js";
>>>>>>> main

import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x263238);
document.body.appendChild(renderer.domElement);

// Assuming 'dat.GUI' has been included in your project.
const gui = new GUI();

const params = {
  algorithm: "aprop", // Default selected algorithm
};

// Add the algorithm selector to the GUI
gui
  .add(params, "algorithm", ["aprop", "svm", "kmeans", "knn", "pca"])
  .name("Select Algorithm")
  .onChange((algorithm) => {
    switch (algorithm) {
      case "aprop":
        switchScene(initAPScene);
        break;
      case "svm":
        switchScene(initSVMScene);
        break;
      case "kmeans":
        switchScene(initKMeansScene);
        break;
      case "knn":
        switchScene(initKNNScene);
        break;
      case "pca":
        switchScene(initPCA);
        break;
    }
  });
let lightProbe;
let directionalLight;
let ambientLight;
// linear color space
const API = {
  lightProbeIntensity: 1.0,
  directionalLightIntensity: 1.0,
  ambientLightIntensity: 0.1,
  envMapIntensity: 1,
};
gui
  .add(API, "lightProbeIntensity", 0, 1, 0.02)
  .name("light probe")
  .onChange(function () {
    lightProbe.intensity = API.lightProbeIntensity;
  });

gui
  .add(API, "ambientLightIntensity", 0, 1, 0.1)
  .name("ambient light")
  .onChange(function () {
    ambientLight.intensity = API.ambientLightIntensity;
  });
gui
  .add(API, "directionalLightIntensity", 0, 1, 0.1)
  .name("directional light")
  .onChange(function () {
    directionalLight.intensity = API.directionalLightIntensity;
  });

gui
  .add(API, "envMapIntensity", 0, 1, 0.02)
  .name("envMap")
  .onChange(function () {
    mesh.material.envMapIntensity = API.envMapIntensity;
  });

gui.add(params, "animate");

let currentAnimation;

async function switchScene(initSceneFunc) {
  if (currentAnimation) {
    cancelAnimationFrame(currentAnimation); // Stop the current animation
  }
  renderer.clear(); // Clear the current scene

  const { properties, scene, camera, animate } = await initSceneFunc();

  // Add orbit controls
  const controls = new OrbitControls(camera, renderer.domElement);
  // probe
  lightProbe = new THREE.LightProbe();
  scene.add(lightProbe);

  // light
  ambientLight = new THREE.AmbientLight(0xffffff, API.ambientLightIntensity);
  ambientLight.position.set(20, 20, 20);
  scene.add(ambientLight);

  directionalLight = new THREE.DirectionalLight(
    0xffffff,
    API.directionalLightIntensity
  );
  directionalLight.position.set(20, 20, 20);
  directionalLight.castShadow = true;
  scene.add(directionalLight);

  document.getElementById("algorithm-name").textContent = properties.name;

  currentAnimation = requestAnimationFrame(function animateScene() {
    animate(renderer);
    currentAnimation = requestAnimationFrame(animateScene);
    renderer.render(scene, camera);
    controls.update();
  });
}

<<<<<<< HEAD
document.getElementById('algorithmSelector').addEventListener('change', (event) => {
    switch (event.target.value) {
        case 'aprop':
            switchScene(initAPScene);
            break;
        case 'svm':
            switchScene(initSVMScene);
            break;
        case 'kmeans':
			switchScene(initKMeansScene);
			break;
		case 'knn':
			switchScene(initKNNScene);
			break;
        case 'pca':
            switchScene(initPCAScene);
            break;
    }
});

=======
>>>>>>> main
// Initialize with the first scene
switchScene(initAPScene);
