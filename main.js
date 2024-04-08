import { initAPScene } from './src/scenes/aprop.js';
import { initSVMScene } from './src/scenes/svm.js';
import { initKMeansScene } from './src/scenes/kmeans.js';
import { initKNNScene } from './src/scenes/knn.js';
import { initDecisionTreeScene } from './src/scenes/decisiontree.js';

import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/Addons.js";

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

let currentAnimation;

async function switchScene(initSceneFunc) {
    if (currentAnimation) {
        cancelAnimationFrame(currentAnimation); // Stop the current animation
    }
    renderer.clear(); // Clear the current scene

    const { properties, scene, camera, animate } = await initSceneFunc();

    // Add orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;

    // Add a light
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(1, 1, 1).normalize();
    scene.add(light);

    // Add a light
    const light2 = new THREE.DirectionalLight(0xffffff, 1);
    light2.position.set(-1, -1, -1).normalize();
    scene.add(light2);

    // Add a light
    const light3 = new THREE.DirectionalLight(0xffffff, 1);
    light3.position.set(1, -1, 1).normalize();
    scene.add(light3);


    console.log(properties)
    document.getElementById('algorithm-name').textContent = properties.name;

    currentAnimation = requestAnimationFrame(function animateScene() {
        animate(renderer);
        currentAnimation = requestAnimationFrame(animateScene);
        renderer.render(scene, camera);

        controls.update();
    });
}

document.getElementById('algorithmSelector').addEventListener('change', (event) => {
    switch (event.target.value) {
        case 'aprop':
            switchScene(initAPScene);
            break;
        case 'svm':
            switchScene(initSVMScene);
            break;
        case 'kmeans':
			switchScene(initKMeansScene);
			break;
		case 'knn':
			switchScene(initKNNScene);
			break;
		case 'decisiontree':
			switchScene(initDecisionTreeScene);
			break;
    }
});

// Initialize with the first scene
switchScene(initAPScene);

