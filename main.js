import { initDBSCANScene } from './src/scenes/dbscan.js';
import { initSVMScene } from './src/scenes/svm.js';
import { initKMeansScene } from './src/scenes/kmeans.js';
import { initKNNScene } from './src/scenes/knn.js';
import { initDecisionTreeScene } from './src/scenes/decisiontree.js';

import * as THREE from 'three';

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

let currentAnimation;

function switchScene(initSceneFunc) {
    if (currentAnimation) {
        cancelAnimationFrame(currentAnimation); // Stop the current animation
    }
    renderer.clear(); // Clear the current scene

    const { properties, scene, camera, animate } = initSceneFunc();

    document.getElementById('algorithm-name').textContent = properties.name;

    currentAnimation = requestAnimationFrame(function animateScene() {
        animate(renderer);
        currentAnimation = requestAnimationFrame(animateScene);
        renderer.render(scene, camera);
    });
}

document.getElementById('algorithmSelector').addEventListener('change', (event) => {
    switch (event.target.value) {
        case 'dbscan':
            switchScene(initDBSCANScene);
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
switchScene(initDBSCANScene);

