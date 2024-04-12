import * as THREE from 'three';
import { fetchAPModel } from "../services/apropService";
import { createBackgroundParticles } from "../components/particles";
import { createPhongMaterial, createBasicMaterial } from "../components/materials";
import { sphereGeometry, exemplarGeometry } from "../components/geometries";
import { FOG_COLOR, FOG_NEAR, FOG_FAR } from '../utils/constants';

function createSphere(point) {
  return new THREE.Mesh(
    point.isExemplar ? exemplarGeometry : sphereGeometry,
    createPhongMaterial(point.cluster)
  );
}

// Archived code
// function connectPointsToExemplars(scene, points, exemplars) {
//   points.forEach(point => {
//     if (!point.isExemplar) {
//       const exemplar = exemplars.find(ex => ex.cluster === point.cluster);
//       if (exemplar) {
//         const points = [new THREE.Vector3(point.x, point.y, point.z), exemplar.position];
//         const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
//         scene.add(new THREE.Line(lineGeometry, createBasicMaterial(point.cluster)));
//       }
//     }
//   });
// }

function initLinesBetweenPoints(scene, points, exemplars) {
  points.forEach(point => {
      if (!point.isExemplar) {
          const exemplar = exemplars.find(ex => ex.cluster === point.cluster);
          if (exemplar) {
              const startPosition = exemplar.position;
              const endPosition = new THREE.Vector3(point.x, point.y, point.z);
              const lineGeometry = new THREE.BufferGeometry().setFromPoints([startPosition, startPosition.clone()]);
              const line = new THREE.Line(lineGeometry, createBasicMaterial(point.cluster));

              // Store the line and its target for animation
              line.userData = {
                  startPosition,
                  endPosition,
                  progress: 0 // Progress is 0 initially
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

  modelData.points.forEach(point => {
    const sphere = createSphere(point, sphereGeometry, exemplarGeometry);
    sphere.position.set(point.x, point.y, point.z);
    scene.add(sphere);
    if (point.isExemplar) {
      exemplars.push({ position: sphere.position, cluster: point.cluster });
    }
  });
  // connectPointsToExemplars(scene, modelData.points, exemplars);
  initLinesBetweenPoints(scene, modelData.points, exemplars);
}

function animateLines(scene) {
  scene.children.forEach(object => {
      if (object instanceof THREE.Line && object.userData) {
          const { startPosition, endPosition, progress } = object.userData;
          if (progress < 1) {
              const nextPosition = new THREE.Vector3().lerpVectors(startPosition, endPosition, progress);
              object.geometry.setFromPoints([startPosition, nextPosition]);
              object.geometry.attributes.position.needsUpdate = true; // Update the geometry
              object.userData.progress += 0.01; // Increment progress, adjust this value for speed
          }
      }
  });
}

export function initAPScene() {
  const properties = {
    name: "Affinity Propagation",
    description: "Visualization of the Affinity Propagation clustering algorithm."
  };
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  visualizeAPModel(scene).catch(console.error);

  function animate(renderer) {
    camera.position.x = 20 * Math.sin(Date.now() * 0.0001);
    camera.position.z = 20 * Math.cos(Date.now() * 0.0001);
    camera.position.y = 20 * Math.sin(Date.now() * 0.0001);
    camera.lookAt(scene.position);
    animateLines(scene);
    renderer.render(scene, camera);
  }

  return { properties, scene, camera, animate };
}