<script setup>
import { onMounted } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import Stats from "three/addons/libs/stats.module.js";
import { PLYLoader } from "three/examples/jsm/loaders/PLYLoader";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { initRenderer, initCameraPos, initControls, addGroundPlane } from "./utils.js";

let container, camera, scene, renderer, stats, controls, clock, plane, params;
let step = 0;

// From Three.js examples
function generateSprite() {
  let canvas = document.createElement("canvas");
  canvas.width = 16;
  canvas.height = 16;
  let context = canvas.getContext("2d");

  // draw the sprites
  let gradient = context.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 2);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.2, "rgba(0,255,255,1)");
  gradient.addColorStop(0.4, "rgba(0,0,64,1)");
  gradient.addColorStop(1, "rgba(0,0,0,1)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  // create the texture
  let texture = new THREE.Texture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function init() {
  container = document.getElementById("container");
  scene = new THREE.Scene();

  //创建相机对象
  camera = initCameraPos(new THREE.Vector3(30, 30, 30));
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

  const backlight1 = new THREE.SpotLight(0xffffff);
  backlight1.position.set(150, 40, -20);
  backlight1.intensity = 0.5;
  backlight1.lookAt(new THREE.Vector3(0, 15, 0));
  scene.add(backlight1);

  const backlight2 = new THREE.SpotLight(0xffffff);
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
  camera.lookAt(new THREE.Vector3(0, 0, 0));
  const loader = new PLYLoader();
  loader.load("../../public/models/carcloud/carcloud.ply", (geometry) => {
    const material = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1,
      opacity: 0.6,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      map: generateSprite(),
    });

    const group = new THREE.Points(geometry, material);
    group.scale.set(2.5, 2.5, 2.5);
    scene.add(group);
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
