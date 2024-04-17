// Example in src/scenes/dbscan.js
import * as THREE from "three";

async function fetchRawDataModel() {
  try {
    const response = await fetch('./raw_iris_data.json');
    const modelData = await response.json();
    console.log("Raw data:", modelData);
    return modelData;
  } catch (error) {
    console.error("Failed to fetch PCA raw data:", error);
  }
}

async function fetchPCAModel() {
    try {
      const response = await fetch('./iris_data_reduced.json');
      const modelData = await response.json();
      console.log("Model data:", modelData);
      return modelData;
    } catch (error) {
      console.error("Failed to fetch PCA model data:", error);
    }
}

function visualizePCAModel(scene, modelData, rawData) {
  const geometry = new THREE.SphereGeometry(0.5); // Size of the spheres
  console.log("PCA model data:", modelData);

  // First, draw all points and collect exemplars
  modelData.forEach((point, index) => {
    const Cluster0_material = new THREE.MeshBasicMaterial({
        color: "#0080ff",
    });
    const Cluster1_material = new THREE.MeshBasicMaterial({
        color: "#ff0000",
    });
    const Cluster2_material = new THREE.MeshBasicMaterial({
        color: "#ffff00",
    });
    let sphere

    if(point.Cluster === 0)
    {
        sphere = new THREE.Mesh(geometry, Cluster0_material);
    }
    else if(point.Cluster === 1)
    {
        sphere = new THREE.Mesh(geometry, Cluster1_material);
    }
    else
    {
        sphere = new THREE.Mesh(geometry, Cluster2_material);
    }
    // add cluster points to the scene
    sphere.position.set(point.PC1 * 10, point.PC2 * 10, 0);
    // scene.add(sphere); 
    // uncomment this and comment the below scene.add(sphere) get 2D PCA
  });

  rawData.forEach((point, index) => {
    const gp0_pt_material = new THREE.MeshBasicMaterial({
        color: "#0080ff",
    });
    const gp1_pt_material = new THREE.MeshBasicMaterial({
        color: "#ff0000",
        
    });
    const gp2_pt_material = new THREE.MeshBasicMaterial({
        color: "#ffff00",
    });
    let sphere
    if(point.group === 0)
    {
        sphere = new THREE.Mesh(geometry, gp0_pt_material);
    }
    else if(point.group === 1)
    {
        sphere = new THREE.Mesh(geometry, gp1_pt_material);
    }
    else if(point.group === 2)
    {
        sphere = new THREE.Mesh(geometry, gp2_pt_material);
    }
    // set x,y,z coordinate for each point + adjusting values for better illustration
    sphere.position.set(point.x * 6 - 22, point.y * 6 - 10, point.z * 6 - 5);
    scene.add(sphere);
    // uncomment this and comment the above scene.add(sphere) get 3D raw data plot
  });

  const axesHelper = new THREE.AxesHelper( 20 );
  scene.add( axesHelper );
}

export async function initPCAScene() {
  const properties = {
    name: "PCA",
    description: "Visualization of the PCA algorithm.",
  };
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  const rawData = await fetchRawDataModel();
  const modelData = await fetchPCAModel();
  visualizePCAModel(scene, modelData, rawData);

  // Example animation function
  function animate(renderer) {
    camera.position.x = 30 * Math.sin(Date.now() * 0.0001);
    camera.position.z = 30 * Math.cos(Date.now() * 0.0001);
    camera.lookAt(scene.position);
    renderer.render(scene, camera);
  }

  return { properties, scene, camera, animate };
}