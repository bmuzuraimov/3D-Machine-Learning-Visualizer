import * as THREE from "three";
import { fetchAPModel } from "../services/apropService";
import { createBackgroundParticles } from "../components/particles";
import {
  createPhongMaterial,
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
  if (!(object instanceof THREE.Line) && !(object instanceof THREE.Points)) {
    const scale = object.userData.isExemplar ? 1.1 : 2.0;
    if (highlight) {
      object.originalColor = object.material.color.getHex();
      const oppositeColor = getOppositeColor(
        object.material.color.getHexString()
      );
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
        line.castShadow = true;
        line.receiveShadow = true;

        line.userData = {
          startPosition,
          endPosition,
          progress: 0,
        };

        scene.add(line);
      }
    }
  });
}
async function visualizeAPModel(scene) {
  scene.fog = new THREE.Fog(FOG_COLOR, FOG_NEAR, FOG_FAR);
  createBackgroundParticles(scene);
  const modelData = await fetchAPModel();
  const exemplars = [];

  modelData.points.forEach((point) => {
    const sphere = createSphere(point);
    sphere.position.set(point.x, point.y, point.z);
    sphere.castShadow = true; // Enable shadow casting for this mesh
    sphere.receiveShadow = true; // Enable shadow receiving for this mesh
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
        object.userData.progress += 0.005; // Increment progress, adjust this value for speed
      }
    }
  });
}

export function initAPScene(renderer, controls, camera, audioLoader, sound, gui) {
  const properties = {
    name: "Affinity Propagation",
    description:
      "Visualization of the Affinity Propagation clustering algorithm.",
  };
  const gui_properties = {
    animate: false,
    animationSpeed: 0.00001,
  };
  gui
    .add(gui_properties, "animationSpeed", 0.00001, 0.0001, 0.00001)
    .name("Animation Speed");
  gui.add(gui_properties, "animate").name("Animate");

  const scene = new THREE.Scene();
  visualizeAPModel(scene).catch(console.error);

  function animate() {
    if (gui_properties.animate) {
      camera.position.x = 30 * Math.sin(Date.now() * gui_properties.animationSpeed);
      camera.position.z = 30 * Math.cos(Date.now() * gui_properties.animationSpeed);
      camera.position.y = 30 * Math.sin(Date.now() * gui_properties.animationSpeed);
      camera.lookAt(scene.position);
    }
    animateLines(scene);
    renderer.render(scene, camera);
    objectRaycaster(scene, camera, audioLoader, sound);
  }

  return { properties, scene, animate };
}
