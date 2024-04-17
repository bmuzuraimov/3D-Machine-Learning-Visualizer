import * as THREE from "three";
import { fetchAPModel } from "../services/kmeansService";
import { createBackgroundParticles } from "../components/particles";
import {
  createPhongMaterial,
  createBasicMaterial,
} from "../components/materials";
import { sphereGeometry, exemplarGeometry } from "../components/geometries";
import {
  FOG_COLOR,
  FOG_NEAR,
  FOG_FAR,
  getOppositeColor,
} from "../utils/constants";

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

let selectedObject = null;

function onMouseMove(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}
window.addEventListener("mousemove", onMouseMove, false);

const originalColors = new Map();

function updateObjectAppearance(object, highlight = true) {
  if(!object.userData) return;
  if (highlight) {
    originalColors.set(object, object.material.color.getHex());
    const oppositeColor = getOppositeColor(
      object.material.color.getHexString()
    );
    object.material.color.set(oppositeColor);
    object.scale.set(1.5, 1.5, 1.5);
  } else {
    object.material.color.set(originalColors.get(object));
    object.scale.set(1, 1, 1);
    originalColors.delete(object);
  }
}

function objectRaycaster(scene, camera) {
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children, true);

  if (intersects.length > 0) {
    const firstIntersectedObject = intersects[0].object;
    if (selectedObject !== firstIntersectedObject) {
      if (selectedObject) {
        updateObjectAppearance(selectedObject, false);
      }
      selectedObject = firstIntersectedObject;
      updateObjectAppearance(selectedObject, true);

      const infoPanel = document.getElementById("infoPanel");
      const userData = selectedObject.userData;
      const message = userData.isExemplar
        ? `Country: ${userData.country}`
        : `User: ${userData.name}<br>Country: ${userData.country}<br>Distance: ${userData.distance}`;
      infoPanel.innerHTML = message;
      infoPanel.style.display = "block";
    }
  } else if (selectedObject) {
    updateObjectAppearance(selectedObject, false);
    selectedObject = null;
    document.getElementById("infoPanel").style.display = "none";
  }
}

function createSphere(point) {
  return new THREE.Mesh(
    point.isExemplar ? exemplarGeometry : sphereGeometry,
    createPhongMaterial(point.cluster)
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

export function initKMeansScene() {
  const properties = {
    name: "Affinity Propagation",
    description:
      "Visualization of the Affinity Propagation clustering algorithm.",
  };
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 5;

  visualizeAPModel(scene).catch(console.error);

  function animate(renderer) {
    camera.position.x = 20 * Math.sin(Date.now() * 0.00001);
    camera.position.z = 20 * Math.cos(Date.now() * 0.00001);
    camera.position.y = 20 * Math.sin(Date.now() * 0.00001);
    camera.lookAt(scene.position);
    animateLines(scene);
    renderer.render(scene, camera);
    objectRaycaster(scene, camera, selectedObject);
  }

  return { properties, scene, camera, animate };
}
