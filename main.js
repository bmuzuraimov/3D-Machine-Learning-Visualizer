import { initAPScene } from "./src/scenes/aprop.js";
import { initSVMScene } from "./src/scenes/svm.js";
import { initKMeansScene } from "./src/scenes/kmeans.js";
import { initKNNScene } from "./src/scenes/knn.js";
import { initPCAScene } from "./src/scenes/pca.js";

import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x263238);
document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(
  40,
  window.innerWidth / window.innerHeight,
  1,
  1000
);
camera.position.set(15, 20, 30);

// // create an AudioListener and add it to the camera
// const listener = new THREE.AudioListener();
// camera.add(listener);

// // create a global audio source
// const sound = new THREE.Audio(listener);

// // load a sound and set it as the Audio object's buffer
// const audioLoader = new THREE.AudioLoader();
// var stream =
//   "https://cdn.rawgit.com/ellenprobst/web-audio-api-with-Threejs/57582104/lib/TheWarOnDrugs.m4a";
// audioLoader.load(stream, function (buffer) {
//   sound.setBuffer(buffer);
//   sound.setLoop(true);
//   sound.setVolume(0.5);
//   sound.play();
// });

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
        switchScene(initPCAScene);
        break;
    }
  });
let directionalLight;
let ambientLight;
// linear color space
const API = {
  directionalLightIntensity: 1.0,
  ambientLightIntensity: 0.5,
};

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

gui.add(params, "animate");

let currentAnimation;

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener("resize", onWindowResize);

async function switchScene(initSceneFunc) {
  if (currentAnimation) {
    cancelAnimationFrame(currentAnimation); // Stop the current animation
  }
  renderer.clear(); // Clear the current scene

  const { properties, scene, animate } = await initSceneFunc();

  // Add orbit controls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.minDistance = 20;
  controls.maxDistance = 50;

  // light
  ambientLight = new THREE.AmbientLight(0x666666, API.ambientLightIntensity);
  ambientLight.position.set(20, 20, 20);
  scene.add(ambientLight);

  directionalLight = new THREE.DirectionalLight(
    0xffffff,
    API.directionalLightIntensity
  );
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 512; // Default
  directionalLight.shadow.mapSize.height = 512; // Default
  directionalLight.shadow.camera.near = 0.5; // Default
  directionalLight.shadow.camera.far = 500; // Default
  directionalLight.position.set(20, 20, 20);
  directionalLight.castShadow = true;
  scene.add(directionalLight);

  document.getElementById("algorithm-name").textContent = properties.name;

  currentAnimation = requestAnimationFrame(function animateScene() {
    animate(renderer, camera);
    currentAnimation = requestAnimationFrame(animateScene);
    renderer.render(scene, camera);
    controls.update();
  });
}

// Initialize with the first scene
switchScene(initAPScene);
