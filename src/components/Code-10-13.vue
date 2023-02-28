<script setup>
import { onMounted } from "vue";
import * as THREE from "three";
import { TrackballControls } from "three/addons/controls/TrackballControls.js";
import Stats from "three/addons/libs/stats.module.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { initRenderer, initCameraPos, initTrackballControls, addLargeGroundPlane, initDefaultLighting } from "./utils.js";
import { addGeometry } from "./util-10.js";

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
  groundPlane.receiveShadow = true;
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

  let canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  document.getElementById("canvas-output").appendChild(canvas);
  let ctx = canvas.getContext("2d");
  let date = new Date();
  let pn = new Perlin("rnd" + date.getTime());
  fillWithPerlin(pn, ctx);

  document.getElementById("canvas-output").appendChild(canvas);
  const cube = new THREE.BoxGeometry(23, 10, 16);
  const cubeMaterial = new THREE.MeshStandardMaterial({
    bumpMap: new THREE.Texture(canvas),
    metalness: 0,
    roughness: 1,
    color: 0xffffff,
    bumpScale: 3,
    map: textureLoader.load("../../public/textures/general/wood-2.jpg"),
  });
  sphereMesh = new THREE.Mesh(cube, cubeMaterial);
  sphereMesh.castShadow = true;
  scene.add(sphereMesh);
  sphereMesh.material.bumpMap.needsUpdate = true;
}

function setupControls() {
  params = {};

  gui = new GUI();

  return params;
}

function fillWithPerlin(perlin, ctx) {
  for (let x = 0; x < 300; x++) {
    for (let y = 0; y < 300; y++) {
      let base = new THREE.Color(0xffffff);
      let value = perlin.noise(x / 10, y / 10, 0);
      base.multiplyScalar(value);
      ctx.fillStyle = "#" + base.getHexString();
      ctx.fillRect(x, y, 1, 1);
    }
  }
}

onMounted(() => {
  init();
  render();
});
</script>

<template>
  <div id="container"></div>

  <div class="fs-container">
    <div id="canvas-output" style="float: left"></div>
  </div>
</template>

<style scoped>
.fs-container {
  width: 256px;
  height: 256px;
  margin: auto;
  bottom: 0px;
  position: absolute;
}

#canvas-output {
  width: 256px;
  height: 256px;
}
</style>
