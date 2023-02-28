<script setup>
import { onMounted } from "vue";
import * as THREE from "three";
import { TrackballControls } from "three/addons/controls/TrackballControls.js";
import Stats from "three/addons/libs/stats.module.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { initRenderer, initCameraPos, initTrackballControls, addLargeGroundPlane, initDefaultLighting } from "./utils.js";
import { addGeometryWithMaterial } from "./util-10.js";

let container, camera, scene, renderer, stats, trackballControls, clock, groundPlane, params, operations, gui;

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
  groundPlane = addLargeGroundPlane(scene, true);
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

  const alphaTexture = textureLoader.load("../../public/textures/alpha/partial-transparency.png");
  const material = new THREE.MeshStandardMaterial({
    alphaMap: alphaTexture,
    side: THREE.DoubleSide, // 可以透过球看到另一面
    metalness: 0.02,
    roughness: 0.07,
    color: 0xffffff,
    alphaTest: 0.5,
  });
  material.alphaMap.wrapS = THREE.RepeatWrapping;
  material.alphaMap.wrapT = THREE.RepeatWrapping;
  material.alphaMap.repeat.set(8, 8);

  const sphereGeometry = new THREE.SphereGeometry(20, 100, 100);
  const sphere = new THREE.Mesh(sphereGeometry, material);
  sphere.position.y = 10;
  scene.add(sphere);
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
