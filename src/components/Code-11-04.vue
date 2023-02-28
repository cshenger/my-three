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
import { ClearMaskPass, MaskPass } from "three/examples/jsm/postprocessing/MaskPass";
import Stats from "three/addons/libs/stats.module.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { initRenderer, initCamera, initControls, initTrackballControls, addGroundPlane } from "./utils.js";
import { addEarth, addMars, addSepiaShaderControls, addColorifyShaderControls } from "./util-11.js";
import { SepiaShader } from "three/examples/jsm/shaders/SepiaShader";
import { ColorifyShader } from "three/examples/jsm/shaders/ColorifyShader";

let container, camera, scene, renderer, stats, controls, trackballControls, clock, delta, plane, params, operations, gui;
let sceneEarth, sceneMars, sceneBG, earthAndLight, marsAndLight, composer;

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
  earthAndLight.earth.rotation.y += 0.001;
  earthAndLight.pivot.rotation.y += -0.0003;
  marsAndLight.mars.rotation.y += -0.001;
  marsAndLight.pivot.rotation.y += +0.0003;
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
  renderer.autoClear = false;

  // create the scenes
  sceneEarth = new THREE.Scene();
  sceneMars = new THREE.Scene();
  sceneBG = new THREE.Scene();

  // create all the scenes we'll be rendering.
  sceneBG.background = textureLoader.load("../../public/textures/bg/starry-deep-outer-space-galaxy.jpg");
  earthAndLight = addEarth(sceneEarth);
  sceneEarth.translateX(-16);
  sceneEarth.scale.set(1.2, 1.2, 1.2);
  marsAndLight = addMars(sceneMars);
  sceneMars.translateX(24);
  sceneMars.translateY(6);
  sceneMars.scale.set(0.2, 0.2, 0.2);

  // setup passes. First the main renderpasses. Note that
  // only the bgRenderpass clears the screen.
  let bgRenderPass = new RenderPass(sceneBG, camera);
  let earthRenderPass = new RenderPass(sceneEarth, camera);
  earthRenderPass.clear = false;
  let marsRenderPass = new RenderPass(sceneMars, camera);
  marsRenderPass.clear = false;

  // setup the mask
  let clearMask = new ClearMaskPass();
  let earthMask = new MaskPass(sceneEarth, camera);
  let marsMask = new MaskPass(sceneMars, camera);

  // setup some effects to apply
  let effectSepia = new ShaderPass(SepiaShader);
  effectSepia.uniforms["amount"].value = 0.8;
  let effectColorify = new ShaderPass(ColorifyShader);
  effectColorify.uniforms["color"].value.setRGB(0.5, 0.5, 1);

  let effectCopy = new ShaderPass(CopyShader);
  effectCopy.renderToScreen = true;

  composer = new EffectComposer(renderer);
  composer.renderTarget1.stencilBuffer = true;
  composer.renderTarget2.stencilBuffer = true;
  composer.addPass(bgRenderPass);
  composer.addPass(earthRenderPass);
  composer.addPass(marsRenderPass);
  composer.addPass(marsMask);
  composer.addPass(effectColorify);
  composer.addPass(clearMask);
  composer.addPass(earthMask);
  composer.addPass(effectSepia);
  composer.addPass(clearMask);
  composer.addPass(effectCopy);

  // controls
  addSepiaShaderControls(gui, params, effectSepia);
  addColorifyShaderControls(gui, params, effectColorify);
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
