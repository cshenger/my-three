<script setup>
import { onMounted } from "vue";
import * as THREE from "three";
import { TrackballControls } from "three/addons/controls/TrackballControls.js";
import Stats from "three/addons/libs/stats.module.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { initRenderer, initCameraPos, initTrackballControls, addLargeGroundPlane, initDefaultLighting } from "./utils.js";
import { addGeometry } from "./util-10.js";

let container, camera, scene, renderer, stats, trackballControls, clock, groundPlane, params, operations, gui;
let polyhedronMesh, sphereMesh, cubeMesh;

function init() {
  container = document.getElementById("container");
  scene = new THREE.Scene();

  //创建相机对象
  camera = initCameraPos(new THREE.Vector3(0, 20, 40));
  renderer = initRenderer(container);

  // controls
  trackballControls = initTrackballControls(camera, renderer, TrackballControls);
  // stats
  stats = new Stats();
  container.appendChild(stats.dom);
  // AxisHelper
  // const axesHelper = new THREE.AxesHelper(100);
  // scene.add(axesHelper);

  // light
  scene.add(new THREE.AmbientLight(0x444444));
  initDefaultLighting(scene);

  // create the ground plane
  groundPlane = addLargeGroundPlane(scene);
  groundPlane.position.y = -10;
  scene.add(groundPlane);

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
  trackballControls.update(clock.getDelta());
  polyhedronMesh.rotation.x += 0.01;
  sphereMesh.rotation.y += 0.01;
  cubeMesh.rotation.z += 0.01;
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// createCorps
function createCorps() {
  setupControls();
  const textureLoader = new THREE.TextureLoader();

  const polyhedron = new THREE.IcosahedronGeometry(8, 0);
  polyhedronMesh = addGeometry(scene, polyhedron, "polyhedron", textureLoader.load("../../public/textures/general/metal-rust.jpg"), gui, params);
  polyhedronMesh.position.x = 20;

  const sphere = new THREE.SphereGeometry(5, 20, 20);
  sphereMesh = addGeometry(scene, sphere, "sphere", textureLoader.load("../../public/textures/general/floor-wood.jpg"), gui, params);

  const cube = new THREE.BoxGeometry(10, 10, 10);
  cubeMesh = addGeometry(scene, cube, "cube", textureLoader.load("../../public/textures/general/brick-wall.jpg"), gui, params);
  cubeMesh.position.x = -20;
}

function setupControls() {
  params = {};

  gui = new GUI();

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
