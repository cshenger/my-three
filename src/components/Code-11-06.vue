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
import { BokehPass } from "three/examples/jsm/postprocessing/BokehPass";
import { SSAOPass } from "three/examples/jsm/postprocessing/SSAOPass";
import Stats from "three/addons/libs/stats.module.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { initRenderer, initCamera, initControls, initTrackballControls } from "./utils.js";
import { addShaderControl } from "./util-11.js";

let container, camera, scene, renderer, stats, controls, trackballControls, clock, delta, plane, params, operations, gui;
let composer;
let amount = 50;
let xRange = 20,
  yRange = 20,
  zRange = 20;
let totalGroup = new THREE.Group();

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
  totalGroup.rotation.x += 0.0001;
  totalGroup.rotation.y += 0.001;
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// createCorps
function createCorps() {
  setupControls();

  for (let i = 0; i < amount; i++) {
    const boxGeometry = new THREE.BoxGeometry(5, 5, 5);
    const material = new THREE.MeshBasicMaterial({ color: Math.random() * 0xffffff });
    let boxMesh = new THREE.Mesh(boxGeometry, material);

    let rX = Math.random() * xRange - xRange / 2;
    let rY = Math.random() * yRange - yRange / 2;
    let rZ = Math.random() * zRange - zRange / 2;

    let totalRotation = 2 * Math.PI;
    boxMesh.position.set(rX, rY, rZ);
    boxMesh.rotation.set(Math.random() * totalRotation, Math.random() * totalRotation, Math.random() * totalRotation);
    totalGroup.add(boxMesh);
  }

  scene.add(totalGroup);

  const renderPass = new RenderPass(scene, camera);
  const aoPass = new SSAOPass(scene, camera);
  aoPass.renderToScreen = true;

  composer = new EffectComposer(renderer);
  composer.addPass(renderPass);
  composer.addPass(aoPass);

  addShaderControl(gui, "SSAO", aoPass, {
    setEnabled: false,
    // floats: [
    //   { key: "radius", from: 1, to: 10, step: 0.1 },
    //   { key: "aoClamp", from: 0, to: 1, step: 0.01 },
    //   { key: "lumInfluence", from: 0, to: 2, step: 0.01 },
    // ],
    // booleans: [{ key: "onlyAO" }],
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
