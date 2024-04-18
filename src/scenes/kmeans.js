import * as THREE from "three";
import { fetchAPModel } from "../services/kmeansService";
import { createBackgroundParticles } from "../components/particles";
import {
  createGraniteMaterial,
  createBasicMaterial,
} from "../components/materials";
import { sphereGeometry, exemplarGeometry } from "../components/geometries";
import { playSound } from "../utils/audio";
import {
  FOG_COLOR,
  FOG_NEAR,
  FOG_FAR,
  getOppositeColor,
} from "../utils/constants";

const raycaster = new THREE.Raycaster();

let selectedObject = null;
let lastHoveredObject = null;
let soundBuffer = null;

const mouse = new THREE.Vector2();
function onMouseMove(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}
window.addEventListener("mousemove", onMouseMove, false);

function updateObjectAppearance(object, audioLoader, sound, highlight = true) {
  if (object instanceof THREE.Line) return;

  const scale = object.userData.isExemplar ? 1.1 : 2.0;
  if (highlight) {
    object.originalColor = object.material.color.getHex();
    const oppositeColor = getOppositeColor(object.material.color.getHexString());
    object.material.color.set(oppositeColor);
    object.scale.set(scale, scale, scale);
    if (lastHoveredObject !== object) {
      playSound(audioLoader, sound, soundBuffer);
      lastHoveredObject = object;
    }
  } else {
    object.material.color.setHex(object.originalColor);
    object.scale.set(1, 1, 1);
    sound.stop();
  }
}

function objectRaycaster(scene, camera, audioLoader, sound) {
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children, true);

  if (intersects.length > 0) {
    const firstIntersectedObject = intersects[0].object;
    if (selectedObject !== firstIntersectedObject) {
      if (selectedObject) {
        updateObjectAppearance(selectedObject, audioLoader, sound, false);
      }
      selectedObject = firstIntersectedObject;
      updateObjectAppearance(selectedObject, audioLoader, sound, true);
      updateInfoPanel(selectedObject.userData);
    }
  } else if (selectedObject) {
    updateObjectAppearance(selectedObject, audioLoader, sound, false);
    selectedObject = null;
    hideInfoPanel();
  }
}

function updateInfoPanel(userData) {
  const infoPanel = document.getElementById("infoPanel");
  const message = userData.isExemplar
    ? `Country: ${userData.country}`
    : `User: ${userData.name}<br>Country: ${userData.country}<br>Distance: ${userData.distance}`;
  infoPanel.innerHTML = message;
  infoPanel.style.display = "block";
}

function hideInfoPanel() {
  const infoPanel = document.getElementById("infoPanel");
  infoPanel.style.display = "none";
}


function createSphere(point) {
  // Create the material with the granite textures
  const material = createGraniteMaterial(point.cluster);

  return new THREE.Mesh(
    point.isExemplar ? exemplarGeometry : sphereGeometry,
    material,
  );
}

function initLinesBetweenPoints(scene, points, exemplars) {
  points.forEach((point) => {
    if (!point.isExemplar) {
      const exemplar = exemplars.find((ex) => ex.cluster === point.cluster);
      if (exemplar) {
        const startPosition = exemplar.position;
        const endPosition = new THREE.Vector3(point.x, point.y, point.z);
        const lineGeometry = new THREE.BufferGeometry().setFromPoints([
          startPosition,
          startPosition.clone(),
        ]);
        const line = new THREE.Line(
          lineGeometry,
          createBasicMaterial(point.cluster)
        );
        line.castShadow = true;    // Enable shadow casting for this mesh
        line.receiveShadow = true; // Enable shadow receiving for this mesh
        // Store the line and its target for animation
        line.userData = {
          startPosition,
          endPosition,
          progress: 0, // Progress is 0 initially
        };

        scene.add(line);
      }
    }
  });
}
async function visualizeAPModel(scene) {
  // Set scene fog
  scene.fog = new THREE.Fog(FOG_COLOR, FOG_NEAR, FOG_FAR);
  // Initial large particle cloud setup
  createBackgroundParticles(scene);

  // Data dependent geometry
  const modelData = await fetchAPModel();
  const exemplars = [];

  modelData.points.forEach((point) => {
    const sphere = createSphere(point, sphereGeometry, exemplarGeometry);
    sphere.position.set(point.x, point.y, point.z);
    sphere.castShadow = true;    // Enable shadow casting for this mesh
    sphere.receiveShadow = true;
    sphere.userData = {
      name: point.name,
      country: point.country,
      distance: point.distance,
      isExemplar: point.isExemplar,
    };
    scene.add(sphere);
    if (point.isExemplar) {
      exemplars.push({ position: sphere.position, cluster: point.cluster });
    }
  });
  // connectPointsToExemplars(scene, modelData.points, exemplars);
  initLinesBetweenPoints(scene, modelData.points, exemplars);
}

function animateLines(scene) {
  scene.children.forEach((object) => {
    if (object instanceof THREE.Line && object.userData) {
      const { startPosition, endPosition, progress } = object.userData;
      if (progress < 1) {
        const nextPosition = new THREE.Vector3().lerpVectors(
          startPosition,
          endPosition,
          progress
        );
        object.geometry.setFromPoints([startPosition, nextPosition]);
        object.geometry.attributes.position.needsUpdate = true; // Update the geometry
        object.userData.progress += 0.01; // Increment progress, adjust this value for speed
      }
    }
  });
}

export function initKMeansScene(renderer, controls, camera, audioLoader, sound) {
  const properties = {
    name: "K-Means Clustering",
    description:
      "K-means clustering is a method of vector quantization, originally from signal processing, that aims to partition n observations into k clusters in which each observation belongs to the cluster with the nearest mean.",
  };
  const scene = new THREE.Scene();

  visualizeAPModel(scene).catch(console.error);

  function animate() {
    camera.position.x = 20 * Math.sin(Date.now() * 0.00001);
    camera.position.z = 20 * Math.cos(Date.now() * 0.00001);
    camera.position.y = 20 * Math.sin(Date.now() * 0.00001);
    camera.lookAt(scene.position);
    animateLines(scene);
    renderer.render(scene, camera);
    objectRaycaster(scene, camera, audioLoader, sound);
  }

  return { properties, scene, animate };
}
