<script setup>
import { onMounted } from "vue";
import * as THREE from "three";
import { TrackballControls } from "three/addons/controls/TrackballControls.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import Stats from "three/addons/libs/stats.module.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { initRenderer, initCameraPos, initTrackballControls, initControls, addLargeGroundPlane, initDefaultLighting } from "./utils.js";
import { addGeometryWithMaterial } from "./util-10.js";

let container, camera, scene, renderer, stats, controls, trackballControls, clock, groundPlane, params, operations, gui;
let cube, sphere;

function init() {
  container = document.getElementById("container");
  scene = new THREE.Scene();

  //创建相机对象
  camera = initCameraPos(new THREE.Vector3(0, 20, 40));
  renderer = initRenderer(container);

  // controls
  // trackballControls = initTrackballControls(camera, renderer, TrackballControls);
  controls = initControls(camera, renderer, OrbitControls);
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
  // trackballControls.update(clock.getDelta());
  cube.rotation.y += 0.01;
  sphere.rotation.y -= 0.01;
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

  const urls = ["../../public/textures/cubemap/flowers/right.png", "../../public/textures/cubemap/flowers/left.png", "../../public/textures/cubemap/flowers/top.png", "../../public/textures/cubemap/flowers/bottom.png", "../../public/textures/cubemap/flowers/front.png", "../../public/textures/cubemap/flowers/back.png"];
  const cubeLoader = new THREE.CubeTextureLoader();
  scene.background = cubeLoader.load(urls);

  const cubeMaterial = new THREE.MeshStandardMaterial({
    envMap: scene.background,
    color: 0xffffff,
    metalness: 1,
    roughness: 0,
  });

  const sphereMaterial = cubeMaterial.clone();
  sphereMaterial.normalMap = textureLoader.load("../../public/textures/engraved/Engraved_Metal_003_NORM.jpg");
  sphereMaterial.aoMap = textureLoader.load("../../public/textures/engraved/Engraved_Metal_003_OCC.jpg");
  sphereMaterial.shininessMap = textureLoader.load("../../public/textures/engraved/Engraved_Metal_003_ROUGH.jpg");

  const cubeGeo = new THREE.BoxGeometry(16, 12, 12);
  cube = addGeometryWithMaterial(scene, cubeGeo, "cube", gui, params, cubeMaterial);
  cube.position.x = -15;
  cube.rotation.y = (-1 / 3) * Math.PI;

  const sphereGeo = new THREE.SphereGeometry(10, 50, 50);
  sphere = addGeometryWithMaterial(scene, sphereGeo, "sphere", gui, params, sphereMaterial);
  sphere.position.x = 15;

  gui.add({ refraction: false }, "refraction").onChange(function (e) {
    if (e) {
      scene.background.mapping = THREE.CubeRefractionMapping;
    } else {
      scene.background.mapping = THREE.CubeReflectionMapping;
    }
    cube.material.needsUpdate = true;
    sphere.material.needsUpdate = true;
  });
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
