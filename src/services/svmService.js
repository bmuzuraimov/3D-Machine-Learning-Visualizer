import * as THREE from "three";

export async function fetchSVMModel() {
  try {
    const response = await fetch("/api/svm/model_data_3D_SVM.json");
    const modelData = await response.json();
    return modelData;
  } catch (error) {
    console.error("Failed to fetch SVM model data:", error);
  }
}

// Create a generic function to create materials
export function createTextureMaterial(color, texture) {
  return new THREE.MeshStandardMaterial({
    color,
    map: texture.baseColor,
    displacementMap: texture.height,
    displacementScale: 0.1,
    normalMap: texture.normal,
    roughnessMap: texture.roughness,
    metalness: 0.5,
    envMapIntensity: 1,
    fog: true,
  });
}
