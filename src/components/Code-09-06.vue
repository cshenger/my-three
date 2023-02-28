<script setup>
import { onMounted } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import Stats from "three/addons/libs/stats.module.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { initRenderer, initCamera, initControls, addGroundPlane } from "./utils.js";
import { TrackballControls } from "three/addons/controls/TrackballControls.js";

let container, camera, scene, renderer, stats, controls, trackballControls, clock, plane, params, operations;
let mixer;

function init() {
  container = document.getElementById("container");
  scene = new THREE.Scene();

  //创建相机对象
  camera = initCamera(scene);
  renderer = initRenderer(container);

  // controls
  // controls = initControls(camera, renderer, OrbitControls);
  trackballControls = new TrackballControls(camera, renderer.domElement);
  trackballControls.rotateSpeed = 1.0;
  trackballControls.zoomSpeed = 1.2;
  trackballControls.panSpeed = 0.8;
  trackballControls.noZoom = false;
  trackballControls.noPan = false;
  trackballControls.staticMoving = true;
  trackballControls.dynamicDampingFactor = 0.3;
  trackballControls.keys = [65, 83, 68];

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
  let delta = clock.getDelta();

  trackballControls.update(delta);
  if (mixer) {
    mixer.update(delta);
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// createCorps
function createCorps() {
  const geometry = new THREE.BoxGeometry(5, 5, 5);
  const material = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  // POSITION
  const positionKF = new THREE.VectorKeyframeTrack(".position", [0, 1, 2], [0, 0, 0, 30, 0, 0, 0, 0, 0]);

  // SCALE
  const scaleKF = new THREE.VectorKeyframeTrack(".scale", [0, 1, 2], [1, 1, 1, 2, 2, 2, 1, 1, 1]);

  // set up rotation about x axis
  const xAxis = new THREE.Vector3(1, 0, 0);

  const qInitial = new THREE.Quaternion().setFromAxisAngle(xAxis, 0);
  const qFinal = new THREE.Quaternion().setFromAxisAngle(xAxis, Math.PI);
  const quaternionKF = new THREE.QuaternionKeyframeTrack(".quaternion", [0, 1, 2], [qInitial.x, qInitial.y, qInitial.z, qInitial.w, qFinal.x, qFinal.y, qFinal.z, qFinal.w, qInitial.x, qInitial.y, qInitial.z, qInitial.w]);

  // COLOR
  const colorKF = new THREE.ColorKeyframeTrack(".material.color", [0, 1, 2], [1, 0, 0, 0, 1, 0, 0, 0, 1], THREE.InterpolateDiscrete);

  // OPACITY
  const opacityKF = new THREE.NumberKeyframeTrack(".material.opacity", [0, 1, 2], [1, 0, 1]);

  // create an animation sequence with the tracks
  // If a negative time value is passed, the duration will be calculated from the times of the passed tracks array
  const clip = new THREE.AnimationClip("Action", 3, [scaleKF, positionKF, quaternionKF, colorKF, opacityKF]);

  // setup the THREE.AnimationMixer
  mixer = new THREE.AnimationMixer(mesh);

  // create a ClipAction and set it to play
  const clipAction = mixer.clipAction(clip);
  clipAction.play();

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
