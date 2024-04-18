import * as THREE from "three";
import { reflect } from "three/examples/jsm/nodes/Nodes.js";
import { fetchSVMModel, createTextureMaterial } from "../services/svmService";
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';

function visualizeSVMModel(scene, modelData) {
  const sphereGeometry = new THREE.SphereGeometry(0.6); // Standard size for all spheres
  // Load brick textures once for reuse
  const textureLoader = new THREE.TextureLoader();
  const brickTextures = {
    baseColor: textureLoader.load(
      "/textures/brick/BrickWall04_1K_BaseColor.png"
    ),
    height: textureLoader.load("/textures/brick/BrickWall04_1K_Height.png"),
    normal: textureLoader.load("/textures/brick/BrickWall04_1K_Normal.png"),
    roughness: textureLoader.load(
      "/textures/brick/BrickWall04_1K_Roughness.png"
    ),
  };

  const tileTextures = {
    baseColor: textureLoader.load(
      "/textures/tile/BrushedMetalTiles02_1K_BaseColor.png"
    ),
    height: textureLoader.load(
      "/textures/tile/BrushedMetalTiles02_1K_Height.png"
    ),
    normal: textureLoader.load(
      "/textures/tile/BrushedMetalTiles02_1K_Normal.png"
    ),
    roughness: textureLoader.load(
      "/textures/tile/BrushedMetalTiles02_1K_Roughness.png"
    ),
  };

  const groupZeroMaterial = createTextureMaterial("#0080ff", brickTextures);
  const groupOneMaterial = createTextureMaterial("#ff0000", brickTextures);
  const supportVectorMaterial = createTextureMaterial("#ffff00", brickTextures);

  // Render SVM data points
  modelData.points.forEach((point) => {
    const material = point.isSV
      ? supportVectorMaterial
      : point.group === 0
      ? groupZeroMaterial
      : groupOneMaterial;
    const sphere = new THREE.Mesh(sphereGeometry, material);
    sphere.position.set(
      point.x * 3,
      point.y * 3,
      Math.random() * 15 * (Math.round(Math.random()) ? 1 : -1)
    );
    sphere.castShadow = true;
    sphere.receiveShadow = true;
    scene.add(sphere);
  });

  // Function to add margin planes
  function addMarginPlane(points, color) {
    const [firstPoint, secondPoint] = points;
    const start = new THREE.Vector3(firstPoint.x1 * 3, firstPoint.y1 * 3, 0);
    const end = new THREE.Vector3(firstPoint.x2 * 3, firstPoint.y2 * 3, 0);
    const midpoint = new THREE.Vector3()
      .addVectors(start, end)
      .multiplyScalar(0.5);
    const direction = new THREE.Vector3().subVectors(end, start).normalize();
    const normal = new THREE.Vector3(-direction.y, direction.x, 0);
    const planeGeometry = new THREE.BoxGeometry(30, 30, 0.1);

    planeGeometry.lookAt(normal);
    planeGeometry.translate(midpoint.x, midpoint.y, midpoint.z);

    const planeMaterial = createTextureMaterial(color, tileTextures);

    const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
    // planeMesh.receiveShadow = true;
    scene.add(planeMesh);
    return planeMesh;
  }

  // Add all planes for SVM margins
  const hard_margin = addMarginPlane(modelData.hard_Bdy, 0xff0000); // Hard margin
  const upper_margin = addMarginPlane(modelData.upper_soft_Bdy, 0xffff00); // Upper soft margin
  const lower_margin = addMarginPlane(modelData.lower_soft_Bdy, 0xffff00); // Lower soft margin

  const axesHelper = new THREE.AxesHelper(20);
  scene.add(axesHelper);
}

export async function initSVMScene(
  renderer,
  controls,
  camera,
  audioLoader,
  sound,
  gui
) {
  const properties = {
    name: "Support Vector Machine",
    description: "Visualization of the Support Vector Machine algorithm.",
  };
  const scene = new THREE.Scene();
  // Load an HDR environment map
  const loader = new RGBELoader();
  loader.load("/textures/svm_background.hdr", (texture) => {
    texture.encoding = THREE.RGBEEncoding;
    scene.environment = texture;
    scene.background = texture;
  });
  camera.position.set(15, 20, 30);
  camera.lookAt(scene.position);
  const modelData = await fetchSVMModel();
  visualizeSVMModel(scene, modelData);

  function animate() {
    renderer.shadowMap.enabled = true;
    renderer.render(scene, camera);
  }

  return { properties, scene, animate };
}
