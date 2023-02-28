<script setup>
import { onMounted } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { TrackballControls } from "three/addons/controls/TrackballControls.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { CopyShader } from "three/examples/jsm/shaders/CopyShader";
import { FilmPass } from "three/examples/jsm/postprocessing/FilmPass";
import { TexturePass } from "three/examples/jsm/postprocessing/TexturePass";
import { BloomPass } from "three/examples/jsm/postprocessing/BloomPass";
import { DotScreenPass } from "three/examples/jsm/postprocessing/DotScreenPass";
import Stats from "three/addons/libs/stats.module.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { initRenderer, initCamera, initControls, initTrackballControls, addGroundPlane } from "./utils.js";
import { addEarth, addBloomPassControls } from "./util-11.js";

let container, camera, scene, renderer, stats, controls, trackballControls, clock, delta, plane, params, operations, gui;
let earth, pivot, bloomComposer;

function init() {
  container = document.getElementById("container");
  scene = new THREE.Scene();

  //创建相机对象
  camera = initCamera(scene);
  renderer = initRenderer(container, { antialias: true, alpha: true });

  // controls
  trackballControls = initTrackballControls(camera, renderer, TrackballControls);
  clock = new THREE.Clock();
  delta = clock.getDelta();

  // stats
  stats = new Stats();
  container.appendChild(stats.dom);
  // AxisHelper
  // const axesHelper = new THREE.AxesHelper(100);
  // scene.add(axesHelper);

  // createCorps
  createCorps();

  window.addEventListener("resize", onWindowResize, false);
}

function render() {
  stats.update();

  animate();
  // render using requestAnimationFrame
  requestAnimationFrame(render);
  bloomComposer.render(delta);
}

function animate() {
  trackballControls.update(delta);
  earth.rotation.y += 0.001;
  pivot.rotation.y += -0.0003;
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// createCorps
function createCorps() {
  setupControls();

  const earthAndLight = addEarth(scene);
  earth = earthAndLight.earth;
  pivot = earthAndLight.pivot;

  // setup effects
  const renderPass = new RenderPass(scene, camera);
  const bloomPass = new BloomPass();
  const effectCopy = new ShaderPass(CopyShader);
  effectCopy.renderToScreen = true;

  bloomComposer = new EffectComposer(renderer);
  bloomComposer.addPass(renderPass);
  bloomComposer.addPass(bloomPass);
  bloomComposer.addPass(effectCopy);

  addBloomPassControls(gui, params, bloomPass, (updated) => {
    bloomComposer = new EffectComposer(renderer);
    bloomComposer.addPass(renderPass);
    bloomComposer.addPass(updated);
    bloomComposer.addPass(effectCopy);
  });
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
