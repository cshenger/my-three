<script setup>
import { onMounted } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import Stats from "three/addons/libs/stats.module.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { initRenderer, initCameraPos, initControls, addGroundPlane } from "./utils.js";

let container, camera, scene, renderer, stats, controls, clock, plane, params;
let step = 0;

function init() {
  container = document.getElementById("container");
  scene = new THREE.Scene();

  //创建相机对象
  camera = initCameraPos(new THREE.Vector3(50, 50, 50));
  camera.lookAt(scene.position);
  // clock = new THREE.Clock();
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
  const ambientLight = new THREE.AmbientLight(0x343434);
  scene.add(ambientLight);

  // add spotlight for the shadows
  const spotLight = new THREE.SpotLight(0xffffff);
  spotLight.position.set(-10, 30, 40);
  spotLight.castShadow = true;
  scene.add(spotLight);

  const keyLight = new THREE.SpotLight(0xffffff);
  keyLight.position.set(-10, 80, 80);
  keyLight.intensity = 2;
  keyLight.lookAt(new THREE.Vector3(0, 15, 0));
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.height = 4096;
  keyLight.shadow.mapSize.width = 4096;
  scene.add(keyLight);

  const backlight1 = new THREE.SpotLight(0xaaaaaa);
  backlight1.position.set(150, 40, -20);
  backlight1.intensity = 0.5;
  backlight1.lookAt(new THREE.Vector3(0, 15, 0));
  scene.add(backlight1);

  const backlight2 = new THREE.SpotLight(0xaaaaaa);
  backlight2.position.set(-150, 40, -20);
  backlight2.intensity = 0.5;
  backlight2.lookAt(new THREE.Vector3(0, 15, 0));
  scene.add(backlight2);

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

function animate() {}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// createCorps
function createCorps() {
  camera.lookAt(new THREE.Vector3(0, 15, 0));
  const mtlLoader = new MTLLoader();
  mtlLoader.setPath("../../public/models/butterfly/");
  mtlLoader.load("butterfly.mtl", (material) => {
    const loader = new OBJLoader();
    loader.setMaterials(material);
    loader.load("../../public/models/butterfly/butterfly.obj", (object) => {
      // move wings to more horizontal position
      [0, 2, 4, 6].forEach(function (i) {
        object.children[i].rotation.z = 0.3 * Math.PI;
      });

      [1, 3, 5, 7].forEach(function (i) {
        object.children[i].rotation.z = -0.3 * Math.PI;
      });

      // configure the wings,
      let wing2 = object.children[5];
      let wing1 = object.children[4];

      wing1.material.opacity = 0.9;
      wing1.material.transparent = true;
      wing1.material.depthTest = false;
      wing1.material.side = THREE.DoubleSide;

      wing2.material.opacity = 0.9;
      wing2.material.transparent = true;
      wing2.material.depthTest = false;
      wing2.material.side = THREE.DoubleSide;

      object.scale.set(100, 100, 100);
      object.rotation.x = 0.2;
      object.rotation.y = -1.3;

      scene.add(object);
    });
  });

  setupControls();
}

function setupControls() {
  const gui = new GUI();

  // params.redraw();

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
