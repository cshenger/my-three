<script setup>
import { onMounted } from "vue";
import * as THREE from "three";
import { TrackballControls } from "three/addons/controls/TrackballControls.js";
import Stats from "three/addons/libs/stats.module.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { initRenderer, initCameraPos, initTrackballControls, addLargeGroundPlane, initDefaultLighting } from "./utils.js";
import { addGeometryWithMaterial } from "./util-10.js";

let container, camera, scene, renderer, stats, trackballControls, clock, groundPlane, params, operations, gui;
let sphere;

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
  scene.add(new THREE.AmbientLight(0x050505));
  initDefaultLighting(scene);

  // create the ground plane
  // groundPlane = addLargeGroundPlane(scene, true);
  // groundPlane.position.y = -10;
  // scene.add(groundPlane);

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
  sphere.rotation.y += 0.01;
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

  const material = new THREE.MeshPhongMaterial({
    map: textureLoader.load("../../public/textures/earth/Earth.png"),
    normalMap: textureLoader.load("../../public/textures/earth/EarthNormal.png"),
    specularMap: textureLoader.load("../../public/textures/earth/EarthSpec.png"),
    normalScale: new THREE.Vector2(6, 6),
  });

  const sphereGeo = new THREE.SphereGeometry(9, 50, 50);
  sphere = addGeometryWithMaterial(scene, sphereGeo, "sphere", gui, params, material.clone());
  sphere.rotation.y = (1 / 6) * Math.PI;
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
