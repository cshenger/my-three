<script setup>
import { onMounted } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { TrackballControls } from "three/addons/controls/TrackballControls.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { CopyShader } from "three/examples/jsm/shaders/CopyShader";
import { CustomGrayScaleShader, CustomBitShader } from "./custom-shader.js";
import Stats from "three/addons/libs/stats.module.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { initRenderer, initCamera, initControls, initTrackballControls } from "./utils.js";
import { addShaderControl, addEarth } from "./util-11.js";

let container, camera, scene, renderer, stats, controls, trackballControls, clock, delta, plane, params, operations, gui;
let composer, earth, pivot;

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
  composer.render(delta);
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

  const textureLoader = new THREE.TextureLoader();
  scene.background = textureLoader.load("../../public/textures/bg/starry-deep-outer-space-galaxy.jpg");
  const earthAndLight = addEarth(scene);
  earth = earthAndLight.earth;
  pivot = earthAndLight.pivot;

  // setup effects
  const renderPass = new RenderPass(scene, camera);
  const effectCopy = new ShaderPass(CopyShader);
  const customGrayScale = new ShaderPass(CustomGrayScaleShader);
  const customBit = new ShaderPass(CustomBitShader);
  effectCopy.renderToScreen = true;

  composer = new EffectComposer(renderer);
  composer.addPass(renderPass);
  composer.addPass(customGrayScale);
  composer.addPass(customBit);
  composer.addPass(effectCopy);

  addShaderControl(gui, "CustomGray", customGrayScale, {
    floats: [
      { key: "rPower", from: 0, to: 1, step: 0.01 },
      { key: "gPower", from: 0, to: 1, step: 0.01 },
      { key: "bPower", from: 0, to: 1, step: 0.01 },
    ],
  });
  addShaderControl(gui, "CustomBit", customBit, { floats: [{ key: "bitSize", from: 1, to: 16, step: 1 }] });
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
