<script setup>
import { onMounted } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import Stats from "three/addons/libs/stats.module.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";

let container, stats;
let camera, controls, scene, renderer;
let cube;

function init() {
  container = document.getElementById("container");
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 500);
  camera.position.z = 5;
  camera.lookAt(scene.position);

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  // controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.addEventListener("change", render);
  controls.minDistance = 5;
  controls.maxDistance = 100;
  controls.enablePan = false;

  // stats
  stats = new Stats();
  container.appendChild(stats.dom);

  // cube
  newCube();

  window.addEventListener("resize", onWindowResize, false);
}

function render() {
  // controls.update(clock.getDelta());
  renderer.render(scene, camera);
}

function animate() {
  requestAnimationFrame(animate);

  // animation
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;

  render();
  stats.update();
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// cube
function newCube() {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  cube = new THREE.Mesh(geometry, material);
  scene.add(cube);
}

onMounted(() => {
  init();
  render();
  animate();
});
</script>

<template>
  <div id="container"></div>
</template>

<style></style>
