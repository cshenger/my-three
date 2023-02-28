<script setup>
import { onMounted } from "vue";
import * as THREE from "three";
import { FirstPersonControls } from "three/addons/controls/FirstPersonControls.js";
import Stats from "three/addons/libs/stats.module.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { initRenderer } from "./utils.js";

let container, camera, scene, renderer, stats, controls, clock, plane, params, operations;

function init() {
  container = document.getElementById("container");
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x000000, 0.0035);

  //创建相机对象
  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 10000);
  camera.position.set(-200, 25, 0);
  renderer = initRenderer(container);

  // controls
  controls = new FirstPersonControls(camera, renderer.domElement);
  controls.movementSpeed = 70;
  controls.lookSpeed = 0.15;
  controls.noFly = true;
  controls.lookVertical = false;

  // stats
  stats = new Stats();
  container.appendChild(stats.dom);
  // AxisHelper
  // const axesHelper = new THREE.AxesHelper(100);
  // scene.add(axesHelper);

  // add subtle ambient lighting
  const ambientLight = new THREE.AmbientLight(0x0c0c0c);
  scene.add(ambientLight);

  // add spotlight for the shadows
  const spotLight = new THREE.SpotLight(0xffffff);
  spotLight.position.set(-40, 60, -10);
  spotLight.castShadow = true;
  scene.add(spotLight);

  clock = new THREE.Clock();

  // createCorps
  createCorps();

  window.addEventListener("resize", onWindowResize, false);
}

function render() {
  stats.update();

  animate();
  // render using requestAnimationFrame
  requestAnimationFrame(render);
  renderer.render(scene, camera);
}

function animate() {
  let delta = clock.getDelta();
  let time = clock.getElapsedTime() * 5;
  controls.update(delta);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// createCorps
function createCorps() {
  setupControls();

  let cube = new THREE.BoxGeometry(40, 40, 40);
  const textureLoader = new THREE.TextureLoader();

  const material_1 = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    map: textureLoader.load("../../public/textures/animals/cow.png"),
  });
  const material_2 = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    map: textureLoader.load("../../public/textures/animals/dog.jpg"),
  });
  const material_3 = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    map: textureLoader.load("../../public/textures/animals/cat.jpg"),
  });

  // sound spheres
  const mesh1 = new THREE.Mesh(cube, material_1);
  mesh1.position.set(0, 20, 100);
  const mesh2 = new THREE.Mesh(cube, material_2);
  mesh2.position.set(0, 20, 0);
  const mesh3 = new THREE.Mesh(cube, material_3);
  mesh3.position.set(0, 20, -100);

  scene.add(mesh1);
  scene.add(mesh2);
  scene.add(mesh3);

  const listener = new THREE.AudioListener();
  camera.add(listener);

  const posSound1 = new THREE.PositionalAudio(listener);
  const posSound2 = new THREE.PositionalAudio(listener);
  const posSound3 = new THREE.PositionalAudio(listener);
  const audioLoader = new THREE.AudioLoader();

  audioLoader.load("../../public/audio/cow.ogg", function (buffer) {
    posSound1.setBuffer(buffer);
    posSound1.setRefDistance(30);
    posSound1.play();
    posSound1.setRolloffFactor(10);
    posSound1.setLoop(true);
  });

  audioLoader.load("../../public/audio/dog.ogg", function (buffer) {
    posSound2.setBuffer(buffer);
    posSound2.setRefDistance(30);
    posSound2.play();
    posSound2.setRolloffFactor(10);
    posSound2.setLoop(true);
  });

  audioLoader.load("../../public/audio/cat.ogg", function (buffer) {
    posSound3.setBuffer(buffer);
    posSound3.setRefDistance(30);
    posSound3.play();
    posSound3.setRolloffFactor(10);
    posSound3.setLoop(true);
  });

  mesh1.add(posSound1);
  mesh2.add(posSound2);
  mesh3.add(posSound3);

  // ground
  const helper = new THREE.GridHelper(500, 10);
  helper.position.y = 0.1;
  scene.add(helper);
}

function setupControls() {
  params = new (function () {})();

  const gui = new GUI();

  return params;
}

onMounted(() => {
  init();
  render();
});
</script>

<template>
  <div id="container"></div>
</template>

<style></style>
