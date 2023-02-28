<script setup>
import { onMounted } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { TrackballControls } from "../../node_modules/three/examples/jsm/controls/TrackballControls.js";
import Stats from "three/addons/libs/stats.module.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { initRenderer, initCamera, initControls, addGroundPlane, initTrackballControls } from "./utils.js";

let container, camera, scene, renderer, stats, controls, clock, plane, params, operations, trackballControls;

function init() {
  container = document.getElementById("container");
  scene = new THREE.Scene();

  //创建相机对象
  camera = initCamera(scene);
  clock = new THREE.Clock();
  renderer = initRenderer(container);

  // controls
  controls = initControls(camera, renderer, OrbitControls);
  // trackballControls = initTrackballControls(camera, renderer, TrackballControls);
  // stats
  stats = new Stats();
  container.appendChild(stats.dom);
  // AxisHelper
  const axesHelper = new THREE.AxesHelper(100);
  scene.add(axesHelper);

  // add subtle ambient lighting
  const ambientLight = new THREE.AmbientLight(0x0c0c0c);
  scene.add(ambientLight);

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

  // animate();
  // trackballControls.update(clock.getDelta());
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
  /*
  const vertices = [];
  for (let i = 0; i < 10000; i++) {
    const x = THREE.MathUtils.randFloatSpread(2000);
    const y = THREE.MathUtils.randFloatSpread(2000);
    const z = THREE.MathUtils.randFloatSpread(2000);

    vertices.push(x, y, z);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  const material = new THREE.PointsMaterial({ color: 0x888888 });
  const points = new THREE.Points(geometry, material);
  scene.add(points);
  */

  const vertices = [];
  const colors = [];
  const color = new THREE.Color();
  const n = 1000,
    n2 = n / 2; // particles spread in the cube

  for (let x = -15; x < 15; x++) {
    for (let y = -10; y < 10; y++) {
      let r = Math.random() * n - n2;
      let g = Math.random() * n - n2;
      let b = Math.random() * n - n2;
      color.setRGB(r, g, b);
      colors.push(color.r, color.g, color.b);

      let particle = new THREE.Vector3(x * 4, y * 4, 0);
      vertices.push(...particle);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  const material = new THREE.PointsMaterial({ size: 2, vertexColors: true });
  const points = new THREE.Points(geometry, material);
  scene.add(points);

  setupControls();
}

function setupControls() {
  params = new (function () {})();

  const gui = new GUI();

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
