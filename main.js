import {
  initAPScene,
  initSVMScene,
  initKMeansScene,
  initPCAScene,
} from "./src/scenes";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x263238);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

let gui = NaN;

const camera = new THREE.PerspectiveCamera(
  40,
  window.innerWidth / window.innerHeight,
  1,
  1000
);
camera.position.set(15, 20, 30);
const controls = new OrbitControls(camera, renderer.domElement);
controls.minDistance = 10;
controls.maxDistance = 60;
controls.enableTransform = false;

const listener = new THREE.AudioListener();
camera.add(listener);
const sound = new THREE.Audio(listener);
const audioLoader = new THREE.AudioLoader();

let currentScene, ambientLight, directionalLight;

initLights();
switchScene(initAPScene, "aprop");

function initLights() {
  ambientLight = new THREE.AmbientLight(0x777777);
  directionalLight = new THREE.DirectionalLight(0xffffff);
  directionalLight.castShadow = true;
  directionalLight.position.set(20, 20, 20);
  directionalLight.shadow.mapSize.set(512, 512);
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 500;
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener("resize", onWindowResize);

async function switchScene(initSceneFunc, name) {
  if (currentScene) renderer.clear(); // Clear the current scene
  if (currentScene) cancelAnimationFrame(currentScene); // Stop the current animation
  if (gui) gui.destroy(); // Destroy the current GUI

  gui = new GUI();

  const params = { algorithm: name };
  gui
    .add(params, "algorithm", ["aprop", "svm", "kmeans", "pca"])
    .name("Select Algorithm")
    .onChange(switchSceneBasedOnAlgorithm);

  const API = { directionalLightIntensity: 1.0, ambientLightIntensity: 0.5 };
  gui
    .add(API, "ambientLightIntensity", 0, 1, 0.1)
    .name("Ambient Light")
    .onChange(updateLightIntensity);
  gui
    .add(API, "directionalLightIntensity", 0, 1, 0.1)
    .name("Directional Light")
    .onChange(updateLightIntensity);

  function updateLightIntensity() {
    ambientLight.intensity = API.ambientLightIntensity;
    directionalLight.intensity = API.directionalLightIntensity;
  }

  const { properties, scene, animate } = await initSceneFunc(
    renderer,
    controls,
    camera,
    audioLoader,
    sound,
    gui
  );
  currentScene = requestAnimationFrame(function animateScene() {
    currentScene = requestAnimationFrame(animateScene);
    animate();
    controls.update();
  });

  scene.add(ambientLight);
  scene.add(directionalLight);
  controls.reset();

  if (document.getElementById("algorithm-name")) {
    document.getElementById("algorithm-name").textContent = properties.name;
  }
}

function switchSceneBasedOnAlgorithm(algorithm) {
  switch (algorithm) {
    case "aprop":
      switchScene(initAPScene, "aprop");
      break;
    case "svm":
      switchScene(initSVMScene, "svm");
      break;
    case "kmeans":
      switchScene(initKMeansScene, "kmeans");
      break;
    case "pca":
      switchScene(initPCAScene, "pca");
      break;
  }
}
