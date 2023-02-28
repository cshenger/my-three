<script setup>
import { onMounted } from "vue";
import * as THREE from "three";
import { OrbitControls } from "THREE/addons/controls/OrbitControls.js";
import Stats from "THREE/addons/libs/stats.module.js";
import { GUI } from "THREE/addons/libs/lil-gui.module.min.js";
import { initRenderer, addHouseAndTree } from "./utils.js";

let container, camera, scene, renderer, stats, controls, clock;
let params, ambientLight, spotLight;

function init() {
  container = document.getElementById("container");
  scene = new THREE.Scene();

  //创建相机对象
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
  camera.position.x = -20;
  camera.position.y = 25;
  camera.position.z = 100;
  camera.lookAt(scene.position); //设置相机方向(指向的场景对象)

  renderer = initRenderer(container);

  // controls
  controls = new OrbitControls(camera, renderer.domElement);
  // controls.addEventListener("change", render);
  controls.minDistance = 10;
  controls.maxDistance = 500;
  controls.enablePan = false;

  // stats
  stats = new Stats();
  container.appendChild(stats.dom);

  // AxisHelper
  const axesHelper = new THREE.AxesHelper(100);
  scene.add(axesHelper);

  // // create the ground plane
  // const planeGeometry = new THREE.PlaneGeometry(60, 40, 1, 1);
  // const planeMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
  // const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  // plane.receiveShadow = true;
  // // rotate and position the plane
  // plane.rotation.x = -0.5 * Math.PI;
  // plane.position.x = 0;
  // plane.position.y = 0;
  // plane.position.z = 0;
  // // add the plane to the scene
  // scene.add(plane);

  // add subtle ambient lighting
  ambientLight = new THREE.AmbientLight("#606008", 1);
  scene.add(ambientLight);

  // add spotlight for the shadows
  spotLight = new THREE.SpotLight(0xffffff, 1, 180, Math.PI / 4);
  spotLight.position.set(-30, 40, -10);
  spotLight.castShadow = true;
  spotLight.shadow.mapSize.set(2048, 2048);
  scene.add(spotLight);
  // spotLight.lookAt(mesh);

  // createCorps
  createCorps();

  window.addEventListener("resize", onWindowResize, false);
}

function render() {
  // controls.update(clock.getDelta());
  renderer.render(scene, camera);
}

function animate() {
  requestAnimationFrame(animate);

  render();
  stats.update();
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// createCorps
function createCorps() {
  addHouseAndTree(scene);

  params = new (function () {
    this.intensity = ambientLight.intensity;
    this.ambientColor = ambientLight.color.getStyle();
    this.disableSpotlight = false;
  })();

  const gui = new GUI();
  gui.add(params, "intensity", 0, 3, 0.1).onChange(function (e) {
    ambientLight.color = new THREE.Color(params.ambientColor);
    ambientLight.intensity = params.intensity;
  });
  gui.addColor(params, "ambientColor").onChange(function (e) {
    ambientLight.color = new THREE.Color(params.ambientColor);
    ambientLight.intensity = params.intensity;
  });
  gui.add(params, "disableSpotlight").onChange(function (e) {
    spotLight.visible = !e;
  });
}

onMounted(() => {
  init();
  render();
  animate();
});
</script>

<template>
  <div id="container"></div>
</template>

<style></style>
