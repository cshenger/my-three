<script setup>
import { onMounted } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import Stats from "three/addons/libs/stats.module.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { initRenderer, initCamera, initControls, addGroundPlane } from "./utils.js";
import { BVHLoader } from "../../node_modules/three/examples/jsm/loaders/BVHLoader.js";

let container, camera, scene, renderer, stats, clock, controls, trackballControls, plane, params, operations;
let model, mixer, clipAction, skeletonHelper;
const mixerControls = {
  time: 0,
  timeScale: 1,
  stopAllAction: function () {
    mixer.stopAllAction();
  },
};

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
  scene.add(new THREE.AmbientLight(0x0c0c0c));

  const light1 = new THREE.DirectionalLight(0xefefff, 1.5);
  light1.position.set(1, 1, 1).normalize();
  scene.add(light1);

  const light2 = new THREE.DirectionalLight(0xffefef, 1.5);
  light2.position.set(-1, -1, -1).normalize();
  scene.add(light2);

  // clock
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
  if (mixer) {
    const delta = clock.getDelta(); // 获取自上次调用的时间差
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
  const loader = new BVHLoader();
  loader.load("../../public/models/amelia-dance/DanceNightClub7_t1.bvh", (result, mat) => {
    skeletonHelper = new THREE.SkeletonHelper(result.skeleton.bones[0]);
    skeletonHelper.skeleton = result.skeleton; // allow animation mixer to bind to SkeletonHelper directly
    const boneContainer = new THREE.Object3D();
    boneContainer.scale.set(0.3, 0.3, 0.3);
    boneContainer.translateY(-20);
    boneContainer.add(result.skeleton.bones[0]);
    scene.add(skeletonHelper);
    scene.add(boneContainer);

    console.log(result.clip);
    mixer = new THREE.AnimationMixer(skeletonHelper);
    clipAction = mixer.clipAction(result.clip).setEffectiveWeight(1.0).play();
  });

  setupControls();
}

function setupControls() {
  params = {};

  const gui = new GUI();

  const mixerFolder = gui.addFolder("AnimationMixer");
  mixerFolder.add(mixerControls, "time").listen();
  mixerFolder.add(mixerControls, "timeScale", 0, 5).onChange(function (timeScale) {
    mixer.timeScale = timeScale;
  });
  mixerFolder.add(mixerControls, "stopAllAction").listen();

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
