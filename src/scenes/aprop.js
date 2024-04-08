// Example in src/scenes/aprop.js
import * as THREE from "three";

async function fetchAPModel() {
  try {
    const response = await fetch('./model_data_3d.json');
    const modelData = await response.json();
    console.log("Model data:", modelData);
    return modelData;
  } catch (error) {
    console.error("Failed to fetch AP model data:", error);
  }
}

function visualizeAPModel(scene, modelData) {
  const geometry = new THREE.SphereGeometry(0.1); // Size of the spheres
  const exemplarGeometry = new THREE.SphereGeometry(0.3); // Larger spheres for exemplars
  console.log("AP model data:", modelData);

  // First, draw all points and collect exemplars
  const exemplars = []; // To store exemplar positions
  modelData.points.forEach((point, index) => {
    const material = new THREE.MeshBasicMaterial({
      color: getColorForCluster(point.cluster),
    });
    const sphere = new THREE.Mesh(point.isExemplar ? exemplarGeometry : geometry, material);
    sphere.position.set(point.x, point.y, point.z);
    scene.add(sphere);

    // If this point is an exemplar, store its position and index
    if (point.isExemplar) {
      exemplars.push({ position: sphere.position, cluster: point.cluster });
    }
  });

  // Then, connect each non-exemplar point to its exemplar
  modelData.points.forEach((point) => {
    if (!point.isExemplar) {
      // Find this point's exemplar
      const exemplar = exemplars.find(ex => ex.cluster === point.cluster);
      if (exemplar) {
        // Draw a line from this point to the exemplar
        const points = [new THREE.Vector3(point.x, point.y, point.z), exemplar.position];
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
        const lineMaterial = new THREE.LineBasicMaterial({ color: getColorForCluster(point.cluster), linewidth: 2 });
        const line = new THREE.Line(lineGeometry, lineMaterial);
        scene.add(line);
      }
    }
  });
}

function getColorForCluster(clusterId) {
  const colors = [
    "#ff0000", // Red
    "#00ff00", // Green
    "#0000ff", // Blue
    "#ffff00", // Yellow
    "#00ffff", // Cyan
    "#ff00ff", // Magenta
    "#ff8000", // Orange
    "#ff0080", // Pink
    "#80ff00", // Lime
    "#0080ff", // Sky blue
    "#8000ff", // Purple
    "#ff80ff", // Light pink
    "#ff8000", // Light orange
    "#80ff80", // Light green
    "#8080ff", // Light blue
    "#ffff80", // Light yellow
    "#80ffff", // Light cyan
    "#ff80ff", // Light magenta
    "#ff0080", // Light pink
    "#ff8000", // Light orange
  ];
  return colors[clusterId % colors.length];
}

export async function initAPScene() {
  const properties = {
    name: "Affinity Propagation",
    description: "Visualization of the Affinity Propagation clustering algorithm.",
  };
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  const modelData = await fetchAPModel();
  visualizeAPModel(scene, modelData);

  // Example animation function
  function animate(renderer) {
    camera.position.x = 30 * Math.sin(Date.now() * 0.0001);
    camera.position.z = 30 * Math.cos(Date.now() * 0.0001);
    camera.lookAt(scene.position);
    renderer.render(scene, camera);
  }

  return { properties, scene, camera, animate };
}
