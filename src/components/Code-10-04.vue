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
  scene.add(new THREE.AmbientLight(0x444444));
  initDefaultLighting(scene);
  pointLight = new THREE.PointLight("#ff5808");
  scene.add(pointLight);
  const sphereLight = new THREE.SphereGeometry(0.2);
  const sphereLightMaterial = new THREE.MeshStandardMaterial({ color: 0xff5808 });
  sphereLightMesh = new THREE.Mesh(sphereLight, sphereLightMaterial);
  scene.add(sphereLightMesh);

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

  const cube = new THREE.BoxGeometry(16, 16, 16);
  const cubeMaterial = new THREE.MeshStandardMaterial({
    map: textureLoader.load("../../public/textures/general/plaster.jpg"),
    metalness: 0.2,
    roughness: 0.07,
  });

  const cubeMaterialWithNormalMap = cubeMaterial.clone();
  cubeMaterialWithNormalMap.normalMap = textureLoader.load("../../public/textures/general/plaster-normal.jpg");

  const cube1 = addGeometryWithMaterial(scene, cube, "cube-1", gui, params, cubeMaterial);
  cube1.position.x = -17;
  cube1.rotation.y = (1 / 3) * Math.PI;

  const cube2 = addGeometryWithMaterial(scene, cube, "cube-2", gui, params, cubeMaterialWithNormalMap);
  cube2.position.x = 17;
  cube2.rotation.y = (-1 / 3) * Math.PI;

  gui.add(params, "normalScaleX", -3, 3, 0.001).onChange(function (e) {
    cubeMaterialWithNormalMap.normalScale.set(params.normalScaleX, params.normalScaleY);
  });
  gui.add(params, "normalScaleY", -3, 3, 0.001).onChange(function (e) {
    cubeMaterialWithNormalMap.normalScale.set(params.normalScaleX, params.normalScaleY);
  });
}

function setupControls() {
  params = {
    normalScaleX: 1,
    normalScaleY: 1,
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
