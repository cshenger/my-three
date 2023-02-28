<script setup>
import { onMounted } from "vue";
import * as THREE from "three";
import { TrackballControls } from "three/addons/controls/TrackballControls.js";
import Stats from "three/addons/libs/stats.module.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { initRenderer, initCameraPos, initTrackballControls, addLargeGroundPlane, initDefaultLighting } from "./utils.js";
import { addGeometryWithMaterial } from "./util-10.js";

let container, camera, scene, renderer, stats, trackballControls, clock, groundPlane, params, operations, gui;
let sphereMesh;

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
  sphereMesh.rotation.y += 0.01;
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

  const sphere = new THREE.SphereGeometry(8, 180, 180);
  const sphereMaterial = new THREE.MeshStandardMaterial({
    map: textureLoader.load("../../public/textures/w_c.jpg"),
    displacementMap: textureLoader.load("../../public/textures/w_d.png"),
    metalness: 0.02,
    roughness: 0.07,
    color: 0xffffff,
  });

  groundPlane.receiveShadow = true;
  sphereMesh = new THREE.Mesh(sphere, sphereMaterial);
  sphereMesh.castShadow = true;
  scene.add(sphereMesh);

  gui.add(params, "displacementScale", -5, 5, 0.01).onChange(function (e) {
    sphereMaterial.displacementScale = e;
  });
  gui.add(params, "displacementBias", -5, 5, 0.01).onChange(function (e) {
    sphereMaterial.displacementBias = e;
  });
}

function setupControls() {
  params = {
    displacementScale: 1,
    displacementBias: 0,
  };

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
