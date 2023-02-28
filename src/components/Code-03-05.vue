<script setup>
import { onMounted } from "vue";
import * as THREE from "three";
import { OrbitControls } from "THREE/addons/controls/OrbitControls.js";
import { TrackballControls } from "three/addons/controls/TrackballControls.js";
import Stats from "THREE/addons/libs/stats.module.js";
import { GUI } from "THREE/addons/libs/lil-gui.module.min.js";
import { initRenderer, initCamera, initControls, initTrackballControls } from "./utils.js";

let container, camera, scene, renderer, stats, controls, clock, plane, params, operations, trackballControls;
let plane1, plane2, plane3, areaLight1, areaLight2, areaLight3;
let area1 = 0,
  area2 = 0,
  area3 = 0,
  vern1 = 1,
  vern2 = 1,
  vern3 = 1;

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

  // create the ground plane
  // plane = addGroundPlane(scene);

  trackballControls = initTrackballControls(camera, renderer, TrackballControls);
  clock = new THREE.Clock();

  // createCorps
  createCorps();

  window.addEventListener("resize", onWindowResize, false);
}

function render() {
  stats.update();
  trackballControls.update(clock.getDelta());

  animate();
  // render using requestAnimationFrame
  requestAnimationFrame(render);
  renderer.render(scene, camera);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  if (area1 <= 1) {
    vern1 = 1;
  } else if (area1 >= 300) {
    vern1 = -1.5;
  }
  area1 = area1 + vern1;

  if (area2 <= 1) {
    vern2 = 1.5;
  } else if (area2 >= 350) {
    vern2 = -1;
  }
  area2 = area2 + vern2;

  if (area3 <= 1) {
    vern3 = 1;
  } else if (area3 >= 400) {
    vern3 = -1;
  }
  area3 = area3 + vern3;

  scene.remove(areaLight1);
  areaLight1 = new THREE.RectAreaLight(0xff0000, area1, 4, 10);
  areaLight1.position.set(-10, 10, 35);
  scene.add(areaLight1);

  scene.remove(areaLight2);
  areaLight2 = new THREE.RectAreaLight(0x00ff00, area2, 4, 10);
  areaLight2.position.set(0, 10, 35);
  scene.add(areaLight2);

  scene.remove(areaLight3);
  areaLight3 = new THREE.RectAreaLight(0x0000ff, area3, 4, 10);
  areaLight3.position.set(10, 10, 35);
  scene.add(areaLight3);
}

// createCorps
function createCorps() {
  // create the ground plane
  const planeGeometry = new THREE.PlaneGeometry(70, 70, 1, 1);
  const planeMaterial = new THREE.MeshStandardMaterial({
    roughness: 0.044676705160855, // calculated from shininess = 1000
    metalness: 0.0,
  });
  plane = new THREE.Mesh(planeGeometry, planeMaterial);
  // plane.receiveShadow  = true;
  // rotate and position the plane
  plane.rotation.x = -0.5 * Math.PI;
  plane.position.x = 0;
  plane.position.y = 0;
  plane.position.z = 0;
  // add the plane to the scene
  scene.add(plane);

  const spotLight0 = new THREE.SpotLight(0xcccccc);
  spotLight0.position.set(-40, 60, -10);
  spotLight0.intensity = 0.1;
  spotLight0.lookAt(plane);
  scene.add(spotLight0);

  areaLight1 = new THREE.RectAreaLight(0xff0000, area1, 4, 10);
  areaLight1.position.set(-10, 10, 35);
  scene.add(areaLight1);

  areaLight2 = new THREE.RectAreaLight(0x00ff00, area2, 4, 10);
  areaLight2.position.set(0, 10, 35);
  scene.add(areaLight2);

  areaLight3 = new THREE.RectAreaLight(0x0000ff, area3, 4, 10);
  areaLight3.position.set(10, 10, 35);
  scene.add(areaLight3);

  const planeGeometry1 = new THREE.BoxGeometry(4, 10, 0);
  const planeGeometry1Mat = new THREE.MeshBasicMaterial({
    color: 0xff0000,
  });
  plane1 = new THREE.Mesh(planeGeometry1, planeGeometry1Mat);
  plane1.position.copy(areaLight1.position);
  scene.add(plane1);

  const planeGeometry2 = new THREE.BoxGeometry(4, 10, 0);
  const planeGeometry2Mat = new THREE.MeshBasicMaterial({
    color: 0x00ff00,
  });
  plane2 = new THREE.Mesh(planeGeometry2, planeGeometry2Mat);
  plane2.position.copy(areaLight2.position);
  scene.add(plane2);

  const planeGeometry3 = new THREE.BoxGeometry(4, 10, 0);
  const planeGeometry3Mat = new THREE.MeshBasicMaterial({
    color: 0x0000ff,
  });
  plane3 = new THREE.Mesh(planeGeometry3, planeGeometry3Mat);
  plane3.position.copy(areaLight3.position);
  scene.add(plane3);

  setupControls();
}

function setupControls() {
  params = new (function () {
    this.rotationSpeed = 0.02;
    this.color1 = 0xff0000;
    this.intensity1 = 500;
    this.color2 = 0x00ff00;
    this.intensity2 = 500;
    this.color3 = 0x0000ff;
    this.intensity3 = 500;
  })();

  const gui = new GUI();

  gui.addColor(params, "color1").onChange(function (e) {
    areaLight1.color = new THREE.Color(e);
    planeGeometry1Mat.color = new THREE.Color(e);
    scene.remove(plane1);
    plane1 = new THREE.Mesh(planeGeometry1, planeGeometry1Mat);
    plane1.position.copy(areaLight1.position);
    scene.add(plane1);
  });
  gui.add(params, "intensity1", 0, 1000).onChange(function (e) {
    areaLight1.intensity = e;
  });
  gui.addColor(params, "color2").onChange(function (e) {
    areaLight2.color = new THREE.Color(e);
    planeGeometry2Mat.color = new THREE.Color(e);
    scene.remove(plane2);
    plane2 = new THREE.Mesh(planeGeometry2, planeGeometry2Mat);
    plane2.position.copy(areaLight2.position);
    scene.add(plane2);
  });
  gui.add(params, "intensity2", 0, 1000).onChange(function (e) {
    areaLight2.intensity = e;
  });
  gui.addColor(params, "color3").onChange(function (e) {
    areaLight3.color = new THREE.Color(e);
    planeGeometry3Mat.color = new THREE.Color(e);
    scene.remove(plane3);
    plane3 = new THREE.Mesh(planeGeometry1, planeGeometry3Mat);
    plane3.position.copy(areaLight3.position);
    scene.add(plane3);
  });
  gui.add(params, "intensity3", 0, 1000).onChange(function (e) {
    areaLight3.intensity = e;
  });

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
