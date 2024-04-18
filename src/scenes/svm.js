// Example in src/scenes/dbscan.js
import * as THREE from "three";
import { metalness, reflect } from "three/examples/jsm/nodes/Nodes.js";

async function fetchSVMModel() {
  try {
    const response = await fetch('/api/svm/model_data_3D_SVM.json');
    const modelData = await response.json();
    console.log("Model data:", modelData);
    return modelData;
  } catch (error) {
    console.error("Failed to fetch SVM model data:", error);
  }
}

function visualizeSVMModel(scene, modelData) {
  const geometry = new THREE.SphereGeometry(0.5); // Size of the spheres
  console.log("SVM model data:", modelData);

  // First, draw all points and collect exemplars
  modelData.points.forEach((point, index) => {
    const gp0_pt_material = new THREE.MeshPhongMaterial({
        color: "#0080ff",
    });
    const gp1_pt_material = new THREE.MeshPhongMaterial({
        color: "#ff0000",
        
    });
    const SV_material = new THREE.MeshPhongMaterial({
        color: "#ffff00",
    });
    let sphere
    if(point.isSV)
    {
        sphere = new THREE.Mesh(geometry, SV_material);
    }
    else if(point.group === 0)
    {
        sphere = new THREE.Mesh(geometry, gp0_pt_material);
    }
    else
    {
        sphere = new THREE.Mesh(geometry, gp1_pt_material);
    }
    // set a random z coordinate for each point
    sphere.position.set(point.x*3, point.y*3, Math.random() * 5 * (Math.round(Math.random()) ? 1 : -1)*3);
    sphere.castShadow = true;
    scene.add(sphere);
  });

    // Hard margin
    // Define the two points
    var point1 = new THREE.Vector3(modelData.hard_Bdy[0].x1*3, modelData.hard_Bdy[0].y1*3, 0); // First point
    var point2 = new THREE.Vector3(modelData.hard_Bdy[0].x2*3, modelData.hard_Bdy[0].y2*3, 0); // Second point

    // Calculate the midpoint between the two points
    var midpoint = new THREE.Vector3().addVectors(point1, point2).multiplyScalar(0.5);

    // Calculate the vector between the two points
    var vector = new THREE.Vector3().subVectors(point2, point1).normalize();
    var normal = new THREE.Vector3(-vector.y, vector.x, 0);

    // Create a plane geometry
    var planeGeometry = new THREE.PlaneGeometry(30, 30, 1, 1);
    planeGeometry.lookAt(normal);
    planeGeometry.translate(midpoint.x, midpoint.y, midpoint.z); // Set the position to the midpoint

    // Create a material for the plane (customize as needed)
    var planeMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00, side: THREE.DoubleSide });

    // Create the plane mesh and add it to the scene
    var planeMesh = new THREE.Mesh(planeGeometry, planeMaterial)
    planeMesh.receiveShadow = true;
    planeMesh.name = "planeMesh"
    // scene.add(planeMesh);

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // Upper soft margin
    // Define the two points
    var point3 = new THREE.Vector3(modelData.upper_soft_Bdy[0].x1*3, modelData.upper_soft_Bdy[0].y1*3, 0); // First point
    var point4 = new THREE.Vector3(modelData.upper_soft_Bdy[0].x2*3, modelData.upper_soft_Bdy[0].y2*3, 0); // Second point

    // Calculate the midpoint between the two points
    var Usoft_midpoint = new THREE.Vector3().addVectors(point3, point4).multiplyScalar(0.5);

    // Calculate the vector between the two points
    var Usoft_vector = new THREE.Vector3().subVectors(point4, point3).normalize();
    var Usoft_normal = new THREE.Vector3(-Usoft_vector.y, Usoft_vector.x, 0);

    // Create a plane geometry
    var Usoft_planeGeometry = new THREE.PlaneGeometry(30, 30, 1, 1);
    Usoft_planeGeometry.lookAt(Usoft_normal);
    Usoft_planeGeometry.translate(Usoft_midpoint.x, Usoft_midpoint.y, Usoft_midpoint.z); // Set the position to the midpoint

    // Create a material for the plane (customize as needed)
    var Usoft_planeMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x00ff00, 
      side: THREE.DoubleSide,
      metalness: 1,
      roughness: 0.35,
      envMap: reflect,
      transparent: false,
      opacity: 0.5
    });

    // Create the plane mesh and add it to the scene
    var Usoft_planeMesh = new THREE.Mesh(Usoft_planeGeometry, Usoft_planeMaterial);
    Usoft_planeMesh.name = "Usoft_planeMesh"
    Usoft_planeMesh.receiveShadow = true;
    scene.add(Usoft_planeMesh);

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // Lower soft margin
    // Define the two points
    var point5 = new THREE.Vector3(modelData.lower_soft_Bdy[0].x1*3, modelData.lower_soft_Bdy[0].y1*3, 0); // First point
    var point6 = new THREE.Vector3(modelData.lower_soft_Bdy[0].x2*3, modelData.lower_soft_Bdy[0].y2*3, 0); // Second point

    // Calculate the midpoint between the two points
    var Lsoft_midpoint = new THREE.Vector3().addVectors(point5, point6).multiplyScalar(0.5);

    // Calculate the vector between the two points
    var Lsoft_vector = new THREE.Vector3().subVectors(point6, point5).normalize();
    var Lsoft_normal = new THREE.Vector3(-Lsoft_vector.y, Lsoft_vector.x, 0);

    // Create a plane geometry
    var Lsoft_planeGeometry = new THREE.PlaneGeometry(30, 30, 1, 1);
    Lsoft_planeGeometry.lookAt(Lsoft_normal);
    Lsoft_planeGeometry.translate(Lsoft_midpoint.x, Lsoft_midpoint.y, Lsoft_midpoint.z); // Set the position to the midpoint

    // Create a material for the plane (customize as needed)
    var Lsoft_planeMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide });

    // Create the plane mesh and add it to the scene
    var Lsoft_planeMesh = new THREE.Mesh(Lsoft_planeGeometry, Lsoft_planeMaterial);
    Lsoft_planeMesh.name = "Lsoft_planeMesh"
    Lsoft_planeMesh.receiveShadow = true;
    // scene.add(Lsoft_planeMesh);

    const axesHelper = new THREE.AxesHelper( 20 );
    scene.add( axesHelper );
}

export async function initSVMScene() {
  const properties = {
    name: "Support Vector Machine",
    description: "Visualization of the Support Vector Machine algorithm.",
  };
  const scene = new THREE.Scene();

  const modelData = await fetchSVMModel();
  visualizeSVMModel(scene, modelData);

  // Example animation function
  function animate(renderer, camera) {
    renderer.shadowMap.enable = true;
    renderer.render(scene, camera);
  }

  var PP = scene.getObjectByName("Usoft_planeMesh");
  // PP.MeshBasicMaterial.add()
  if(PP){
    console.log(PP)
  }
  return { properties, scene, animate };
}
