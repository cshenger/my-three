<script setup>
import { onMounted } from "vue";
import * as THREE from "three";
import { TrackballControls } from "three/addons/controls/TrackballControls.js";
import Stats from "three/addons/libs/stats.module.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { initRenderer, initCameraPos, initTrackballControls, addLargeGroundPlane, initDefaultLighting } from "./utils.js";
import { addGeometryWithMaterial } from "./util-10.js";

let container, camera, scene, renderer, stats, trackballControls, clock, groundPlane, params, operations, gui;
let pointLight, sphereLightMesh;
let invert = 1;
let phase = 0;
let pivot = 0;

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
  scene.add(new THREE.AmbientLight(0x888888));
  initDefaultLighting(scene);
  pointLight = new THREE.PointLight("#ffffff");
  scene.add(pointLight);
  const sphereLight = new THREE.SphereGeometry(0.2);
  const sphereLightMaterial = new THREE.MeshStandardMaterial({ color: 0xff5808 });
  sphereLightMesh = new THREE.Mesh(sphereLight, sphereLightMaterial);
  scene.add(sphereLightMesh);

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

  if (phase > 2 * Math.PI) {
    invert = invert * -1;
    phase -= 2 * Math.PI;
  } else {
    phase += 0.02;
  }

  sphereLightMesh.position.z = +(21 * Math.sin(phase));
  sphereLightMesh.position.x = -14 + 14 * Math.cos(phase);
  sphereLightMesh.position.y = 5;

  if (invert < 0) {
    pivot = 0;
    sphereLightMesh.position.x = invert * (sphereLightMesh.position.x - pivot) + pivot;
  }
  pointLight.position.copy(sphereLightMesh.position);
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

  const urls = ["../../public/textures/cubemap/car/right.png", "../../public/textures/cubemap/car/left.png", "../../public/textures/cubemap/car/top.png", "../../public/textures/cubemap/car/top.png", "../../public/textures/cubemap/car/front.png", "../../public/textures/cubemap/car/back.png"];
  // 定顺序: pos-x, neg-x, pos-y, neg-y, pos-z, neg-z.
  const cuberLoader = new THREE.CubeTextureLoader();
  scene.background = cuberLoader.load(urls);

  const alternativeMap = textureLoader.load("../../public/textures/cubemap/2294472375_24a3b8ef46_o.jpg");
  alternativeMap.mapping = THREE.EquirectangularReflectionMapping;
  alternativeMap.magFilter = THREE.LinearFilter;
  alternativeMap.minFilter = THREE.LinearMipMapLinearFilter;
  scene.background = alternativeMap;

  const sphere = new THREE.SphereGeometry(8, 50, 50);
  const cubeMaterial = new THREE.MeshStandardMaterial({
    // envMap: scene.background,
    envMap: alternativeMap,
    color: 0xffffff,
    metalness: 1,
    roughness: 0.5,
  });

  const cubeMaterialWithMetalMap = cubeMaterial.clone();
  cubeMaterialWithMetalMap.metalnessMap = textureLoader.load("../../public/textures/engraved/roughness-map.jpg");

  const cubeMaterialWithRoughnessMap = cubeMaterial.clone();
  cubeMaterialWithRoughnessMap.roughnessMap = textureLoader.load("../../public/textures/engraved/roughness-map.jpg");

  const cube1 = addGeometryWithMaterial(scene, sphere, "metal", gui, params, cubeMaterialWithMetalMap);
  cube1.position.x = -10;
  cube1.rotation.y = (1 / 3) * Math.PI;

  const cube2 = addGeometryWithMaterial(scene, sphere, "rough", gui, params, cubeMaterialWithRoughnessMap);
  cube2.position.x = 10;
  cube2.rotation.y = (-1 / 3) * Math.PI;
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
