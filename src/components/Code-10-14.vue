<script setup>
import { onMounted } from "vue";
import * as THREE from "three";
import { TrackballControls } from "three/addons/controls/TrackballControls.js";
import Stats from "three/addons/libs/stats.module.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { initRenderer, initCameraPos, initTrackballControls, addLargeGroundPlane, initDefaultLighting } from "./utils.js";
import { addGeometry } from "./util-10.js";

let container, camera, scene, renderer, stats, trackballControls, clock, groundPlane, params, operations, gui;
let polyhedronMesh, cubeMesh, sphereMesh;

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

  const video = document.createElement("video");
  video.src = "../../public/movies/Big_Buck_Bunny_small.ogv";
  video.autoplay = true;
  video.muted = true;
  video.loop = true;

  const texture = new THREE.VideoTexture(video);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.format = THREE.RGBAFormat;
  const material = new THREE.MeshLambertMaterial({
    map: texture,
  });

  const polyhedron = new THREE.IcosahedronGeometry(8, 0);
  polyhedronMesh = new THREE.Mesh(polyhedron, material);
  polyhedronMesh.castShadow = true;
  polyhedronMesh.position.x = 20;
  scene.add(polyhedronMesh);

  const sphere = new THREE.SphereGeometry(5, 20, 20);
  sphereMesh = new THREE.Mesh(sphere, material);
  sphereMesh.castShadow = true;
  scene.add(sphereMesh);

  const cube = new THREE.BoxGeometry(10, 10, 10);
  cubeMesh = new THREE.Mesh(cube, material);
  cubeMesh.castShadow = true;
  cubeMesh.position.x = -20;
  scene.add(cubeMesh);

  video.play();
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

  <!-- <video id="video" style="display: none; position: absolute; left: 15px; top: 75px" src="../../public/movies/Big_Buck_Bunny_small.ogv" controls="true" autoplay="true"></video> -->
</template>

<style></style>
