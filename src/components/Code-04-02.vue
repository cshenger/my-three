<script setup>
import { onMounted } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import Stats from "three/addons/libs/stats.module.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { initRenderer, initCamera, initControls, addGroundPlane } from "./utils.js";

let container, camera, scene, renderer, stats, controls, clock, plane, params, operations;
let group,
  mats = [],
  step = 0;

function init() {
  container = document.getElementById("container");
  scene = new THREE.Scene();

  //创建相机对象
  camera = initCamera(scene);
  renderer = initRenderer(container);

  // controls
  controls = initControls(camera, renderer, OrbitControls);
  // stats
  stats = new Stats();
  container.appendChild(stats.dom);
  // AxisHelper
  const axesHelper = new THREE.AxesHelper(100);
  scene.add(axesHelper);

  // add subtle ambient lighting
  // const ambientLight = new THREE.AmbientLight(0x0c0c0c);
  // scene.add(ambientLight);

  // add spotlight for the shadows
  const spotLight = new THREE.SpotLight(0xffffff);
  spotLight.position.set(-40, 60, -10);
  spotLight.castShadow = true;
  scene.add(spotLight);

  // create the ground plane
  // plane = addGroundPlane(scene);
  // scene.add(plane);

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
  group.rotation.y = step += params.rotationSpeed;
  group.rotation.z = step -= params.rotationSpeed;
  group.rotation.x = step += params.rotationSpeed;
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// createCorps
function createCorps() {
  group = new THREE.Mesh();
  mats = [];

  mats.push(new THREE.MeshBasicMaterial({ color: 0x009e60 }));
  mats.push(new THREE.MeshBasicMaterial({ color: 0x0051ba }));
  mats.push(new THREE.MeshBasicMaterial({ color: 0xffd500 }));
  mats.push(new THREE.MeshBasicMaterial({ color: 0xff5800 }));
  mats.push(new THREE.MeshBasicMaterial({ color: 0xc41e3a }));
  mats.push(new THREE.MeshBasicMaterial({ color: 0xffffff }));

  for (let x = 0; x < 3; x++) {
    for (let y = 0; y < 3; y++) {
      for (let z = 0; z < 3; z++) {
        let cubeGeom = new THREE.BoxGeometry(2.9, 2.9, 2.9);
        let cube = new THREE.Mesh(cubeGeom, mats);
        cube.position.set(x * 3 - 3, y * 3 - 3, z * 3 - 3);
        group.add(cube);
      }
    }
  }

  group.scale.copy(new THREE.Vector3(2, 2, 2));
  scene.add(group);

  setupControls();
}

function setupControls() {
  params = new (function () {
    this.rotationSpeed = 0.01;
    this.numberOfObjects = scene.children.length;
  })();

  const gui = new GUI();
  gui.add(params, "rotationSpeed", 0, 0.5);

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
